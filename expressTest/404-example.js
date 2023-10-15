const express = require('express');
const app = express();
const port = 3000;
//Other routes MUST come before this
app.get('*', (req, res) => {
    res.send('Sorry, this is an invalid URL.');
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});