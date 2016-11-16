//SimpleServer 0.0.1
//Author Name: Dustin Harris
//Work Email:duharris@ebay.com
//Personal Email:dmhzmxn@gmail.com
//*********************************
//
//

var http = require('http');
var fs = require('fs');
var url = require('url');
var os = require('os');

var interfaces = os.networkInterfaces();
var addresses = [];
var reportfilesent = false;

//Include DevLord Libs.
//*********************
console.log("Loading Plugins...")
var SimpleChat = require('./SimpleChatServer.js')
//Include 3RD Party Libs.
//***********************


function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
var portnum = 8081
var serverip = addresses.toString()
// Create a server
var server = http.createServer(function (request, response) {
    // Parse the request containing file name
    var pathname = url.parse(request.url).pathname;
    if (pathname.substr(1) == "") {
        pathname = "/index.html";
    }
    try {
        if (fs.existsSync('WebRoot/' + pathname.substr(1))) {
            // Read the requested file content from file system
            fs.readFile('WebRoot/' + pathname.substr(1), function (err, data) {
                if (pathname.substr(1).split('.').pop() == "html" || pathname.substr(1).split('.').pop() == "htm" || pathname.substr(1).split('.').pop() == "js") {
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    response.end(data.toString());
                    reportfilesent = true
                } else if (pathname.substr(1).split('.').pop() == "png") {
                    response.writeHead(200, { 'Content-Type': 'image/png' });
                    response.end(data, 'binary');
                    reportfilesent = true
                } else if (pathname.substr(1).split('.').pop() == "ico") {
                    response.writeHead(200, { 'Content-Type': 'image/ico' })
                    response.end(data, 'binary');
                    reportfilesent = true
                } else if ((pathname.substr(1).split('.').pop() == "dat" || pathname.substr(1).split('.').pop() == "ts")) {
                    response.writeHead(200, {
                        'Content-Type': 'text/html',
                        'Content-Length': data.length,
                        'Accept-Ranges': 'bytes',
                        'Cache-Control': 'no-cache'
                    });
                    response.end(data.toString());
                } else if ((pathname.substr(1).split('.').pop() == "exe")) {
                    response.writeHead(200, {
                        'Content-Type': 'application/x-msdownload',
                        'Content-Length': data.length,
                        'Accept-Ranges': 'bytes',
                        'Cache-Control': 'no-cache'
                    });
                    reportfilesent = true;
                    response.end(data);
                };

                if (reportfilesent) {
                    console.log("File (" + pathname + ") requested and sent!");
                    reportfilesent = false;
                };
            });
        } else if ((pathname.substr(1).split('*P*').pop() == "postcommand")) {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            var responsestr = SimpleChat.PostChat_Encoded(pathname.substr(1).split('*P*')[0]);
            response.end(responsestr);
        } else {
            console.log("File requested (" + pathname.substr(1) + ") does not exist!");
            // HTTP Status: 404 : NOT FOUND
            // Content Type: text/plain
            response.writeHead(404, { 'Content-Type': 'text/html' });
            response.end("File (" + 'WebRoot/' + pathname.substr(1) + ") does not exist!");
        };
    } catch (err) {
        console.log(err.message);
        response.writeHead(404, { 'Content-Type': 'text/html' });
        response.end(err.message);
    };

});
server.on('error', function (err) {
    console.log(err.message);
});
server.on('uncaughtException', function (err) {
    console.log(err.message);
});

server.listen(portnum, serverip);
console.log('Server running! (' + serverip + ':' + portnum + ')');
