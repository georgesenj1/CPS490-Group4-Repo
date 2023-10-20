const express = require('express');
const app = express();
const port = 3000;
const routes = require('./routes.js');
//both router-index.js and routes.js should be in same directory
app.use('/test', routes);
app.listen(port, () => {
console.log(`Example app listening on port ${port}`);
});