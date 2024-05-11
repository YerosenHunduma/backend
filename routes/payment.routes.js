import express from "express";
import * as payment from "../controllers/payment.controllers.js";
import {
  authorizedRoles,
  isAuthenticated,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/pay", isAuthenticated, payment.PaymentService);
router.post("/webhook", isAuthenticated, payment.chapaWebhook);
router.get("/get-mysubscription", isAuthenticated, payment.mySubscription);

export default router;
