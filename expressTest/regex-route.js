const express = require('express');
const app = express();
const port = 3000;
app.get('/:id([0-9A-F]{4})', (req, res) => {
    res.send('id: ' + req.params.id);
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});