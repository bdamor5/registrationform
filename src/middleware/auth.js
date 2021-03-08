const jwt = require("jsonwebtoken");
//since our collection register is in model.js , without requiring it we cant access the documents.
const register = require("../models/model");

//the middleware recieves req,res,next arguments
const auth = async (req, res, next)=>{
	try{
		const cookietoken = req.cookies.jwtlogin;
		const user = jwt.verify(cookietoken, process.env.SECRET_KEY);
		//console.log(user);

		const userdoc = await register.findOne({_id:user._id});
		//console.log(userdoc);
		//console.log(userdoc.age);

		req.cookietoken = cookietoken;
		req.user = user;

		next();

	}catch(err){
		res.send(err).status(401);
	}

}

module.exports = auth;