import bcrypt from "bcryptjs";
import { Strategy as LocalStartegy } from "passport-local";
import User from "../../models/user.model.js";
import Broker from "../../models/broker.model.js";

const customFields = {
  usernameField: "email",
  passwordField: "password",
};

const AuthenticatedUser = async (email, password, done) => {
  console.log(email, password);
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = await Broker.findOne({ email });
    }
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        if (user instanceof Broker && !user.isApproved) {
          return done(null, false, {
            message: "Your account is not approved yet",
          });
        }
        if (!user.active) {
          return done(null, false, {
            message:
              "Your account is deactivated, please contact your administrator for more information",
          });
        }
        return done(null, user, { message: "Signed in successfully" });
      } else {
        return done(null, false, {
          message: "Either the Email or password you entered is incorrect",
        });
      }
    } else {
      return done(null, false, { message: "User not found" });
    }
  } catch (error) {
    done(error);
  }
};

export default new LocalStartegy(customFields, AuthenticatedUser);
