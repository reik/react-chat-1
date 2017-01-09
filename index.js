const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'src', 'static')));

app.get('/', function response(req, res) {
    res.sendFile(path.join(__dirname, 'src', 'static', 'index.html'));
});

app.listen(port, function() {});