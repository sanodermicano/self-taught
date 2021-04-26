var forever = require('forever-monitor');
var child = new (forever.Monitor)('server.js', {
    max: 999,
    silent: false,
    options: []
});

child.on('exit', function () {
    console.log('server.js has exited after 3 restarts');
});

//if not using the skilltree builder operations, use npm run devStart
//run this script and to exit:
//taskkill /F /IM node.exe

child.start();