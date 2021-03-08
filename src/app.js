const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const connection = require("./db/conn");
const Register = require("./models/model");
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');

//using async bcrypt
// const hashpassword = async(userpw) =>{
// 	//to hash a pw -> bcrypt.hash(input pw , rounds).
// 	const pwhashed = await bcrypt.hash(userpw , 10);
// 	console.log(pwhashed);

// 	//to check for a pw ->bcrypt.compare(input pw , db pw).
// 	const pwmatched = await bcrypt.compare(userpw , pwhashed);
// 	console.log(pwmatched);
// }

// //called the hashing function
// hashpassword("bhavesh123");

//to host out static file style.css
const static_path = path.join(__dirname , '../public');
app.use(express.static(static_path));


//setting template engine
app.set("view engine", "hbs");

const template_path = path.join(__dirname , "../templates/views");
const partials_path = path.join(__dirname , "../templates/partials");

//registered the partial
hbs.registerPartials(partials_path);

//changed the folder from views to the folder at the path in template string
app.set("views", template_path);

//connection to the db
connection;

//to get in json from req.body
app.use(express.json());

//to get the 'name' attribute from the register form
app.use(express.urlencoded({extended:false}));

//cookie-parser
app.use(cookieParser());

//home page
app.get("/",(req,res)=>{
	res.render("index");
})

//added a middleware 'auth'
app.get("/secret", auth ,(req,res)=>{

	//when the authorised user goes to secret route this will be outputted
	console.log(`jwtlogin cookie has this value : ${req.cookies.jwtlogin}`);
	res.render("secret");
})

//localhost/register will render register.hbs 
app.get("/register",(req,res)=>{
	res.render("register");
})

//localhost/login will render login.hbs
app.get("/login",(req,res)=>{
	res.render("login");
})

//log out route for authorised logged in users 
app.get("/logout" , auth ,async(req,res)=>{
	try{
		res.clearCookie("jwtlogin");
		console.log("log out successfully");
					
		req.user.tokens = req.user.tokens.filter((currelem) =>{
			return currelem.token !== req.cookietoken
		})
		
		await req.user.save();
		res.render("login");
	}catch(err){
		res.status(500).send(err);
	}
})

app.post("/register",async(req,res)=>{
	try{
			if(req.body.password === req.body.cpassword){
				const register = new Register({
					firstname : req.body.firstname,
					lastname : req.body.lastname,
					email : req.body.email,
					gender : req.body.gender,
					phone : req.body.phone,
					age : req.body.age,
					password : req.body.password,
					confirmpassword : req.body.cpassword
				})

				//hashing the password here using pre middleware in model.js
				
				//will generate a token in model.js after registering and before saving
				const token = await register.generateAuthToken();
				console.log(token);

				//We will store the token in cookies
				//Using res.cookie(name,value , [options]) , which is a func to set the cookie name to value
				//the value parameter may be a string or object converted to JSON
				res.cookie("jwtregister", token , {
					expires:new Date(Date.now() + 60000), //30000 ms = 30 sec
					httpOnly:true // client side now cant remove the cookie
				});

				const response = await register.save();
				res.status(201).render("index");
				console.log(response);

			}else{
				res.send("Passwords are not matching");
			}

	}catch(err){
		res.status(400).send(err);
	}
})

app.post("/login", async(req,res)=>{
	try{
		const user= await Register.findOne({email:req.body.email})
		//if the email field is req.body.email , then return the matched document
		//console.log(user);
		//console.log(req.body.password);

		const match = await bcrypt.compare(req.body.password , user.password);
		
		// console.log(req.body.password);
		// console.log(user.password);
		// console.log(match);

		//when login in , we will create a token
		const logintoken = await user.generateAuthToken();
		console.log(`Login token is : ${logintoken}`);

		//storing that token in a cookie
		res.cookie("jwtlogin", logintoken , {
			expires:new Date(Date.now() + 30000), //30000 ms = 30 sec
			httpOnly:true // client side now cant remove the cookie
		});


		if(match){
			res.status(201).render("index");
		}else{
			res.send("Invalid login details")
		}	
	}catch(err){
		res.send("Invalid login details").status(400);
	}
})


//jsonwebtoken
// const createtoken = async ()=>{
// 	//to generate a unique token , we will generate a signature
// 	 const token = await jwt.sign({_id:"60435ce33e84200068ec8a98"}, 
// 	 	"abcdefghijklmnopqrstuvwxyzabcdefghijlk", {
// 	 	expiresIn:"2 minutes"
// 	 });
// 	 console.log(token);

// 	 //to verify the token , when user revisits the login page
// 	 const user = await jwt.verify(token, 
// 	 	"abcdefghijklmnopqrstuvwxyzabcdefghijlk");
// 	 console.log(user);

// }

//createtoken();

app.listen(port,()=>{
	console.log(`Server is running on port : ${port}`);

})