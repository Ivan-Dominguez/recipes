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


//********** RESTful routes **********//
app.get("/", function(req, res){
	var recipe="Recipe Here";
	res.render("index", {recipe:recipe});
});

app.post("/sunday", function(req,res){
	var query = req.body.query;
	makeAPICall(query,res);
});

function makeAPICall(query,res){
	getRecipeID(query)
	.then((recipeID) => {
		return getRecipeInfo(recipeID);
	})
	.then((recipeInfo) => {
		renderRecipe(recipeInfo, res);
	})
	.catch((error)=>{
		console.log(error.message);
	});
}

function getRecipeID(query){
	return new Promise((resolve, reject) => {
		var requestRecipeID = unirest("GET", "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search");
		var host = "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com";
		var key = "c27d293516msh90ec9dbd389e192p193c79jsne8fb26090060";
		
		requestRecipeID.query({
			"diet": "vegetarian",
			"excludeIngredients": "coconut",
			"intolerances": "",
			"number": "10",
			"offset": "0",
			"type": "main course",
			"query": query
		});
		
		requestRecipeID.headers({
			"x-rapidapi-host": host,
			"x-rapidapi-key": key
		});
		
		requestRecipeID.end(function (result) {
			if (!result.error){
				var recipeID = result.body.results[0].id;
				resolve(recipeID);
			}else{
				reject(result.error);
			}
		});	
	}); 
}

function getRecipeInfo(recipeID){
	return new Promise((resolve, reject) => {
		var requestRecipeInfo = unirest("GET", "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/" +
								recipeID + "/information");
	
		requestRecipeInfo.headers({
			"x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
			"x-rapidapi-key": "c27d293516msh90ec9dbd389e192p193c79jsne8fb26090060"
		});
		
		requestRecipeInfo.end(function (result) {
			if (!result.error){
				var recipeInfo = result.body.title;
				resolve(recipeInfo);
			}else{
				reject(result.error);
			}
		});
	});
}

function renderRecipe(recipeInfo, res){
	console.log("info: "+ recipeInfo);
	res.render("index", {recipe:recipeInfo});
}

const port = process.env.PORT || 8080;
const ip = process.env.IP || "0.0.0.0";
app.listen(port, ip,function(){
    console.log("Recipes Server is listening to port " + port);
});
