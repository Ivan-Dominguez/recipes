var express = require("express");
var	app = express();
var	bodyParser = require("body-parser");
var	mongoose = require("mongoose");
var unirest = require("unirest");
var methodOverride = require("method-override");

//*************************** APP config ***************************//

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

//*************************** MongoDB setup ***************************//

mongoose.connect("mongodb+srv://ivan:Ivan2009^@cluster0-1qvlq.mongodb.net/recipes?retryWrites=true&w=majority", {
				 useNewUrlParser:true,
				 useCreateIndex: true
				 }).then(()=>{
	console.log("Connected to DB");
}).catch(err => {
	console.log("ERROR:", err.message);
});

var recipeSchema = new mongoose.Schema({
	title: String,
	extendedIngredients: Object,
	image: String,
	instructions: String
});

var Recipe = mongoose.model("Recipe", recipeSchema);

//*************************** Global variables ***************************//

var query_list = {sunday:"Soup", monday:"Sandwich", tuesday:"Stew", wednesday:"Pasta",
					thursday:"Baked", friday:"Eggs", saturday:"Lentils"};
var last_recipe = {title:"", extendedIngredients:[], image:"", instructions: ""};
var diet="vegetarian";

//*************************** RESTful routes ***************************//

//ROOT
app.get("/", function(req, res){
	res.redirect("/recipes");
});

//RECIPE HOME
app.get("/recipes", function(req, res){
	makeAPICall("Soup", "vegetarian", res);
});

//QUERIES FOR EACH DAY OF THE WEEK
app.post("/recipes/sunday", function(req,res){
	query_list.sunday = req.body.query_sunday;
	diet = req.body.diet_radio_option;
	makeAPICall(query_list.sunday, diet, res);
});

app.post("/recipes/monday", function(req,res){
	query_list.monday = req.body.query_monday;
	diet = req.body.diet_radio_option;
	makeAPICall(query_list.monday, diet, res);
});

app.post("/recipes/tuesday", function(req,res){
	query_list.tuesday = req.body.query_tuesday;
	diet = req.body.diet_radio_option;
	makeAPICall(query_list.tuesday, diet, res);
});

app.post("/recipes/wednesday", function(req,res){
	query_list.wednesday = req.body.query_wednesday;
	diet = req.body.diet_radio_option;
	makeAPICall(query_list.wednesday, diet, res);
});

app.post("/recipes/thursday", function(req,res){
	query_list.thursday = req.body.query_thursday;
	diet = req.body.diet_radio_option;
	makeAPICall(query_list.thursday, diet, res);
});

app.post("/recipes/friday", function(req,res){
	query_list.friday = req.body.query_friday;
	diet = req.body.diet_radio_option;
	makeAPICall(query_list.friday, diet, res);
});

app.post("/recipes/saturday", function(req,res){
	query_list.saturday = req.body.query_saturday;
	diet = req.body.diet_radio_option;
	makeAPICall(query_list.saturday, diet, res);
});

//SHOW FAVORITES
app.get("/recipes/favorites", function(req, res){
	Recipe.find({}, function(err, recipes){
		if(err){
			console.log(err);
		}else{
			res.render("favorite_recipes", {recipes:recipes});
		}
	});
});

//ADD TO FAVORITES
app.post("/recipes/favorites", function(req, res){
	var new_recipe = {
		title: last_recipe.title,
		extendedIngredients: last_recipe.extendedIngredients,
		image: last_recipe.image,
		instructions: last_recipe.instructions
	};

	Recipe.create(new_recipe, function(err, new_recipe){
		if(err){
			console.log(err);
		}else{
			console.log("recipe added");
			res.redirect("/recipes/");	
		}
	});	
});

//SHOW ONE OF FAVORITES
app.get("/recipes/favorites/:id", function(req, res){
	Recipe.findById(req.params.id, function(err, found){
		if(err){
			console.log(err);
		}else{
			res.render("show", {recipeInfo:found})
		}
	});	
});

//DELETE A FAVORITE
app.delete("/recipes/favorites/:id", function(req,res){
	console.log("delete route");
	Recipe.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
		}else{
			res.redirect("/recipes/favorites");
		}
	});
});


//******************** SPOONACULAR API's FUNCTIONS ********************//
function makeAPICall(query, diet, res){
	getRecipeID(diet, query)
	.then((recipeID) => {
		return getRecipeInfo(recipeID);
	})
	.then((recipeInfo) => {
		last_recipe.title = recipeInfo.title;
		last_recipe.extendedIngredients = recipeInfo.extendedIngredients;
		last_recipe.image = recipeInfo.image;
		last_recipe.instructions = recipeInfo.instructions;
		
		res.render("index", {recipeInfo, query_list, diet});
	})
	.catch((error)=>{
		console.log(error.message);
	});
}

function getRecipeID(diet, query){
	return new Promise((resolve, reject) => {
		var requestRecipeID = unirest("GET", "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search");
		var host = "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com";
		var key = "c27d293516msh90ec9dbd389e192p193c79jsne8fb26090060";
		var offset = Math.floor((Math.random() * 10)).toString();
		
		requestRecipeID.query({
			"diet": diet,
			"excludeIngredients": "coconut",
			"intolerances": "",
			"number": "1",
			"offset": offset,
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
				var recipeInfo = result.body;
				resolve(recipeInfo);
			}else{
				reject(result.error);
			}
		});
	});
}


const port = process.env.PORT || 8080;
const ip = process.env.IP || "0.0.0.0";
app.listen(port, ip,function(){
    console.log("Recipes Server is listening to port " + port);
});
