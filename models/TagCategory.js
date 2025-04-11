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
  color: {
    type: String,
  },
});

const TagCategory = mongosse.model("tagCategories", tagCategorySchema);

module.export = TagCategory;
