const express = require('express');
const app = express();
const path = require("path")
app.use(express.static(path.join(__dirname, "build")))




let port = process.env.PORT;
if (port == null || port == "") {
    port = 8080;
}

console.log(port)

app.get("*", (req, res) => {
    console.log(path.join(__dirname + "/build/index.html"))
    res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.listen(port, () => {
    console.log("Listening. . .")
});