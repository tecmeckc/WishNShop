const mongoose=require("mongoose");
const express=require("express");
const Info=require("./createDB.js");
const app=express();
const inform=require("../init/createDB.js");
const Product=require("../models/temp.js");
async function main() {
  await mongoose.connect('mongodb://localhost:27017/wishNget');
}
main().then(()=>{
  console.log("Connection successfull!");
})
.catch(err => console.log(err));
const inItData=async() =>{
  await Product.deleteMany({});
  await Product.insertMany(Info.data);
  console.log("Data was initialized!");

}
inItData();