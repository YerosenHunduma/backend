import express from "express";
import * as broker from "../controllers/broker.controller.js";
import {
  authorizedRoles,
  isAuthenticated,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/getbrokers", broker.getAllBrokers);
router.get("/getbroker/:id", broker.getBroker);
router.put(
  "/reviews",
  isAuthenticated,
  authorizedRoles("Buyer"),
  broker.createBrokerReviews
);
router.get("/reviews", isAuthenticated, broker.getAllReviews);
router.get(
  "/total-assets",
  isAuthenticated,
  authorizedRoles("Broker"),
  broker.TotalAssets
);
router.get(
  "/broker-latest-post",
  isAuthenticated,
  authorizedRoles("Broker"),
  broker.BrokerlatestPosts
);
router.get(
  "/broker-post-perMonth",
  isAuthenticated,
  authorizedRoles("Broker"),
  broker.broker_post_per_month
);

router.get(
  "/my-cars",
  isAuthenticated,
  authorizedRoles("Broker"),
  broker.brokerCars
);

router.get(
  "/my-houses",
  isAuthenticated,
  authorizedRoles("Broker"),
  broker.brokerHouses
);

export default router;
