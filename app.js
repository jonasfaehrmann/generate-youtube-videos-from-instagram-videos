let express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    instaJob = require("./jobs/instagram"),
    youtubeJob = require("./jobs/youtube");

let route = require("./routes/index");

//instaJob();
youtubeJob();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/node_modules"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
          
app.use("/", route);

app.listen(3001, function() {
    console.log("The YTFame Server has started");
});