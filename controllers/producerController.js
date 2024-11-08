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
const userController = require("./userController");

const createNewProducer = async (req, res) => {
  try {
    // Retreive the logged user
    const owner = await User.findOne({ clerkUUID: req.auth.userId });

    // console.log("owner:", owner);

    if (await Producer.findOne({ owner: owner._id })) {
      // console.log(
      //   `Un producteur existe déjà pour cet utilisateur ${owner._id}`,
      // );
      return res.status(404).json({ message: "Producer already exists" });
    }

    // define the fields coming from req.body to check
    const checkBodyFields = ["socialReason", "siren", "iban", "bic", "address"];

    // If all expected fields are present
    if (validationModule.checkBody(req.body, checkBodyFields)) {
      // Create and save the new producer
      const { socialReason, siren, iban, bic, address } = req.body;

      const newProducer = new Producer({
        socialReason,
        siren,
        iban,
        bic,
        address,
        owner: owner._id,
      });

      await newProducer.save();

      res.status(201).json({ result: true, producer: newProducer });

      /* récupérer les nouvelles infos pour mettre à jourle store */
    } else {
      throw new Error("Missing fields.");
    }
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const getProducerInfos = async (req, res) => {
  // console.log("getProducerInfos called")
  try {
    const userId = await User.findOne(
      { clerkUUID: req.auth.userId },
      { _id: 1 },
    );

    const producer = await Producer.findOne({ owner: userId });

    if (!producer) {
      // console.log(
      //   `Aucun producteur trouvé à partir du clerkUUID ${req.auth.userId}`,
      // );
      return res.status(404).json({ message: "No producer found" });
    }

    res.json(producer);
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const searchProducer = async (req, res) => {
  try {
    const checkBodyFields = ["producer"];

    if (validationModule.checkBody(req.params, checkBodyFields)) {
      const producerFound = await Producer.findOne({
        socialReason: req.params.producer,
      });
      if (!producerFound) {
        // console.log(
        //   `Aucun producteur trouvé avec ce paramètre: ${req.params.producer}`,
        // );
        return res.status(404).json({ message: "No producer found." });
      }
      res.status(200).json({ result: true, producerFound });
    } else {
      // console.log("Paramètre de recherche manquant.");
      return res.status(404).json({ message: "Missing field." });
    }
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProducer = async (req, res) => {
  try {
    const user = await User.findOne({ clerkUUID: req.auth.userId });

    if (!user) {
      console.log("no user found with this clerkUUID: ", req.auth.userId);
      throw new Error("No user found");
    }

    const producer = await Producer.findOne({ owner: user._id });

    if (!producer) {
      console.log("no producer found with this owner: ", user._id);
      throw new Error("No producer found");
    }

    // define the fields coming from req.body to check
    const checkBodyFields = ["socialReason", "siren", "iban", "bic", "address"];

    if (validationModule.checkBody(req.body, checkBodyFields)) {
      req.body.socialReason && (producer.socialReason = req.body.socialReason);
      req.body.siren && (producer.siren = req.body.siren);
      req.body.iban && (producer.iban = req.body.iban);
      req.body.bic && (producer.bic = req.body.bic);
      req.body.address && (producer.address = req.body.address);

      await producer.save();

      console.log("before getProducerInfos");

      /* récupérer les nouvelles infos pour mettre à jour le store */
      await getProducerInfos(req, res);
      console.log("after getProducerInfos");
    } else {
      throw new Error("Missing fields.");
    }
  } catch (error) {
    // console.error("Error in updateProducer: ", error)
    return res.status(500).json({ error: error.message });
  }
};

/*
const getAvailableProductsForAShop = async (req, res) => {
  // identifier le(s) type(s) de shop
  // lister tous les produits concernés par le type de shop
  // supprimer de la liste, les produits qui sont déjà dans stock
  try {
    const user = await User.findOne({ clerkUUID: req.auth.userId})
    if(!user) {
      throw new Error("User not found.")
    }

    const producer = await Producer.findOne({ owner: user._id})
    if(!producer) {
      throw new Error("No producer found.")
    }
    
    const shop = await Shop.findOne({ producer: producer._id}).select("types")
    if(!shop) {
      throw new Error("No shop found.")
    }

    const typesToCategoriesMapping = {
      "66b210b5bd946e81e70977dd" : ["Fruits", "Légumes"],
      "66cc473ec844239d24552630" : ["fromages"],
      "66cc477fc844239d24552631" : ["vins"]
    }

    const authorizedCategories = new Set()

    console.log("shop:", shop.types)

    shop.types.forEach(typeId => {
      const categoriesFortype = typesToCategoriesMapping[typeId]
      if (categoriesFortype) {
        categoriesFortype.forEach(category => {
          authorizedCategories.add(category)
        })
      }
    })

    const categoryNames = Array.from(authorizedCategories)
    // on récupère les id des catégories authorisées
    const categories = await ProductCategory.find({ name: { $in: categoryNames}})
    const categoryIds = categories.map(cat => cat._id)
    // on récupère les familles de produits en fonction des catégories authorisées
    const families = await ProductFamily.find({ category: { $in: categoryIds}})
    const familyIds = families.map(fam => fam._id)
    // on récupère tous les produits qui appartiennent aux familles
    const products = await Product.find({ family: { $in: familyIds}})
      .populate({
        path: "family",
        model: "productFamily",
        populate: {
          path: "category",
          model: "productcategory"
        }
      })

    // on déduit de la liste des produits, tous les produits qui ont déjà un stock
    const stocks = await Stock.find({ shop: shop._id})
    const stockedProductIds = new Set(stocks.map((stock) => stock.product.toString()))


    const availableProducts = products.filter((product) => !stockedProductIds.has(product._id.toString()))

    console.log(availableProducts.length)

    res.json(availableProducts)
    
  } catch (error) {
    console.log(error)
    res.status(500).json({message: error.message})
  }
}*/

module.exports = {
  createNewProducer,
  searchProducer,
  updateProducer,
  getProducerInfos,
};
