const {
  Producer,
  User,
  Shop,
  ProductCategory,
  ProductFamily,
  Product,
  Stock,
} = require("../models");
const { validationModule } = require("../modules");
const { isProducerUser, hasShop } = require("../helpers/authHelpers");

const onboarding1 = async (req, res) => {
  try {
    const { name, lastname, socialReason, siren, iban, bic, kbis } = req.body;

    const user = await User.findOne({ clerkUUID: req.auth.userId });

    if (!user) {
      return res
        .status(200)
        .json({ success: false, data: null, message: "User not found." });
    }

    console.log("user :", user);

    const producer = await Producer.findOne({ owner: user._id });

    if (!producer) {
      return res
        .status(200)
        .json({ success: false, data: null, message: "Producer not found." });
    }

    console.log("producer :", producer);

    user.firstname = name;
    user.lastname = lastname;
    producer.socialReason = socialReason;
    producer.siren = siren;
    producer.iban = iban;
    producer.bic = bic;
    producer.kbis = kbis;
    producer.onboardingStep = 1;

    await user.save();
    await producer.save();

    res.status(200).json({ success: true, data: { user, producer } });
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: false, message: "Internal server error" });
    return;
  }
};

const onboarding2 = async (req, res) => {
  try {
    const { shopName, siret, shortDesc, logo, photo } = req.body;

    let producer = await isProducerUser(req.auth.userId);

    if (!producer) {
      return res
        .status(200)
        .json({ success: false, message: "No producer found." });
    }

    const photos = [];
    if (photo) {
      photos.push(photo);
    }

    const newShop = new Shop({
      name: shopName,
      producer: producer._id,
      siret,
      shortDesc,
      logo,
      photos,
    });

    const shop = await newShop.save();

    producer = await Producer.findOneAndUpdate(
      { _id: producer._id },
      { onboardingStep: 2 },
      {
        new: true, // retourne le document mis à jour
        upsert: false, // crée le document s'il n'existe pas
        runValidators: true, // applique les validations du modèle
      },
    );

    res.status(200).json({ success: true, data: { producer, shop } });
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: false, message: "Internal server error" });
    return;
  }
};

const onboarding3 = async (req, res) => {
  try {
    const { types } = req.body;

    let shop = await hasShop(req.auth.userId);

    if (!shop) {
      return res
        .status(200)
        .json({ success: false, message: "No shop found." });
    }

    let producer = await Producer.findById(shop.producer);

    shop.types = types;

    await Shop.findOneAndUpdate(
      { _id: shop._id },
      { types },
      {
        new: true, // retourne le document mis à jour
        upsert: false, // crée le document s'il n'existe pas
        runValidators: true, // applique les validations du modèle
      },
    );

    producer = await Producer.findOneAndUpdate(
      { _id: producer._id },
      { onboardingStep: 3 },
      {
        new: true, // retourne le document mis à jour
        upsert: false, // crée le document s'il n'existe pas
        runValidators: true, // applique les validations du modèle
      },
    );

    res.status(200).json({ success: true, data: { producer, shop } });
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: false, message: "Internal server error" });
    return;
  }
};

const onboarding4 = async (req, res) => {
  try {
    const { isPremium } = req.body;

    let shop = await hasShop(req.auth.userId);

    if (!shop) {
      return res
        .status(200)
        .json({ success: false, message: "No shop found." });
    }

    let producer = await Producer.findById(shop.producer);

    shop.isPremium = isPremium;

    await Shop.findOneAndUpdate(
      { _id: shop._id },
      { isPremium },
      {
        new: true, // retourne le document mis à jour
        upsert: false, // crée le document s'il n'existe pas
        runValidators: true, // applique les validations du modèle
      },
    );

    producer = await Producer.findOneAndUpdate(
      { _id: producer._id },
      { onboardingStep: 4 },
      {
        new: true, // retourne le document mis à jour
        upsert: false, // crée le document s'il n'existe pas
        runValidators: true, // applique les validations du modèle
      },
    );

    res.status(200).json({ success: true, data: { producer, shop } });
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: false, message: "Internal server error" });
    return;
  }
};

const onboarding5 = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);

    if (!shop) {
      return res
        .status(200)
        .json({ success: false, message: "No shop found." });
    }

    let producer = await Producer.findById(shop.producer);

    producer = await Producer.findOneAndUpdate(
      { _id: producer._id },
      { onboardingStep: 5 },
      {
        new: true, // retourne le document mis à jour
        upsert: false, // crée le document s'il n'existe pas
        runValidators: true, // applique les validations du modèle
      },
    );

    res.status(200).json({ success: true, producer });
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: false, message: "Internal server error" });
    return;
  }
};

const onboarding6 = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);

    if (!shop) {
      return res
        .status(200)
        .json({ success: false, message: "No shop found." });
    }

    let producer = await Producer.findById(shop.producer);

    producer = await Producer.findOneAndUpdate(
      { _id: producer._id },
      { onboardingStep: 6 },
      {
        new: true, // retourne le document mis à jour
        upsert: false, // crée le document s'il n'existe pas
        runValidators: true, // applique les validations du modèle
      },
    );

    console.log("producer onboarding6 :", producer);

    res.status(200).json({ success: true, producer });
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: false, message: "Internal server error" });
    return;
  }
};

module.exports = {
  onboarding1,
  onboarding2,
  onboarding3,
  onboarding4,
  onboarding5,
  onboarding6,
};
