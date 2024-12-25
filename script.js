const express=require("express");
const app=express();
const Reservation = require('./models/Reservation');
const path=require("path");
const session = require("express-session");
const crypto = require("crypto");
const engine=require('ejs-mate');
const Product=require("./models/temp.js");
const User=require("./models/user.js");
const mongoose=require("mongoose");
const bcrypt = require("bcryptjs"); 
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.engine("ejs",engine);
app.set("view engine","ejs");
 app.set("views",path.resolve("./views"));
 app.set("views", __dirname + "/views");
 app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:true}));
async function main() {
  await mongoose.connect('mongodb://localhost:27017/wishNget');
}
main().then(()=>{
  console.log("Connection successfull!");
})
.catch(err => console.log(err));

app.listen(2080,()=>{
  console.log("listening to the port!");
 
})
app.use(session({
  secret: "your_secret_key", // Use a strong, secure secret
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: "mongodb://localhost:27017/wishNget" }), // Replace with your MongoDB URI
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to parse JSON bodies
app.use(express.json());
// app.get("/",(req,res)=>{
//   res.send("The server is working!!Yippeee!!");
// })
app.get("/",async (req,res)=>{
  let products=await Product.find();
res.render('content/show',{products});
  });
app.get("/products",async (req,res)=>{
  let products=await Product.find();
res.render('content/show',{products});
  });
  // Route to render the add product form
  app.get('/products/new',(req,res)=>{
    res.render('content/new');
  });
  app.post("/products", async (req, res) => {
    const { productName, image,Category,About,price, reviewUserId, reviewRating, reviewComment, location, quantity, isReservable, reservationTime, maxReservations } = req.body;
    // Prepare Reviews array
    const reviews = reviewUserId.map((userId, index) => ({
      userId,
      rating: parseInt(reviewRating[index], 10),
      comment: reviewComment[index],
      createdAt: new Date()
    }));
    // Prepare Availability array
    const availability = location.map((loc, index) => ({
      location: loc,
      Quantity: parseInt(quantity[index], 10)
    }));
    // Prepare Reservation object
    const reservation = {
      isReservable: isReservable === "on",
      reservationTime: reservationTime ? new Date(reservationTime) : null,
      maxReservations: parseInt(maxReservations, 10) || 1
    };
  
    // Create new Product instance
    const newProduct = new Product({
      productName,
      image,
      Category,
      About,
      price: parseFloat(price),
      Reviews: reviews,
      Availability: availability,
      Reservation: reservation
    });
  
    await newProduct.save();
    res.redirect("/products"); // Redirect to products page after saving
  });
  
  app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
  
    // Calculate average rating
    const ratings = product.Reviews.map(review => review.rating);
    const averageRating = ratings.length ? (ratings.reduce((a, b) => a + b) / ratings.length).toFixed(1) : 0;
  
    res.render('content/detail', { product, averageRating });
  });
  
app.get("/products/:id/edit", async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid product ID");
  }
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).send("Product not found");
  }
  res.render("content/edit", { product });
});

//edit route
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { productName, image, price,About, reviewUserId, reviewRating, reviewComment, location, quantity, isReservable, reservationTime, maxReservations } = req.body;

  const reviews = Array.isArray(reviewUserId) ? reviewUserId.map((userId, index) => ({
    userId,
    rating: parseInt(reviewRating[index], 10),
    comment: reviewComment[index],
    createdAt: new Date()
  })) : [];

  const availability = Array.isArray(location) ? location.map((loc, index) => ({
    location: loc,
    Quantity: parseInt(quantity[index], 10)
  })) : [];

  const reservation = {
    isReservable: isReservable === "on",
    reservationTime: reservationTime ? new Date(reservationTime) : null,
    maxReservations: parseInt(maxReservations, 10) || 1
  };

  await Product.findByIdAndUpdate(id, {
    productName,
    image,
    price: parseFloat(price),
    About,
    Reviews: reviews,
    Availability: availability,
    Reservation: reservation
  });

  res.redirect("/products");
});
//delete a file
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.redirect("/products"); // Redirect to products list after deletion
});
//add comments

app.post("/products/:id/reviews", async (req, res) => {
  const { id } = req.params;
  const { userId, rating, comment } = req.body;

  if (!req.session.userId) {
    return res.redirect("/login");
  }

  try {
    const product = await Product.findById(id);
    product.Reviews.push({
      userId: req.session.userId,
      rating: parseInt(rating, 10),
      comment: comment,
      createdAt: new Date()
    });
    await product.save();
    res.redirect(`/products/${id}`);
  } catch (error) {
    console.error("Error adding review:", error);
    res.redirect(`/products/${id}`);
  }
});

//generating
app.get("/products/:id/add-review", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  res.render("content/review", { product });
});
app.post("/products/:id/reviews", async (req, res) => {
  const { id } = req.params;
  const { userId, rating, comment, date } = req.body;

  try {
    const product = await Product.findById(id);

    product.Reviews.push({
      userId,
      rating: parseInt(rating, 10),
      comment,
      createdAt: new Date(date)
    });

    await product.save();
    res.redirect(`/products/${id}`);
  } catch (error) {
    console.error("Error adding review:", error);
    res.redirect(`/products/${id}`);
  }
});



