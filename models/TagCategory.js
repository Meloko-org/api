const mongoose = require("./mongoose");

const tagCategorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  descriptio: {
    type: String,
    required: false,
  },
});

module.export = tagCategorySchema;
