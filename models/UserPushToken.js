const mongoose = require("mongoose");

const userPushTokenSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ["android", "ios"],
      required: true,
    },
  },
  { timestamps: true },
);

const UserPushToken = mongoose.model("userpushtokens", userPushTokenSchema);
module.exports = UserPushToken;
