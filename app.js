
var express = require("express");
var app = express();

var bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: true }));

var mongodb = require("mongodb");
var mongoclient = mongodb.MongoClient;
var url = "mongodb://127.0.0.1:27017/sampledb";

var session = require('express-session');
app.use(session({ secret: 'minu', saveUninitialized: true, resave: true }));

app.set("view engine", "ejs");

var Admin = require("./Routes/Admin");
var User = require("./Routes/User");


app.get("/", function (req, res) {
    res.render("Login");
});

app.post("/login", function (req, res) {
    var uname = req.body.uname;
    var password = req.body.password
    req.session.uname = uname;
    req.session.password = password;
    mongoclient.connect(url, function (err, database) {
        var db = database.db("project");
        var collection = db.collection("login");
        collection.find({ "fname": uname, "password": password }).toArray(function (err, result) {
            if (result == "") {
                console.log("invalid username and password")
                res.redirect("/");
            }
            else {
                res.render("Home", { "user": uname });
            }

        })
    })
})
app.get("/sign", function (req, res) {
    res.render("Registration");
})

app.post("/register", function (req, res) {
    mongoclient.connect(url, function (err, database) {
        var db = database.db("project");
        var collection = db.collection("login");
        var newdata = { "fname": req.body.fname, "lname": req.body.lname, "mobile": req.body.mobile, "dob": req.body.dob, "password": req.body.password }
        collection.insert(newdata, function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("successfully registered")
                res.render("Login");
            }
        });
    })

})
app.get("/logout",function(req,res){
    req.session.destroy();
    res.redirect("/");
})

app.use("/admin", Admin);
app.use("/user", User);


app.listen(8000, function (req, res) {
    console.log("server startd....");
});