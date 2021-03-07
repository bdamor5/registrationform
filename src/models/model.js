const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
	firstname:{
		type:String,
		required:true
	},
	lastname:{
		type:String,
		required:true
	},
	email:{
		type:String,
		required:true
	},
	gender:{
		type:String,
		required:true
	},
	phone:{
		type:String,
		required:true
	},
	age:{
		type:String,
		required:true
	},
	password:{
		type:String,
		required:true
	},
	confirmpassword:{
		type:String,
		required:true
	},
	tokens:[{
		token:{
			type:String,
			required:true
		}
	}]

})

//generating tokens with the help of middlewares
employeeSchema.methods.generateAuthToken = async function(){
	try{
		const usertoken = jwt.sign({_id:this._id.toString()}, 
			process.env.SECRET_KEY);
		
		this.tokens = this.tokens.concat({token:usertoken});
		
		await this.save(); //to save the token in document
		
		return usertoken;

		this.confirmpassword = undefined;
	}catch(err){
		res.send(err);
	}

}

//using a pre middleware with next to hash passwords
employeeSchema.pre("save" , async function(next){
	if(this.isModified("password")){
		console.log(`User pw is : ${this.password}`);

		this.password = await bcrypt.hash(this.password , 10);

		console.log(`hashed pw is : ${this.password}`);

		this.confirmpassword = await bcrypt.hash(this.confirmpassword , 10);
	}
	next();
})

const Register = new mongoose.model("Register" , employeeSchema);

module.exports = Register
