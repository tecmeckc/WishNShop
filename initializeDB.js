const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Info = require("./Users.js");
const User = require("../models/user.js"); // Ensure this points to your User model

async function main() {
  await mongoose.connect('mongodb://localhost:27017/wishNget');
}

main().then(() => {
  console.log("Connection successful!");
}).catch(err => console.log(err));

const inItData = async () => {
  const usersWithHashedPasswords = await Promise.all(Info.data.map(async (user) => {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    return { ...user, password: hashedPassword };
  }));
  await User.deleteMany();
  await User.insertMany(usersWithHashedPasswords);
  console.log("Data was initialized!");
}

inItData();
