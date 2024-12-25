// models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

// Ensure no additional hashing in a pre-save hook
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next(); // Skip if password hasn't changed
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

module.exports = mongoose.model("User", userSchema);
