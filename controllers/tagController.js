const { ProductFamily } = require("../models");
const Tag = require("../models/Tag");
const { validationModule } = require("../modules");

const createNewTag = async (req, res) => {
  try {
    // define the fields coming from req.body to check
    const checkBodyFields = ["name", "description", "color"];

    // If all expected fields are present
    if (validationModule.checkBody(req.body, checkBodyFields)) {
      // Create and save the new tag
      const { name, description, color } = req.body;

      const newTag = new Tag({
        name,
        description,
        color,
      });

      await newTag.save();

      res.json({ result: true, tag: newTag });
    } else {
      throw new Error("Missing fields.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const getSuggestedTags = async (req, res) => {
  try {
    const { familyId } = req.params;

    const family = await ProductFamily.findById(familyId).lean();

    if (!family) {
      return {
        success: false,
        message: "No family of product found.",
      };
    }

    const tagCategoryIds = family.tagCategories;

    console.log("tagCategories dune famille :", tagCategoryIds);

    // si aucun catégorie de tags n'est définie, on retourne tousles tags
    if (tagCategoryIds.length === 0) {
      console.lg("aucune catégorie de tag définie pour cette famille.");

      // on récupère d'abord tous les tags
      const allTags = await Tag.find().lean();

      return res.status(200).json({
        success: true,
        tags: {
          suggestedTags: null,
          remainingTags: allTags,
        },
      });
    }

    const suggestedTagsByCategory = await Promise.all(
      tagCategoryIds.map((categoryId) =>
        Tag.find({ category: categoryId }).lean(),
      ),
    );

    // on applatit le tableau des tags suggérés
    const suggestedTags = suggestedTagsByCategory.flat();

    const remainingTags = await Tag.find({
      category: { $nin: tagCategoryIds },
    }).lean();

    res
      .status(200)
      .json({ success: true, tags: { suggestedTags, remainingTags } });
  } catch (error) {
    console.error("Error fetching tags : ", error);
    res.status(500).json({ success: false, message: "Internal server error." });
    return;
  }
};

module.exports = {
  createNewTag,
  getSuggestedTags,
};
