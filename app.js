var express = require("express");
var	app = express();
var	bodyParser = require("body-parser");
var	mongoose = require("mongoose");
var unirest = require("unirest");

//*************************** APP config ***************************//
app.use(express.static("public"));
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


var query_list = {sunday:"Soup", monday:"Sandwich", tuesday:"Stew", wednesday:"Pasta",
					thursday:"Baked", friday:"Eggs", saturday:"Lentils"};
var diet="";

//*************************** RESTful routes ***************************//
app.get("/", function(req, res){
	var recipeInfo = {title:"Title: ", extendedIngredients:[], instructions: ""};
	res.render("index", {recipeInfo,query_list});
});

app.post("/sunday", function(req,res){
	query_list.sunday = req.body.query_sunday;
	diet = req.body.diet_radio_option;
	makeAPICall(query_list.sunday, diet, res);
});

app.post("/monday", function(req,res){
	query_list.monday = req.body.query_monday;
	diet = req.body.diet_radio_option;
	makeAPICall(query_list.monday, diet, res);
});

app.post("/tuesday", function(req,res){
	query_list.tuesday = req.body.query_tuesday;
	diet = req.body.diet_radio_option;
	makeAPICall(query_list.tuesday, diet, res);
});

app.post("/wednesday", function(req,res){
	query_list.wednesday = req.body.query_wednesday;
	diet = req.body.diet_radio_option;
	makeAPICall(query_list.wednesday, diet, res);
});

app.post("/thursday", function(req,res){
	query_list.thursday = req.body.query_thursday;
	diet = req.body.diet_radio_option;
	makeAPICall(query_list.thursday, diet, res);
});

app.post("/friday", function(req,res){
	query_list.friday = req.body.query_friday;
	diet = req.body.diet_radio_option;
	makeAPICall(query_list.friday, diet, res);
});

app.post("/saturday", function(req,res){
	query_list.saturday = req.body.query_saturday;
	diet = req.body.diet_radio_option;
	makeAPICall(query_list.saturday, diet, res);
});


//******************** API's functions ********************//
function makeAPICall(query, diet, res){
	getRecipeID(diet, query)
	.then((recipeID) => {
		return getRecipeInfo(recipeID);
	})
	.then((recipeInfo) => {
		res.render("index", {recipeInfo,query_list});
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
