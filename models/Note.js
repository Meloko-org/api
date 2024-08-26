const mongoose = require("mongoose");

const noteSchema = mongoose.Schema(
  {
    note: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true },
);

const Note = mongoose.model("notes", noteSchema);
module.exports = Note;
