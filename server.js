const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const db = require('./models/db');
db.util.connect(function (error) {
    if (error) {
        console.log(error);
    } else {
        console.log("MySQL is Connected");
    }
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
        next();
    }
);
app.use(cookieParser());
app.use(limiter);
app.use(express.json());
app.use('/acc', require('./controllers/acc'));
app.use('/', require('./controllers/nav'));
app.use('/', require('./controllers/injector'));
app.use('/', require('./controllers/predictor'));
app.use('/', require('./controllers/recommender'));
app.use('/', require('./controllers/skilltreeBuilder'));
app.use('/', require('./controllers/skills'));
app.use('/', require('./controllers/linksPocket'));

server.listen(8000, function () {
    console.log("Server listening on port: 8000");
    
    //periodic non-nodemon functions to make the system self-reliant
    const injectController = require('./api/injector');
    const buildController = require('./api/skilltreeBuilder');
    const jsonController = require('./api/jsonOps');
    setInterval(function() {
        console.log("every 3 hours visit 50 discovered links 10800000");
        injectController.createLearningResoruces(null, null);
    }, 10800000);
    setInterval(function() {
        console.log("every 24 horus update the skills list 86400000");
        buildController.buildTree(null, null, null);
    }, 86400000);
    setInterval(function() {
        console.log("every week, clean blocked links 604800000");
        jsonController.deleteBlockedLinks();
    }, 604800000);
});