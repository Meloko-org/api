const { format } = require("date-fns");
const { fr } = require("date-fns/locale");

const {
  Shop,
  Note,
  PostTheme,
  Stock,
  GeneratedPost,
  ValidatedPost,
  Activity,
} = require("../models");
const { hasShop } = require("../helpers/authHelpers");
const { validationModule } = require("../modules");
const mongoose = require("mongoose");

const generatePost = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    // console.log("body :", req.body)

    const {
      subjectType,
      elementId,
      selectedThemeId,
      productTags = [],
      networks,
      mediaUri,
    } = req.body;

    const requiredFields = [
      "subjectType",
      "elementId",
      "selectedThemeId",
      "networks",
    ];

    if (!validationModule.checkBody(req.body, requiredFields)) {
      throw new Error("Missing fields.");
    }

    // récupération du thème
    const theme = await PostTheme.findById(selectedThemeId);
    if (!theme) {
      return res
        .status(404)
        .json({ success: false, message: "Theme not found." });
    }

    // création du post selon le type

    let stock = null;
    let note = null;
    let activity = null;
    let simulatedText = "";
    let imageUrl = "";
    let elementTitle = "";

    if (subjectType === "product") {
      stock = await Stock.findById(elementId).populate([
        {
          path: "product",
          populate: {
            path: "family",
            model: "productFamily",
          },
        },
        {
          path: "tags",
          model: "tags",
        },
      ]);

      if (!stock) {
        return res
          .status(404)
          .json({ success: false, message: "Stock not found." });
      }

      // à remplacer par l'appel à l'IA
      // 🔮 FAKE TEXT : Simuler la génération
      const productName =
        stock.productCustomName ||
        `${stock.product.family.name} ${stock.product.name}`;

      elementTitle = productName;

      simulatedText = `🌿 Texte généré par l'IA à propos\ndu produit ${productName}\net selon le thème ${theme.title}.`;
      imageUrl = stock.image || stock.product.image || "";
    } else if (subjectType === "review") {
      note = await Note.findById(elementId).populate("user");

      if (!note) {
        return res
          .status(404)
          .json({ success: false, message: "note not found." });
      }

      elementTitle =
        note.user.lastname +
        "\n" +
        format(new Date(note.createdAt), "d MMMM yyyy", { locale: fr });
      simulatedText =
        "texte généré par l'IA à propos de l'avis laissé par le user";
      imageUrl =
        note.photo ||
        "https://images.freeimages.com/images/large-previews/cb3/rapeseed-farmers-1433716.jpg?fmt=webp&h=350";
    } else if (subjectType === "activity") {
      activity = await Activity.findById(elementId);

      elementTitle = activity.title;
      simulatedText =
        "texte généré par l'IA à propos de l'activité du producer";
      imageUrl = mediaUri;
    }

    // création du post
    const post = await GeneratedPost.create({
      subjectType,
      stock: stock?._id || null,
      note: note?._id || null,
      activity: activity?._id || null,
      title: elementTitle,
      generatedText: simulatedText,
      imageUrl,
      networks,
      theme: theme._id,
      productTags,
      globalTags: shop?.socialPostSettings.customHashtags,
      globalMentions: shop?.socialPostSettings.customMentions,
    });

    // console.log("post :", post);

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error("Erreur lors de la génération du post :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

const validatePost = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    const {
      subjectType,
      stock,
      note,
      activity,
      title,
      type,
      imageUrl,
      generatedText,
      editedText,
      productTags,
      globalTags,
      globalMentions,
      networks,
      isScheduled,
      generatedId,
    } = req.body;

    const shopId = shop._id;

    const validatedPost = await ValidatedPost.create({
      subjectType,
      shop: shopId,
      stock,
      note,
      activity,
      title,
      type,
      imageUrl,
      generatedText,
      editedText,
      productTags,
      globalTags,
      globalMentions,
      networks,
      scheduledFor: null,
      publishedAt: null,
      status: "draft",
    });

    const now = new Date();

    console.log("isScheduled :", isScheduled);

    if (isScheduled) {
      // inclure la logique de programmation du post

      // simulation d'une date de planification
      const simulatedScheduledDate = new Date(now.getTime() + 60 * 60 * 1000);
      validatedPost.scheduledFor = simulatedScheduledDate;
      validatedPost.status = "scheduled";
    } else {
      // inclure ici la logique de publication sur les réseaux

      validatedPost.publishedAt = now;
      validatedPost.status = "posted";
    }

    await validatedPost.save();

    await GeneratedPost.deleteOne({ _id: generatedId });

    res.status(200).json({
      success: true,
      message: isScheduled
        ? "Le message est programmé."
        : "Le post est sur les réseaux.",
    });
  } catch (error) {
    console.error("Erreur lors de la génération du post :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

const getProgrammedPosts = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    const posts = await ValidatedPost.find({
      shop: shop._id,
      scheduledFor: { $ne: null },
      status: "scheduled",
    }).sort({ createdAt: -1 });

    // console.log(posts);
    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("Erreur lors de la génération du post :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

const postProgrammedPosts = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    const post = req.body;
    const postId = post._id;

    const programmedPost = await ValidatedPost.findById(post._id);

    console.log("programmedpost", programmedPost);

    // if post success
    const now = new Date();
    programmedPost.scheduledFor = null;
    programmedPost.publishedAt = now;
    programmedPost.status = "posted";

    await programmedPost.save();

    res
      .status(200)
      .json({ success: true, message: "Le post est sur les réseaux." });
  } catch (error) {
    console.error("Erreur lors de la génération du post :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

const getPostHistory = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    const posts = await ValidatedPost.find({
      shop: shop._id,
      status: "posted",
    });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("Erreur lors de la génération du post :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

const getPostsFromShop = async (req, res) => {};

const deleteProgrammedPost = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    const { postId } = req.params;

    const deletedPost = await ValidatedPost.deleteOne({ _id: postId });

    if (!deletedPost.deletedCount) {
      return res
        .status(200)
        .json({ success: false, message: "Le post est introuvable." });
    }

    res.status(200).json({ success: true, message: "Le post est supprimé." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ succes: false, message: "Internal server error." });
  }
};

const getActivitiesByProductType = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    const { productTypeIds } = req.body;

    const activities = await Activity.find({
      productType: { $in: productTypeIds },
    })
      .populate("productType", "name")
      .lean();

    const grouped = productTypeIds.map((typeId) => {
      const typeActivities = activities.filter((a) =>
        a.productType._id.equals(typeId),
      );
      return {
        title: typeActivities[0]?.productType.name || "Sans catégorie",
        data: typeActivities,
      };
    });

    res.status(200).json({ success: true, activities: grouped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ succes: false, message: "Internal server error." });
  }
};

module.exports = {
  generatePost,
  validatePost,
  getPostsFromShop,
  getProgrammedPosts,
  postProgrammedPosts,
  getPostHistory,
  deleteProgrammedPost,
  getActivitiesByProductType,
};
