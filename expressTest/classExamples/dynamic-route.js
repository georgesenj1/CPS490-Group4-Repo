const express = require('express');
const app = express();
const port = 3000;
app.get('/:course/:num', (req, res) => {
    res.send('Welcome to ' + req.params.course + ' ' + req.params.num);
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});