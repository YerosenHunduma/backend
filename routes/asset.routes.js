import express from "express";
import * as asset from "../controllers/asset.controllers.js";
import AuthenticationMiddleware from "../middlewares/jwtAuthMiddleware.js";
const router = express.Router();

router.get("/getUsers", AuthenticationMiddleware, asset.getUsers);

export default router;
