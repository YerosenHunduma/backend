import { body } from "express-validator";

export const changePasswordValidator = [
  body("newPassword")
    .trim()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    })
    .withMessage(
      "Password must be 8+ chars with lowercase, uppercase, numeric, and special symbols."
    ),
  body("confirmNewPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("The new passwords do not match");
    }
    return true;
  }),
];
