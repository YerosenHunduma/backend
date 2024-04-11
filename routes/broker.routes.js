import express from "express";
import * as broker from "../controllers/broker.controller.js";

const router = express.Router();

router.get("/getbroker", broker.getBrokers);

export default router;
