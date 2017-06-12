var express = require('express');

var https = require('https');

var url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyCR08XNichI4Ss1AkJmNPa8v0n3SGemJrk&cx=007815606599508917406:jpelrinl8ps&searchType=image&q=";

var mongo = require('mongodb').MongoClient;
var mongoURL = "mongodb://ssm123ssm:chandrani123@ds121192.mlab.com:21192/imgsearch";



var app = express();
//var rest;

app.get("/imagesearch/:val", function(req, res){
    var q = encodeURI(req.params.val);
    var offset = req.query.offset;
    var qry = url + q + "?start=" + offset;
    console.log(qry);
    mongo.connect(mongoURL, function(err, db){
        var col = db.collection("last");
        col.insert({"query" : q, "time": new Date()});
    });
    
    var rest = res;
    

    https.get(qry, function(res){
        var body = '';
        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            var resp = JSON.parse(body);
            //console.log(resp.items[0]);
            var imgLink, contLink, snippet;
            var ret = [];
            resp.items.forEach(function(item){
                ret.push({"image_link":item.link, "page": item.image.contextLink, "snippet" : item.snippet, "thumbnail":item.image.thumbnailLink});
            });
            rest.jsonp({"results":ret});
            //rest.jsonp(resp);
        });
    }).on('error', function(e){
          console.log("Got an error: ", e);
        rest.jsonp({"error" : "couldn't get results"});
    });
    
    
});
app.get("/latest/imagesearch", function(req,res){
    var resp = res;
    mongo.connect(mongoURL, function(err, db){
        var col = db.collection("last");
        col.find({},{_id:0}).limit(10).sort({_id:-1}).toArray(function(err, item){
                 console.log(item);
                resp.jsonp({"last": item});
        });
    });
});


app.get("/", function(req, res){
    res.send("hello");
});
app.listen(process.env.PORT || 80);

