import { Strategy as JwtStrategy } from "passport-jwt";
import User from "../../models/user.model.js";
import { errorHandler } from "../../utils/errorHandler.js";

const cookieExtractor = (req) => {
  let token = null;
  if (req.cookies.access_token == undefined) {
    return next(new errorHandler("Your are not authorized to access", 400));
  }
  token = req.cookies.access_token;
  return token;
};
const opts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.jwt_secret_key,
};

const AuthorizedUser = async (jwt_payload, done) => {
  console.log("payload", jwt_payload);
  try {
    const user = await User.findById({ _id: jwt_payload._id });
    if (!user)
      return done(null, false, {
        message: "Your are not authorized to access",
      });
    return done(null, user);
  } catch (error) {
    done(error);
  }
};
export default new JwtStrategy(opts, AuthorizedUser);
