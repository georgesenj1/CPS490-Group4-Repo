const express = require('express');
const app = express();
const port = 3000;
app.set('view engine', 'pug');
app.set('views','./views');
// Route handler
app.get('/content', (req, res) => {
res.render('content');
});
app.listen(port, () => {
console.log(`Example app listening on port ${port}`);
});