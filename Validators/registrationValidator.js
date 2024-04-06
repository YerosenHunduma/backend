import { body } from "express-validator";

export const registerationValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail()
    .toLowerCase(),
  body("password")
    .trim()
    .isStrongPassword({
      minLength: 8,
      minNumbers: 1,
      minLowercase: 1,
      minSymbols: 1,
      minUppercase: 1,
    })
    .withMessage(
      "Password must be 8+ chars with lowercase, uppercase, numeric, and special symbols."
    ),
  body("Cpassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];
