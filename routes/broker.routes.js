import express from "express";
import * as broker from "../controllers/broker.controller.js";
import jwtAuthMiddleware from "../middlewares/jwtAuthMiddleware.js";

const router = express.Router();

router.get("/getbrokers", broker.getAllBrokers);
router.get("/getbroker/:id", broker.getBroker);
router.put("/reviews", jwtAuthMiddleware, broker.createBrokerReviews);
router.get("/reviews", jwtAuthMiddleware, broker.getAllReviews);
router.get("/total-assets", jwtAuthMiddleware, broker.TotalAssets);
router.get("/broker-latest-post", jwtAuthMiddleware, broker.BrokerlatestPosts);
router.get(
  "/broker-post-perMonth",
  jwtAuthMiddleware,
  broker.broker_post_per_month
);

export default router;
