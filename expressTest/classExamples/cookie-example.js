const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3000;
app.use(cookieParser());
app.get('/', (req, res) => {
res.cookie('name', 'express').send('cookie set'); //Sets name = express
console.log('Cookies: ', req.cookies);
});
app.listen(port, () => {
console.log(`Example app listening on port ${port}`);
});