import NodeGeocoder from "node-geocoder";

const options = {
  provider: "google",
  apiKey: process.env.GOOGLE_PLACES_KEY,
  formatter: null,
};

export const geocoder = NodeGeocoder(options);
