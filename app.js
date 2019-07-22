var express = require("express");
	app = express();
	bodyParser = require("body-parser");
	mongoose = require("mongoose");


mongoose.connect("mongodb+srv://ivan:Ivan2009^@cluster0-1qvlq.mongodb.net/yelpcamp?retryWrites=true&w=majority", {
				 useNewUrlParser:true,
				 useCreateIndex: true
				 }).then(()=>{
	console.log("Connected to DB");
}).catch(err => {
	console.log("ERROR:", err.message);
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//Schema setup
var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String
});

var Campground = mongoose.model("Campground", campgroundSchema);

app.get("/", function(req, res){
	res.render("landing");
});

app.get("/campgrounds", function(req, res){
	//get all campgrounds from DB
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		}else{
			res.render("index", {campgrounds:allCampgrounds});
		}
	});
	
});

app.post("/campgrounds", function(req, res){
	//get data from form and add to camground DB
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var newCampground = {name:name, image:image, description:desc};

	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		}else{
			res.redirect("/campgrounds");	
		}
	});	
});

app.get("/campgrounds/new", function(req, res){
	res.render("new");
});

//Show more info bout one campground
app.get("/campgrounds/:id", function(req,res){
	
	//find campground with provided id
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			console.log(err);
		}else{
			res.render("show", {campground:foundCampground});
		}
	});
});


const port = process.env.PORT || 9000;
const ip = process.env.IP || "127.0.0.1";
app.listen(port,function(){
    console.log("YelpCamp Server is listening");
});