// //create a user
// app.get('/testuser',async (req,res)=>{
//   let sampleUser=new User({
//     userId: "615f1a2e1c4d88a1eac7b1b4",
//     username: "Samiksha",
//     password: "StylishSam&01" // hashed password: mypassword
//   });
//   await sampleUser.save();
//   console.log("Sample was saved");
//   res.send("Successful testing");
// })
app.get("/products/:id/add-location", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  res.render("content/addlocations", { product });
});

app.post("/products/:id/add-location", async (req, res) => {
  const { id } = req.params;
  const { location, quantity } = req.body;

  try {
    // Find the product and update the Availability array
    const product = await Product.findById(id);
    product.Availability.push({ location, quantity: parseInt(quantity, 10) });
    await product.save();

    console.log("Location and quantity added successfully:", { location, quantity });
    res.redirect(`/products/${id}`); // Redirect back to the product details page
  } catch (error) {
    console.error("Error adding location and quantity:", error);
    res.redirect(`/products/${id}`);
  }
});

function generateUserId() {
  return crypto.randomBytes(12).toString("hex"); // Generates a 24-character hex string
}

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("Plain text password:", password);
    console.log("Hashed Password:", hashedPassword);

    // Create a new user with the hashed password
    const userId = generateUserId();
    const user = new User({
      userId,
      username,
      password: hashedPassword // Store the hashed password
    });

    // Save the new user to the database
    await user.save();

    // Fetch the user from the database to confirm the hashed password is stored correctly
    const savedUser = await User.findOne({ username });
    console.log("Saved user’s hashed password:", savedUser.password);

    req.session.userId = user.userId; // Store custom userId in session
    res.render("infoUser/registrationSuccess", { userId: user.userId });
  } catch (error) {
    console.error("Registration error:", error);
    res.redirect("/register");
  }
});

app.get("/login", (req, res) => {
  res.render("infoUser/login");
});

app.get("/register", (req, res) => {
  res.render("infoUser/register");
});

app.get("/profile", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login"); // Redirect to login if not authenticated
  }
  
  res.render("infoUser/profile", { userId: req.session.userId });
});

//redirect pages or post or set the login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user) {
      console.log("Plain text password entered:", password);
      console.log("Stored hashed password:", user.password);

      // Compare the plain text password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match result:", isMatch); // Should log true if passwords match

      if (isMatch) {
        req.session.userId = user.userId; // Store the custom userId in session
        return res.redirect("/profile");
      } else {
        console.log("Password does not match.");
      }
    } else {
      console.log("User not found.");
    }
    res.redirect("/login");
  } catch (error) {
    console.error("Error during login:", error);
    res.redirect("/login");
  }
});
//search the product by name and location
app.get("/search", async (req, res) => {
  const query = req.query.query;
  try {
    const products = await Product.find({
      $or: [
        { productName: { $regex: query, $options: "i" } },
        { Category: { $regex: query, $options: "i" } },
        { "Availability.location": { $regex: query, $options: "i" } }
      ]
    });
    res.render("infoUser/searchresult", { query, products });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/products/:id/reserve", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found.");
    }
    res.render("content/reserve", { product });
  } catch (error) {
    console.error("Error fetching product for reservation:", error);
    res.status(500).send("Internal Server Error");
  }
});
function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).send("You must be logged in to make a reservation.");
  }
  next();
}
app.post("/products/:id/reserve", isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;
  const { location, pickupDay, pickupTime, quantity } = req.body;

  try {
    const product = await Product.findById(id);
    // Check if the product is reservable
    if (!product.Reservation.isReservable) {
      return res.status(400).send("This product is not reservable.");
    }

    // Check if quantity exceeds max reservations
    if (quantity > product.Reservation.maxReservations) {
      return res.status(400).send(`You can only reserve up to ${product.Reservation.maxReservations} units.`);
    }
    // Find the selected location and validate availability
    const selectedLocation = product.Availability.find(avail => avail.location === location);
    if (!selectedLocation || selectedLocation.quantity < quantity) {
      return res.status(400).send("Insufficient quantity at the selected location.");
    }

    // Generate reservation time
    const reservationTime = new Date();

    // Update availability
    selectedLocation.quantity -= quantity;

    // Save the updated product
    await product.save();

    // Create a new reservation
    const reservation = new Reservation({
      userId,
      productId: id,
      location,
      reservationTime,
      pickupDay,
      pickupTime,
      quantity
    });

    await reservation.save();

    // Populate product details in the reservation
    const populatedReservation = await Reservation.findById(reservation._id).populate("productId");

    // Render confirmation page with populated data
    res.render("content/confirmPage", { reservation: populatedReservation });
  } catch (error) {
    console.error("Error during reservation:", error);
    res.status(500).send("Internal Server Error");
  }
});






