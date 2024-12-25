const mongoose=require("mongoose");
const express=require("express");

const app=express();
const Reservation = require("../models/Reservation");
const Product=require("../models/temp.js");

app.post("/products/:id/reserve", async (req, res) => {
  const { id } = req.params;
  const { pickupDay, quantity } = req.body;
  const userId = req.session.userId;

  try {
    const product = await Product.findById(id);

    // Check availability
    const totalAvailable = product.Availability.reduce((sum, a) => sum + a.quantity, 0);
    if (quantity > totalAvailable) {
      return res.status(400).send("Not enough quantity available for reservation.");
    }

    // Default pickup time: 10:00 AM on the chosen day
    const pickupTime = "10:00 AM";

    // Create the reservation
    const reservation = new Reservation({
      userId,
      productId: product._id,
      reservedAt: new Date(),
      pickupDay,
      pickupTime,
      quantity
    });

    await reservation.save();

    // Update product availability
    let remaining = quantity;
    product.Availability = product.Availability.map(avail => {
      if (remaining > 0 && avail.quantity > 0) {
        const toDeduct = Math.min(remaining, avail.quantity);
        remaining -= toDeduct;
        return { ...avail, quantity: avail.quantity - toDeduct };
      }
      return avail;
    });

    await product.save();

    res.redirect(`/products/${id}`);
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).send("Internal Server Error");
  }
});
