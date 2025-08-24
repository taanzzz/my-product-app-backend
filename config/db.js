// 📁 File: backend/config/db.js

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;
const collections = {};

const connectDB = async () => {
  try {
    await client.connect();
    db = client.db("productStoreDB"); // আমাদের প্রজেক্টের জন্য ডাটাবেসের নাম

    // Initialize collections for our project
    collections.productsCollection = db.collection("products");
    collections.usersCollection = db.collection("users");
    
    console.log("✅ MongoDB Atlas is successfully connected!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  }
};

const getCollections = () => collections;
const getObjectId = (id) => new ObjectId(id);

module.exports = { connectDB, getCollections, getObjectId };