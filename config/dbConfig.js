import mongoose from "mongoose";

mongoose.connect(process.env.remote_Mongo_uri);

const dbConection = mongoose.connection;

dbConection.on("error", (error) => console.log("Connection error:", error));

dbConection.on("connected", () =>
  console.log("Connected to database successfull")
);

export default dbConection;
