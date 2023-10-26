const express = require('express');
const app = express();
const port = 3000;
app.use((req, res, next) => {
    console.log("A new request received at " + Date.now());
// Notice this function call which indicates that more processing is
// required for the current request and is in the next middleware
// function route handler.
    next();
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})