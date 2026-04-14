import mongoose from "mongoose";

// Get url from ENV file
const mongodbUrl = process.env.MONGODB_URL
if (!mongodbUrl) throw new Error("MONGODB_URL not found.")

// Create cached memory for storing already used models and connections 
let cached = global.mongooseConn
if (!cached) cached = global.mongooseConn = { conn: null, promise: null }

const connectDB = async () => {
    // There is no connection then return null 
    if (cached.conn) {
        console.log("Cached connection return.");
        return cached.conn
    }
    
    // Check promised connection 
    if(cached.promise) console.log("Promised connection.")

    // We don't have any connection then create it
    if (!cached.promise) {
        console.log("New connection created.");
        cached.promise = mongoose.connect(mongodbUrl, {
            dbName: "rydex"
        }).then((c) => c.connection)
    }

         
    // If we have any connection in Promise resolve them first and then return
    try {
        const conn = await cached.promise
        console.log("MongoDB connected")
        return cached.conn
    } catch (error) {
        cached.promise = null
        console.log("MongoDB connection error:", error);
        throw error;
    }
};

export default connectDB;