import User from "../models/user.model.js";
export const getUsers = async (req, res, next) => {
  const user = await User.find();
  res.status(200).json(user);
};
