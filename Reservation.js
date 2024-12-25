const mongoose = require("mongoose");



const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
  location: { type: String, required: true },
  reservationTime: { type: Date, default: Date.now },
  pickupDay: { type: String, required: true }, // e.g., "2024-10-31"
  pickupTime: { type: String, required: true }, // e.g., "10:30 AM"
  quantity: { type: Number, required: true }
});

module.exports = mongoose.model("Reservation", reservationSchema);
