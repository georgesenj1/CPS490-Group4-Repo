const express = require('express');
const app = express();
const port = 3000;
// Prior to response
app.use((req, res, next) => {
    console.log("Start");
    next();
});
// Route handler
app.get('/', (req, res, next) => {
    res.send('Middle');
    next();
});
app.use('/', (req, res) => {
    console.log('End');
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});