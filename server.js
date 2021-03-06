const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const process = require('process');
const cors = require('cors');
const port = process.env.PORT || 5000;


dotenv.config({ path: './.env' });

const db = require('./models/mysql').mySQL;
db.util.getConnection(function (error) {
    if (error) {
        console.log(error);
    } else {
        console.log("MySQL is Connected");
    }
});
const mongodb = require('./models/MongoDb');

mongodb.init(function () {
    console.log("MongoDB is Connected");
});


const http = require('http');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
const app = express();
var server = http.createServer(app);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, './public')));
app.use(helmet());
app.use(function (req, res, next) {
    res.setHeader(
        'Content-Security-Policy',
        "default-src *; style-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline'; script-src 'self' https://cdnjs.cloudflare.com https://ajax.googleapis.com 'unsafe-inline' 'unsafe-eval' http://www.google.com"
    );
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    console.log("Access-Control-Allow-Headers: " + res.getHeader("Access-Control-Allow-Headers"));
    next();
}
);
app.use(cookieParser());
var corsOptions = {
    origin: '',
    optionsSuccessStatus: 200, // For legacy browser support
    methods: "GET, POST"
}
app.use(cors(corsOptions))
app.use(limiter);
app.use(express.json()); //CORS error?
app.use('/acc', require('./controllers/account'));
app.use('/', require('./controllers/navigation'));
app.use('/', require('./controllers/injector'));
app.use('/', require('./controllers/predictor'));
app.use('/', require('./controllers/recommender'));
app.use('/', require('./controllers/skilltreeBuilder'));
app.use('/', require('./controllers/skillsList'));
app.use('/', require('./controllers/linksPocket'));

server.listen(port, function () {
    console.log("Server listening on port: " + port);

    //periodic non-nodemon functions to make the system self-reliant - needs to be tested on a real server
    const injectController = require('./api/injector').injector;
    const buildController = require('./api/skilltreeBuilder').skillTreeBuilder;
    const jsonController = require('./api/JsonOperations').jsonOperations;
    setInterval(async function () {
        console.log("every 1.6 hours visit 50 discovered links 5760000");
        // await injectController.createLearningResoruces(null, null);
    }, 5760000);
    setInterval(async function () {
        console.log("every 24 hours update the skills list 86400000");
        // await buildController.buildTree(null, null, null);
    }, 86400000);
    setInterval(async function () {
        console.log("every around a week, clean blocked links 600000000");
        // await jsonController.deleteBlockedLinks();
    }, 600000000);

    // setTimeout(async function () {
    //     console.log("5000"); //BACKHERE import blockedLinks from ..\Graduation_Project\Project\blockedLinks.json
    //     // console.log(await jsonController.getBlockedLinks()); // instead of getting all the blocked list, compare a link with the mongodb collection
    // }, 5000);
});

process.stdin.resume();
//to close connection with with mongodb once the session is over
async function exitHandler(options, exitCode) {
    await mongodb.close();
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

process.on('exit', exitHandler.bind(null, { cleanup: true }));
process.on('SIGINT', exitHandler.bind(null, { exit: true }));//ctrl+c event
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));