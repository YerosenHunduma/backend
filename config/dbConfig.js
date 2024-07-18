// config/dbConfig.js
import mongoose from "mongoose";

class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose.connect(process.env.remote_Mongo_uri);

    mongoose.connection.on("error", (error) => {
      console.log("Connection error:", error);
    });

    mongoose.connection.on("connected", () => {
      console.log("Connected to database successfully");
    });
  }
}

// Export a single instance of the Database class
export default new Database();
