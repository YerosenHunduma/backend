import express from "express";
import * as house from "../controllers/house.controllers.js";
import uploadImageFromLocalToServer from "../helpers/multer.js";
import jwtAuthMiddleware from "../middlewares/jwtAuthMiddleware.js";

const router = express.Router();

router.post(
  "/post-house",
  jwtAuthMiddleware,
  uploadImageFromLocalToServer.array("file", 10),
  house.postHouse
);

export default router;
