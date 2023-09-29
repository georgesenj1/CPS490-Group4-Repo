const express = require('express');
const app = express();
const port = 3000;
app.get('/hello', (req, res) => {
res.send("Hello World!");
});
app.post('/hello', (req, res) => {
res.send("You just called the post method at '/hello'!\n");
});
app.listen(port, () => {
console.log(`Example app listening on port ${port}`);
});