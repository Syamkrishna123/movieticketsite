
var express=require("express");
var router=express.Router();

var bodyparser=require("body-parser");
router.use(bodyparser.urlencoded({extended:true}));

var mongodb=require("mongodb");
var mongoclient=mongodb.MongoClient;
var url="mongodb://127.0.0.1:27017/sampledb";

router.get("/new",function(req,res){
    res.render("Add");
});

router.get("/view",function(req,res){
    mongoclient.connect(url,function(err,database){
        var db=database.db("project");
        var collection=db.collection("movie");
        collection.find().toArray(function(err,result){
            if(err){
                console.log(err);
            }
            else{
                res.render("View",{"data":result});
            }
        })
    })
})

router.post("/addmovie",function(req,res){
    mongoclient.connect(url,function(err,database){
        var db=database.db("project");
        var collection=db.collection("movie");
        collection.insert({"mname":req.body.mname,"dname":req.body.dname,"lang":req.body.lang,"staring":req.body.staring,
        "seats":req.body.seats,"reserved":req.body.reserved,"rate":req.body.rate,"timing":req.body.timing},function(err,result){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/admin/view");
            }
        });
    })

})

router.get("/delete",function(req,res){
    mongoclient.connect(url,function(err,database){
        var db=database.db("project");
        var collection=db.collection("movie");
        collection.find({},{"mname":1,_id:0}).toArray(function(err,result){
            if(err){
                console.log(err)
            }
            else{
                res.render("Delete",{"data":result});
                console.log(result);
            }
        });
    })
})

router.post("/deleteshow",function(req,res){
    mongoclient.connect(url,function(err,database){
        var db=database.db("project");
        var collection=db.collection("movie");
        collection.remove({"mname":req.body.mname},function(err,result){
            if(err){
                console.log(err);
            }
            else{
                console.log(result);
                res.redirect("/admin/view");
            }
        });
    })
})

router.get("/edit",function(req,res){
    mongoclient.connect(url,function(err,database){
        var db=database.db("project");
        var collection=db.collection("movie");
        collection.find({},{"mname":1}).toArray(function(err,result){
            if(err){
                console.log(err)
            }
            else{
                res.render("Edit",{"data":result});
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
        var collection=db.collection("movie");
        collection.find({"mname":mname}).toArray(function(err,result){
            if(err){
                console.log(err);
            }
            else{
                console.log(result);
                res.render("Update",{"data":result});
            }
        });
    })
})


router.post("/update",function(req,res){
    mongoclient.connect(url,function(err,database){
        var db=database.db("project");
        var collection=db.collection("movie");
        collection.update({"mname":req.body.mname},{$set:{"dname":req.body.dname,"lang":req.body.lang,"staring":req.body.staring,
        "seats":req.body.seats,"rate":req.body.rate,"timing":req.body.timing}},function(err,result){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/admin/view");
            }
        });
    })

})

module.exports=router;