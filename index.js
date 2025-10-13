// const express = require("express");
// const cors = require("cors");
// const app = express();
// require("dotenv").config();
// const { MongoClient, ObjectId } = require("mongodb");
// const port = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dafmrk2.mongodb.net/?retryWrites=true&w=majority`;

// const client = new MongoClient(uri);
// const books = client.db("Bookify").collection("all_books");
// const bookingCollection = client.db("Books").collection("Booking");
// const wishlistCollection = client.db("Books").collection("wishList");
// const usersCollection = client.db("users").collection("signedUsers");
// const sellerAddedProductCollection = client
//   .db("users")
//   .collection("addedProduct");
// const AdvertisedProductCollection = client
//   .db("users")
//   .collection("advertisedProduct");

// const categoryCollection = client.db("Category").collection("Catagories3cards");
// const verifyAdmin = async (req, res, next) => {
//   const decodedEmail = req.decoded.email;
//   const query = { email: decodedEmail };
//   const user = await usersCollection.findOne(query);
//   if (user?.role !== "admin") {
//     return res.status(403).send({
//       message: "forbidden access",
//     });
//   }
//   next();
// };

// // Categories 3 card fetch
// app.get("/category", async (req, res) => {
//   const category = await categoryCollection.find({}).toArray();
//   res.send(category);
// });
// // Get a perticular Category related books
// app.get("/category/:category", async (req, res) => {
//   const category = req.params.category;
//   console.log(category);
//   const query = { category: category };
//   console.log(query);
//   const resaleBooks = await sellerAddedProductCollection.find(query).toArray();
//   res.send(resaleBooks);
// });
// // app.get("/category/action_and_adventure", async (req, res) => {
// //   const action_and_adventure = await books
// //     .find({ category: "Action_and_Adventure" })
// //     .toArray();
// //   res.send(action_and_adventure);
// // });
// // app.get("/category/classics", async (req, res) => {
// //   const classics = await books
// //     .find({
// //       category: "Classics",
// //     })
// //     .toArray();
// //   res.send(classics);
// // });
// // app.get("/category/memoir", async (req, res) => {
// //   const memoir = await books
// //     .find({
// //       category: "Memoir",
// //     })
// //     .toArray();
// //   res.send(memoir);
// // });
// // app.get("/users/sellers", async (req, res) => {
// //   const user = await usersCollection.find({ role: "Seller" }).toArray();
// //   res.send(user);
// // });
// app.post("/userInfo", async (req, res) => {
//   const userInfo = req.body;
//   const result = await usersCollection.insertOne(userInfo);
//   res.send(result);
// });
// // Get all the users
// app.get("/users", async (req, res) => {
//   const query = {};
//   const users = await usersCollection.find(query).toArray();
//   res.send(users);
// });

// // Post the bookings
// app.post("/booking", async (req, res) => {
//   const bookingInfo = req.body;
//   const booking = await bookingCollection.insertOne(bookingInfo);
//   res.send(booking);
// });
// // Get the booked items
// app.get("/booking", async (req, res) => {
//   const booked = await bookingCollection.find({}).toArray();
//   res.send(booked);
// });
// // Post the item in the wishlist
// app.post("/wishlist", async (req, res) => {
//   const wishlistInfo = req.body;
//   const wishlist = await wishlistCollection.insertOne(wishlistInfo);
//   res.send(wishlist);
// });
// // Verify seller
// app.patch("/advertised/:email", async (req, res) => {
//   const { email } = req.params;
//   console.log(req.body);
//   console.log(email);
//   const result = await sellerAddedProductCollection.updateOne(
//     {
//       email: email,
//     },
//     {
//       $set: req.body,
//     }
//   );
//   res.send(result);
// });
// // Get the item from wishlist
// app.get("/wishlist", async (req, res) => {
//   let query = {};
//   if (req.query.email) {
//     query = {
//       email: req.query.email,
//     };
//   }
//   const cursor = wishlistCollection.find(query);

//   const wishes = await cursor.toArray();
//   res.send(wishes);
// });
// // Get admin
// app.get("/users/admin/:email", async (req, res) => {
//   const email = req.params.email;
//   const query = { email };
//   const user = await usersCollection.findOne(query);
//   res.send({ isAdmin: user?.role === "admin" });
// });
// // Find all the sellers
// app.get("/users/sellers", async (req, res) => {
//   const user = await usersCollection.find({ role: "Seller" }).toArray();
//   res.send(user);
// });
// // Find all the sellers
// app.get("/users/buyers", async (req, res) => {
//   const user = await usersCollection.find({ role: "Buyer" }).toArray();
//   res.send(user);
// });

// // Check if its Buyer
// app.get("/users/buyer/:email", async (req, res) => {
//   const email = req.params.email;
//   const query = { email };
//   const user = await usersCollection.findOne(query);
//   res.send({ isBuyer: user?.role === "Buyer" });
// });
// // Check if its Seller
// app.get("/users/seller/:email", async (req, res) => {
//   const email = req.params.email;
//   const query = { email };
//   const user = await usersCollection.findOne(query);
//   res.send({ isSeller: user?.role === "Seller" });
// });
// // Get a perticular user
// app.get("/users/singleuser/:email", async (req, res) => {
//   const email = req.params.email;
//   const query = { email };
//   const user = await usersCollection.findOne(query);
//   res.send(user);
// });

// // delete perticular user
// app.delete("/users/:id", async (req, res) => {
//   const { id } = req.params;
//   const result = await usersCollection.deleteOne({ _id: ObjectId(id) });
//   res.send(result);
// });
// // // Get perticular user
// // app.get("/users/:id", async (req, res) => {
// //   const email = req.params.email;
// //   const query = { email };
// //   const result = await usersCollection.findOne(query);
// //   res.send(result);
// // });

// // Post a product
// app.post("/addedProducts", async (req, res) => {
//   const product = req.body;
//   const result = await sellerAddedProductCollection.insertOne(product);
//   res.send(result);
// });
// // Delete a product from MyProducts
// app.delete("/myproducts/:id", async (req, res) => {
//   const { id } = req.params;
//   const result = await sellerAddedProductCollection.deleteOne({
//     _id: ObjectId(id),
//   });
//   res.send(result);
// });

// // Delete a product from Advertised items
// app.delete("/advertised/:id", async (req, res) => {
//   const { id } = req.params;
//   console.log(id, req.params);
//   const result = await sellerAddedProductCollection.deleteOne({
//     _id: ObjectId(id),
//   });
//   console.log(result);
//   res.send(result);
// });
// // Get all product that seller has posted
// app.get("/myproducts", async (req, res) => {
//   let query = {};
//   if (req.query.email) {
//     query = {
//       email: req.query.email,
//     };
//   }
//   const cursor = sellerAddedProductCollection.find(query);
//   const products = await cursor.toArray();
//   res.send(products);
// });
// // Advertise the product
// app.get("/myproduct/:id", async (req, res) => {
//   const productid = req.params.id;
//   const query = { _id: ObjectId(productid) };
//   const singleProduct = await sellerAddedProductCollection.findOne(query);
//   res.send(singleProduct);
// });
// app.post("/myproduct/:id", async (req, res) => {
//   const product = req.body;
//   const singleProduct = await AdvertisedProductCollection.insertOne(product);
//   res.send(singleProduct);
// });
// app.get("/advertised", async (req, res) => {
//   const advertisedProduct = await AdvertisedProductCollection.find(
//     {}
//   ).toArray();
//   res.send(advertisedProduct);
// });
// app.listen(port, () => {
//   console.log(`port is running on ${port}`);
// });
