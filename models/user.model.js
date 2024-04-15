import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },

    photo: {},
    active: {
      type: Boolean,
      default: true,
    },
    role: {
      type: [String],
      default: ["Buyer"],
      enum: ["Buyer", "Admin"],
    },
    favorite: [
      {
        type: Schema.Types.ObjectId,
        ref: "Assets",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

export default User;
