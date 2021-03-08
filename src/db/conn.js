const mongoose = require("mongoose");

const connection = mongoose.connect("mongodb://localhost:27017/employee",{
	useNewUrlParser:true,
	useUnifiedTopology:true,
	useCreateIndex:true
}).then( ()=>{
	console.log("Connection to the db is established")
}).catch((err)=>{
	console.log("Connection to the db failed");
});

module.exports = connection;