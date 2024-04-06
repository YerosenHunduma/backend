import bcrypt from "bcryptjs";
import { Strategy as LocalStartegy } from "passport-local";
import User from "../../models/user.model.js";

const customFields = {
  usernameField: "email",
  passwordField: "password",
};

const AuthenticatedUser = async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: "User not found" });
    const isMathch = bcrypt.compare(password, user.password);
    if (isMathch)
      return done(null, user, { message: "signed in successfully" });
    else
      return done(null, false, {
        message: "Either the Email or password you entered is incorrect",
      });
  } catch (error) {
    done(error);
  }
};

export default new LocalStartegy(customFields, AuthenticatedUser);
