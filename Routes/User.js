
var express = require("express");
var router = express.Router();

var bodyparser = require("body-parser");
router.use(bodyparser.urlencoded({ extended: true }));

var session = require("express-session");
router.use(session({ secret: 'minu', saveUninitialized: true, resave: true }))

var mongodb = require("mongodb");
var mongoclient = mongodb.MongoClient;
var url = "mongodb://127.0.0.1:27017/sampledb";

router.get("/new", function (req, res) {
    res.render("Add");
});


var checkseat = function (req, res, next) {
    mongoclient.connect(url, function (err, database) {
        var db = database.db("project");
        var collection = db.collection("movie");
        collection.find({ "mname": req.body.mname }, { "seats": 1, "reserved": 1, _id: 0 }).toArray(function (err, result) {
            var seats = result[0].seats;
            console.log("seats1:" + seats);
            var sno = req.body.sno;
            console.log("sno1:" + sno);
            var reserved = result[0].reserved;
            console.log("reserved1:" + reserved);
            var vacant = (seats - reserved);
            console.log("vacant1:" + vacant);

            req.session.reserved = result[0].reserved;

            if (vacant <= sno) {
                console.log("seats are not available");
            }
            else {
                console.log("seats are available");
                next();
            }
        })
    })
}

var updateseat = function (req, res, next) {
    mongoclient.connect(url, function (err, database) {
        var db = database.db("project");
        var collection = db.collection("movie");
        var reserve=parseInt(req.session.reserved);
        var sno=parseInt(req.body.sno)
        var reserved = (sno + reserve );
        req.session.reserved = reserved;
        console.log("reserved in next:" + reserved);
        collection.update({ "mname": req.body.mname }, { $set: { "reserved": reserved } }, function (err, result) {
            if (err) {
                console.log(err)
            }
            else {
                next();
            }
        })
    })
}

var updateseatdel=function(req,res,next){
    mongoclient.connect(url, function (err, database) {
        var db = database.db("project");
        var collection = db.collection("movie");
        var reserve=parseInt(req.session.reserved);
        var useat=parseInt(req.session.useats)
        var reserved = (reserve-useat);
        console.log("reserved in next:" + reserved);
        collection.update({ "mname": req.body.mname }, { $set: { "reserved": reserved } }, function (err, result) {
            if (err) {
                console.log(err)
            }
            else {
                next();
            }
        })
    })

}

router.get("/viewmovies", function (req, res) {
    mongoclient.connect(url, function (err, database) {
        var db = database.db("project");
        var collection = db.collection("movie");
        collection.find().toArray(function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                var act = "view"
                res.render("viewMovies", { "data": result, "act": act });
            }
        })
    })
})


router.get("/book", function (req, res) {
    mongoclient.connect(url, function (err, database) {
        var db = database.db("project");
        var collection = db.collection("movie");
        collection.find({}, { "mname": 1,"rate":1, _id: 0 }).toArray(function (err, result) {
            if (err) {
                console.log(err)
            }
            else {
                res.render("addUser", { "data": result });
                console.log(result);
            }
        });
    })
})



router.post("/addshow", checkseat, updateseat, function (req, res) {
    var uname = req.session.uname;
    var useats = req.body.sno;
    var mname = req.body.mname;
    var price=req.body.tot_amount;
    mongoclient.connect(url, function (err, database) {
        var db = database.db("project");
        var collection = db.collection("user");
        var newdata = { "username": uname, "mname": mname, "useats": useats ,"price":price}
        collection.insert(newdata, function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                res.redirect("/user/view");
            }
        });
    })

})

router.get("/view", function (req, res) {
    var uname = req.session.uname;
    mongoclient.connect(url, function (err, database) {
        var db = database.db("project");
        var collection = db.collection("user");
        collection.find({ "username": uname }).toArray(function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                res.render("viewUser", { "data": result });
            }
        })
    })
})


router.get("/delete",function(req,res){
    console.log("in delete")
    var uname = req.session.uname;
    mongoclient.connect(url,function(err,database){
        var db=database.db("project");
        var collection=db.collection("user");
        collection.find({ "username": uname }).toArray(function (err, result) {
            if(err){
                console.log(err)
            }
            else{ 
                req.session.useats = result[0].useats
                res.render("deleteUser",{"data":result});
                console.log(result);
            }
        });
    })
})

router.post("/deleteshow",updateseatdel,function(req,res){
    var uname = req.session.uname;
    mongoclient.connect(url,function(err,database){
        var db=database.db("project");
        var collection=db.collection("user");
        collection.remove({$and:[{"mname":req.body.mname},{"username":uname}]},function(err,result){
            if(err){
                console.log(err);
            }
            else{
                console.log(result);
                res.redirect("/user/view");
            }
        });
    })
})

router.get("/edit",function(req,res){
    var uname = req.session.uname;
    mongoclient.connect(url,function(err,database){
        var db=database.db("project");
        var collection=db.collection("user");
        collection.find({ "username": uname }).toArray(function (err, result) {
            if(err){
                console.log(err)
            }
            else{
                res.render("editUser",{"data":result});
                console.log(result);
            }
        });
    })
})


router.post("/editshow",function(req,res){
    var mname=req.body.mname;
    console.log("movie name is"+mname);
    mongoclient.connect(url,function(err,database){
        var db=database.db("project");
        var collection=db.collection("user");
        collection.find({"mname":mname}).toArray(function(err,result){
            if(err){
                console.log(err);
            }
            else{
                console.log(result);
                res.render("updateUser",{"data":result});
            }
        });
    })
})


router.post("/update",function(req,res){
    var uname = req.session.uname;
    mongoclient.connect(url,function(err,database){
        var db=database.db("project");
        var collection=db.collection("user");
        collection.update({$and:[{"mname":req.body.mname},{"username":uname}]},{$set:{"mname": mname, "useats": useats ,"price":price}},function(err,result){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/user/view");
            }
        });
    })

})

module.exports = router;