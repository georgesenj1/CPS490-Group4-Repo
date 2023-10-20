const express = require('express');
const app = express();
const port = 3000;
app.set('view engine', 'pug');
app.set('views','./views');
// Route handler
app.get('/dynamic_view', (req, res) => {
    res.render('dynamic', {
        name: "Express Notes",
        instructor: "Stiffler",
        url:"https://expressjs.com/"
        });
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
}); 