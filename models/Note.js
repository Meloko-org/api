const mongoose = require("mongoose");

const noteSchema = mongoose.Schema(
  {
    note: {
      type: mongoose.Decimal128,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shops",
    },
    comment: {
      type: String,
    },
    source: {
      type: String,
      enum: ["purchase", "touristVisit"],
      required: true,
    },
    photo: {
      type: String,
    },
  },
  { timestamps: true },
);

const Note = mongoose.model("notes", noteSchema);
module.exports = Note;
