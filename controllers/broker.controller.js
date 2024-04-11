import Broker from "../models/broker.model.js";

export const getBrokers = async (req, res) => {
  const brokers = await Broker.find();
  res.status(200).json(brokers);
};
