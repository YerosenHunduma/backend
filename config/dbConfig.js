import mongoose from "mongoose";

mongoose.connect(process.env.Local_Mongo_Url);

const dbConection = mongoose.connection;

dbConection.on("error", (error) => console.log("Connection error:", error));

dbConection.on("connected", () =>
  console.log("Connected to database successfull")
);

export default dbConection;
