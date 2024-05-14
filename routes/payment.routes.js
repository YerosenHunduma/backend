import express from "express";
import * as payment from "../controllers/payment.controllers.js";
import {
  authorizedRoles,
  isAuthenticated,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/pay", isAuthenticated, payment.PaymentService);
router.post("/webhook", payment.chapaWebhook);
router.get("/get-mysubscription", isAuthenticated, payment.SubscriptionChecker);
router.get("/my-subscription", isAuthenticated, payment.mysubscription);
router.get(
  "/transactions",
  isAuthenticated,
  authorizedRoles("Admin"),
  payment.transactions
);

export default router;
