var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    https = require('https');

var port = 8080;
var io = require('socket.io').listen(createServer(port));
console.log((new Date()) + " Server is listening on port " + port);

// socket.ioサーバー --------------------------------------------------------------------------------------------

io.sockets.on('connection', function(socket) {
    console.log(' [socket] connection start.'+Object.keys(io.of("").manager.roomClients).length);
    socket.on('message', function(message) {
        socket.broadcast.emit('message', message);
    });

    socket.on('disconnect', function() {
        console.log(' [socket] connection disconnect. client num-'+Object.keys(io.of("").manager.roomClients).length);
        socket.broadcast.emit('user disconnected');
    });

});


// HTTPサーバー --------------------------------------------------------------------------------------------

function createServer(port){
    var server = http.createServer(function(req, res) {
        var uri = url.parse(req.url).pathname;
        console.log('[access] '+req.url);
        load_static_file(uri, res);
    });
    return server.listen(port);
}

function load_static_file(uri, response) {
    // 相対パスで静的リソースを配信する。
    var tmp = uri.split('.');
    var type = tmp[tmp.length - 1];
    var filename = path.join(process.cwd(), uri);

    path.exists(filename, function(exists) {
        if (!exists) {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.write('404 Not Found\n');
            response.end();
            return;
        }

        fs.readFile(filename, 'binary', function(err, file) {
            if (err) {
                response.writeHead(500, {'Content-Type': 'text/plain'});
                response.write(err + '\n');
                response.end();
                return;
            }

            switch (type) {
            case 'html':
                response.writeHead(200, {'Content-Type': 'text/html'});
                break;
            case 'js':
                response.writeHead(200, {'Content-Type': 'text/javascript'});
                break;
            case 'css':
                response.writeHead(200, {'Content-Type': 'text/css'});
                break;
            }
            response.write(file, 'binary');
            response.end();
        });
    });
};