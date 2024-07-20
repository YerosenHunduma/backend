import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import rootRoute from "./routes/index.js";
import dbConnection from "./config/dbConfig.js";
dbConnection;
import cookieParser from "cookie-parser";
import passport from "passport";
// import seed from "./seeder/seed.js";

//handle uncaught exceptions errors
process.on("uncaughtException", (error) => {
  console.log(`Error:", ${error}`);
  console.log("Shutting down server due to Unhandled Promise rejection");
  process.exit(1);
});

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://asset-marketsquare-react-jsou.onrender.com",
  "https://assetmarketsquare.yerosen.com/",
];

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(passport.initialize());
import "./config/passport.js";

app.use("/api", rootRoute);

const server = app.listen(process.env.PORT, () => {
  console.log(
    `app running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode !`
  );
});

// seed();

//Handle Unhandled Promise rejection errors

process.on("unhandledRejection", (error) => {
  console.log(`Error:", ${error}`);
  console.log("Shutting down server due to Unhandled Promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
