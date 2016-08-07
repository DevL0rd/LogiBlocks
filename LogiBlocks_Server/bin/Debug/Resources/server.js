var http = require('http');
var fs = require('fs');
var url = require('url');
var os = require('os');
var clientids = 0
var interfaces = os.networkInterfaces();
var addresses = [];
var ext = "";
var ipcount = 0;
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
            ipcount++;
        }
    }
}
ipcount--;
var portnum = 8081
var serverip = addresses[ipcount].toString()
// Create a server
http.createServer( function (request, response) {  
   // Parse the request containing file name
   var pathname = url.parse(request.url).pathname;
   if (pathname.substr(1) == ""){
       pathname = "/Resources/index.html";
       clientids++
       console.log("Connection established. ID:" + clientids);
   } else {
       // Print the name of the file for which request is made.
       console.log("New file request: (" + pathname + ")");
   }
   // Read the requested file content from file system
   fs.readFile(pathname.substr(1), function (err, data) {
      if (err) {
         console.log(err);
         // HTTP Status: 404 : NOT FOUND
         // Content Type: text/plain
         response.writeHead(404, { 'Content-Type': 'text/html' });
         response.end(err);
      }else{	
         //Page found	  
         // HTTP Status: 200 : OK
          // Content Type: text/plain
          ext = pathname.substr(1).split('.').pop()
          if (ext == "html" || ext == "htm" || ext == "js") {
			 response.writeHead(200, {'Content-Type': 'text/html'});
			 response.end(data.toString());
          } else if (ext == "png") {
			 response.writeHead(200, {'Content-Type': 'image/png'});
			 var img = fs.readFileSync(pathname.substr(1));
			 response.end(img, 'binary');
          } else if (ext == "ico") {
		     response.writeHead(200, { 'Content-Type': 'image/ico' });
		     var img = fs.readFileSync(pathname.substr(1));
		     response.end(img, 'binary');
		 }
		 console.log("File (" + pathname + ") sent successfully!");
         // Write the content of the file to response body
      }
      // Send the response body 
   });   
}).listen(portnum, serverip);
// Console will print the message
console.log('Server running! (' + serverip + ':' + portnum + ')');