import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const seed = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("admin", salt);

  const admin = new User({
    username: "admin",
    password: hashedPassword,
    email: "admin@assetMarketSquare.com",
    role: "Admin",
  });

  try {
    const user = await User.findOne({ username: "admin" });
    if (!user) {
      await admin.save();
      console.log("Admin account created successfully");
    } else {
      console.log("Admin account already exists");
    }
  } catch (error) {
    console.log(error);
  }
};

export default seed;
