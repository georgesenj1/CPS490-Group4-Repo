const express = require('express');
const app = express();
const port = 3000;
app.set('view engine', 'pug');
app.set('views','./views');
app.use(express.static('public'));
// Route handler
app.get('/static', (req, res) => {
res.render('static', {});
});
app.listen(port, () => {
console.log(`Example app listening on port ${port}`);
});