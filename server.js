const express = require('express'),
    server = express();

//setting the port.
server.set('port', process.env.PORT || 3000);

server.use(express.static('app'));
server.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('Express server started at port 3000');
});
