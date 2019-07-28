var express = require("express");
var	app = express();
var	bodyParser = require("body-parser");
var	mongoose = require("mongoose");
var unirest = require("unirest");


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


//RESTful routes
app.get("/", function(req, res){
	var recipe="Recipe Here";
	res.render("index", {recipe:recipe});
});



app.post("/sunday", function(req,res){
	//spoonacular API
	const API_KEY = "c27d293516msh90ec9dbd389e192p193c79jsne8fb26090060";
	const INGREDIENT_LIST = ['bananas', 'apples', 'cheese', 'crackers'];
	let requestString = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/find" +
	"ByIngredients?number=1&ranking=1&ingredients=";
	const ingredientsString = INGREDIENT_LIST.map(ingredient =>
	  ingredient + '%2C'
	);
	
	requestString = requestString + ingredientsString;
	
	unirest.get(requestString)
	.header("X-RapidAPI-Key",  API_KEY)
	.end(function (result) {
	  if (result.status === 200){
	    	var recipe = result.body[0];
	    	res.render("index", {recipe:recipe});
	  }else{
	  	console.log("ERROR! Status: " + result.status);
	  };
	});
});



const port = process.env.PORT || 8080;
const ip = process.env.IP || "0.0.0.0";
app.listen(port, ip,function(){
    console.log("Recipes Server is listening to port " + port);
});

