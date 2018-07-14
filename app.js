let express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");

let route = require("./routes/index");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/node_modules"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

app.use(require("express-session")({
    secret: "abcdefghijklmnopqrstuvwxyz1234567890",
    resave: false,
    saveUninitialized: false
}));
          
app.use("/", route);

app.listen(3001, function() {
    console.log("The YTFame Server has started");
});