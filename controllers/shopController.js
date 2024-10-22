const {
  Shop,
  User,
  Producer,
  Product,
  ProductFamily,
  Stock,
  Type,
  Market,
} = require("../models");
const { validationModule } = require("../modules");
const Fuse = require("fuse.js");

/**
 * Permet de savoir s'il existe un user avec ce clerkUUID et si ce user a un profil Producer
 * @param {string} clerkUUID
 * @returns producer
 */
const isProducerUser = async (clerkUUID) => {
  const user = await User.findOne({ clerkUUID });
  if (!user) {
    throw new Error("No user found.");
  }
  const producer = await Producer.findOne({ owner: user._id });
  if (!producer) {
    throw new Error("User has no producer profile.");
  }
  return producer;
};

const createOrUpdateShop = async (req, res) => {
  try {
    const requiredFields = ["name", "description", "address", "siret", "types"];

    if (!validationModule.checkBody(req.body, requiredFields)) {
      throw new Error("Missing fields.");
    }

    const producer = await isProducerUser(req.auth.userId);

    /* préparation de la création ou de la mise à jour d'un shop */

    const {
      name,
      description,
      address,
      siret,
      types,
      logo,
      isOpen,
      reopenDate,
    } = req.body;

    // verify objectId of type before save
    const validTypes = await Type.find({ _id: { $in: types } });
    if (validTypes.lentgh !== types.lentgh) {
      throw new Error("Some selected types do not exist.");
    }

    /* Add coordinates to address */
    const coordinates = await getCoordinates(address);
    address.latitude = coordinates.lat;
    address.longitude = coordinates.lon;

    const shopUpdate = {
      producer: producer._id,
      name,
      description,
      siret,
      address,
      types: validTypes.map((type) => type._id),
      photos: [],
      video: [],
      isOpen,
      reopenDate,
      markets: [],
      notes: [],
      clickCollect: null,
      logo,
    };

    // on crée un filter qui permettra à la fonction findOneAndUpdate de vérifier
    // s'il existe déjà un shop avec ce producer._id et siret
    const filter = { producer: producer._id, siret };

    const shop = await Shop.findOneAndUpdate(filter, shopUpdate, {
      new: true, // retourne le document mis à jour
      upsert: true, // crée le document s'il n'existe pas
      runValidators: true, // applique les validations du modèle
    });

    res.status(200).json(shop);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const updateClickCollect = async (req, res) => {
  console.log("auth :", req.auth.userId);
  try {
    const checkBodyFields = ["openingHours"];

    console.log("body :", JSON.stringify(req.body, null, 2));

    if (!validationModule.checkBody(req.body, checkBodyFields)) {
      throw new Error("Missing fields.");
    }

    const producer = await isProducerUser(req.auth.userId);

    console.log("producer Id : ", producer._id);

    const shop = await Shop.findOne({ producer: producer._id });
    if (!shop) {
      throw new Error("No shop found.");
    }

    console.log("shopId :", shop._id);

    // avant d'apporter des modification à clickCollect, il faut s'assurer que clickCollect ne soit pas null
    if (!shop.clickCollect) {
      await Shop.updateOne({ _id: shop._id }, { $set: { clickCollect: {} } });
    }

    // ensuite on définit les champs à modifier
    const updateFields = {};
    if (req.body.instructions) {
      updateFields["clickCollect.instructions"] = req.body.instructions;
    }
    updateFields["clickCollect.openingHours"] = req.body.openingHours;

    // puis on met à jour le shop
    const updatedShop = await Shop.updateOne(
      { _id: shop._id },
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (updatedShop.mofifiedCount === 0) {
      res.status(400).json({ message: "No changes made." });
    }

    const updatedShopDetails = await Shop.findById(shop._id);

    console.log("updatedShop: ", updatedShop);

    res.status(200).json({
      message: "Click & Collect updated successfully",
      shop: updatedShopDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const searchShops = async (req, res) => {
  try {
    // define the fields coming from req.body to check
    const checkBodyFields = ["query", "radius", "userPosition"];

    // If all expected fields are present
    if (validationModule.checkBody(req.body, checkBodyFields)) {
      const { query, userPosition, radius } = req.body;

      // Get the min and max latitude and longitude
      const searchArea = calculateMaxLatitudeLongitude(userPosition, radius);

      // Aggregate the shops that have an address (lat, lon) between the min-max
      let searchResults = await Shop.aggregate([
        {
          $match: {
            "address.latitude": {
              $lte: searchArea.latitude.max,
              $gte: searchArea.latitude.min,
            },
            "address.longitude": {
              $lte: searchArea.longitude.max,
              $gte: searchArea.longitude.min,
            },
          },
        },
        {
          $lookup: {
            from: "stocks",
            localField: "_id",
            let: { product_id: "$product" },
            pipeline: [
              {
                $lookup: {
                  from: "products",
                  localField: "product",
                  let: { family_id: "$family" },
                  pipeline: [
                    {
                      $lookup: {
                        from: "productfamilies",
                        localField: "family",
                        foreignField: "_id",
                        as: "family",
                      },
                    },
                    {
                      $unwind: {
                        path: "$family",
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                  ],
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $unwind: {
                  path: "$product",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "tags",
                  localField: "tags",
                  foreignField: "_id",
                  as: "tags",
                },
              },
            ],
            foreignField: "shop",
            as: "stocks",
          },
        },
        {
          $lookup: {
            from: "types",
            localField: "types",
            foreignField: "_id",
            as: "types",
          },
        },
        {
          $lookup: {
            from: "notes",
            localField: "notes",
            foreignField: "_id",
            as: "notes",
          },
        },
      ]);

      // If there are query terms
      if (query !== "") {
        // Define the keys and weights that the fuzzy search will be applied
        const searchKeys = [
          {
            name: "name",
            weight: 1,
          },
          {
            name: "description",
            weight: 1,
          },
          {
            name: "stocks.product.name",
            weight: 1,
          },
          {
            name: "stocks.product.family.name",
            weight: 1,
          },
          {
            name: "types.name",
            weight: 0.5,
          },
          {
            name: "stocks.product.tags.name",
            weight: 0.5,
          },
        ];

        // Define additional fuseSearch options
        const searchOptions = {
          minMatchCharLength: 3,
          includeScore: true,
          includeMatches: true,
          keys: searchKeys,
          shouldSort: true,
          // threshold: 0.6
        };

        // Instantiate a Fuse class
        const fuse = new Fuse(searchResults, searchOptions);
        // Execute the fuse search
        const fuseSearch = fuse.search(query);

        // Remap the searchResults array to be the same as if there are no fuse search
        // Also add the distance between the user and the shop
        searchResults = fuseSearch.map((sr) => {
          const item = sr.item;

          item.searchData = {
            documentIndex: sr.refIndex,
            matches: sr.matches,
            score: sr.score,
            distance: calculateDistance(
              item.address.latitude,
              item.address.longitude,
              userPosition.latitude,
              userPosition.longitude,
              "K",
            ),
          };

          return item;
        });

        // console.log(JSON.stringify(searchResults, null, 2))

        for (const result of searchResults) {
          const matchedKeys = [];
          for (const matche of result.searchData.matches) {
            if (
              matche.key === "stocks.product.family.name" &&
              !matchedKeys.includes(matche.value)
            ) {
              matchedKeys.push(matche.value);
              const productsFromFamily = await getStocksFromProductsFamily(
                matche.value,
                result._id,
              );

              if (result.searchData.relevantProducts) {
                result.searchData.relevantProducts.push(...productsFromFamily);
              } else {
                result.searchData.relevantProducts = productsFromFamily;
              }
            }
          }
        }
      } else {
        // Add the distance between the user and the shop
        searchResults = searchResults.map((sr) => {
          sr.searchData = {
            distance: calculateDistance(
              sr.address.latitude,
              sr.address.longitude,
              userPosition.latitude,
              userPosition.longitude,
              "K",
            ),
          };
          return sr;
        });

        // Trie les resultats par distance
        searchResults.sort(
          (a, b) => a.searchData.distance - b.searchData.distance,
        );
      }

      console.log("searchData :", JSON.stringify(searchResults, null, 2));

      res.json({ result: true, searchResults });
    } else {
      throw new Error("Missing fields.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const searchMarkets = async (req, res) => {
  try {
    const { city, radius } = req.body;

    if (!city) {
      throw new Error("Missing fields.");
    }
    console.log("radius: ", radius);

    const cityCoordinates = await getCityCoordinates(city);

    const searchArea = calculateMaxLatitudeLongitude(cityCoordinates, radius);

    console.log(searchArea);

    let markets = await Market.aggregate([
      {
        $match: {
          "address.latitude": {
            $lte: searchArea.latitude.max,
            $gte: searchArea.latitude.min,
          },
          "address.longitude": {
            $lte: searchArea.longitude.max,
            $gte: searchArea.longitude.min,
          },
        },
      },
    ]);

    if (!markets.length > 0) {
      throw new Error("Auncune place de marché trouvée.");
    }

    return res.status(200).json(markets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const addMarkets = async (req, res) => {
  try {
    const { shopId, marketIds } = req.body;

    const updatedShop = await Shop.findByIdAndUpdate(
      shopId,
      {
        $push: {
          markets: {
            $each: marketIds.map((marketId) => ({
              market: marketId,
              isActive: false,
              openingHours: [],
            })),
          },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedShop) {
      throw new Error("No shop found.");
    } else {
      const markets = await Shop.findById(shopId, {
        _id: 0,
        markets: 1,
      }).populate({
        path: "markets",
        populate: [
          {
            path: "market",
            model: "markets",
          },
        ],
      });

      res
        .status(200)
        .json({ message: "Place(s) de marché ajoutée(s)", markets });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const updateShopMarkets = async (req, res) => {
  console.log("passées :", JSON.stringify(req.body.markets, null, 2));
  try {
    const { shopId, markets } = req.body;
    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new Error("No shop found.");
    }

    markets.forEach((marketUpdate) => {
      const existingMarket = shop.markets.find(
        (m) => m.market.toString() === marketUpdate.market._id,
      );

      if (existingMarket) {
        existingMarket.isActive = marketUpdate.isActive;
        existingMarket.openingHours = marketUpdate.openingHours;
      } else {
        shop.markets.push({
          market: marketUpdate.market,
          openingHours: marketUpdate.openingHours,
          isActive: marketUpdate.isActive,
        });
      }
    });

    const updatedShop = await shop.save();

    const updatedMarkets = await Shop.findById(shopId, {
      _id: 0,
      markets: 1,
    }).populate({
      path: "markets",
      populate: [
        {
          path: "market",
          model: "markets",
        },
      ],
    });

    console.log("retournées :", JSON.stringify(updatedMarkets, null, 2));

    res.status(200).json(updatedMarkets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

// Calcul les bornes lat, lon pour ne chercher que les shops entre celles ci
const calculateMaxLatitudeLongitude = (initialPosition, radius) => {
  // Convert the radius in meters to latitude degrees
  const radiusInLatitude = (radius / 6378) * (180 / Math.PI);
  // Convert the radius in meters to longitude degrees
  const radiusInLongitude =
    ((radius / 6378) * (180 / Math.PI)) /
    Math.cos((initialPosition.latitude * Math.PI) / 180);

  return {
    latitude: {
      min: initialPosition.latitude - radiusInLatitude,
      max: initialPosition.latitude + radiusInLatitude,
    },
    longitude: {
      min: initialPosition.longitude - radiusInLongitude,
      max: initialPosition.longitude + radiusInLongitude,
    },
  };
};

// Calcul la distance entre deux jeux de coordonnées
const calculateDistance = (lat1, lon1, lat2, lon2, unit) => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
};

const getByProducer = async (req, res) => {
  try {
    const checkBodyFields = ["producer"];

    if (!validationModule.checkBody(req.params, checkBodyFields)) {
      throw new Error("Missing fields.");
    }

    const shop = await Shop.findOne({ producer: req.params.producer })
      .populate("notes")
      .populate({
        path: "types",
        model: "types",
      })
      .populate({
        path: "markets",
        populate: [
          {
            path: "market",
            model: "markets",
          },
        ],
      });

    console.log("shop getByProducer:", JSON.stringify(shop, null, 2));

    if (!shop) {
      throw new Error("This producer has no shop.");
    }

    res.json(shop);
  } catch (error) {
    console.log(error);
    //res.status(500).json({error: error.message})
  }
};

const getById = async (req, res) => {
  try {
    const checkBodyFields = ["id"];

    if (validationModule.checkBody(req.params, checkBodyFields)) {
      const mongooseShop = await Shop.findOne({ _id: req.params.id })
        .populate("notes")
        .populate("types")
        .populate("markets");
      if (!mongooseShop) {
        throw new Error("No shop found.");
      }

      const stocksFound = await Stock.find({ shop: mongooseShop._id }).populate(
        [
          {
            path: "product",
            populate: {
              path: "family",
              model: "productFamily",
              populate: { path: "category", model: "productcategory" },
            },
          },
          {
            path: "tags",
            model: "tags",
          },
        ],
      );

      const shop = mongooseShop.toObject();
      shop.categories = [];

      if (stocksFound.length > 0) {
        stocksFound.forEach((p) => {
          let category = shop.categories.find(
            (s) => s.name === p.product.family.category.name,
          );
          if (category) {
            category.products.push({
              _id: p._id,
              product: p.product.toObject(),
              shop: {
                _id: shop._id,
                name: shop.name,
                markets: shop.markets,
                clickCollect: shop.clickCollect,
              },
              stock: p.stock,
              price: p.price,
              tags: p.tags,
            });
          } else {
            shop.categories.push({
              ...p.product.family.category.toObject(),
              products: [
                {
                  _id: p._id,
                  product: p.product.toObject(),
                  shop: {
                    _id: shop._id,
                    name: shop.name,
                    markets: shop.markets,
                    clickCollect: shop.clickCollect,
                  },
                  stock: p.stock,
                  price: p.price,
                  tags: p.tags,
                },
              ],
            });
          }
        });
      }

      res.json({ result: true, shop });
    } else {
      throw new Error("Missing fields.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
    return;
  }
};

const getStocksFromProductsFamily = async (familyName, shopId) => {
  try {
    const family = await ProductFamily.findOne({ name: familyName });
    const products = await Product.find({ family: family._id });
    const productsInStock = [];
    for (const product of products) {
      const productInStock = await Stock.findOne({
        product: product._id,
        shop: shopId,
      })
        .populate("product")
        .populate("tags")
        .populate({
          path: "shop",
          model: "shops",
          populate: {
            path: "markets",
            model: "markets",
          },
        })
        .populate({
          path: "product",
          populate: {
            path: "family",
            model: "productFamily",
            populate: { path: "category", model: "productcategory" },
          },
        })
        .populate({
          path: "tags",
          model: "tags",
        });
      productInStock && productsInStock.push(productInStock);
    }
    return productsInStock;
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteShop = async (req, res) => {
  try {
    const shopId = req.params.shopId;
    console.log(shopId);
    await Shop.deleteOne({ _id: shopId });

    res.json({ result: true });
  } catch (error) {}
};

/**
 * Permet d'obtenir la latitude et la longitude d'une adresse
 * @param {string} address
 * @returns
 */
const getCoordinates = async (address) => {
  const query = (
    address.address1 +
    "%20" +
    address.postalCode +
    "%20" +
    address.city
  ).replaceAll(" ", "%20");
  const response = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${query}`,
  );
  const data = await response.json();
  const coordinates = {
    lat: data.features[0].geometry.coordinates[0],
    lon: data.features[0].geometry.coordinates[1],
  };
  return coordinates;
};

/**
 * Permet d'obtenir la latitude et la longitude d'une ville
 * @param {string} city
 * @returns
 */
const getCityCoordinates = async (city) => {
  const response = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${city}&type=municipality`,
  );
  const data = await response.json();
  const coordinates = {
    latitude: data.features[0].geometry.coordinates[0],
    longitude: data.features[0].geometry.coordinates[1],
  };
  return coordinates;
};

module.exports = {
  // createNewShop,
  createOrUpdateShop,
  updateClickCollect,
  searchShops,
  getById,
  deleteShop,
  getCoordinates,
  getByProducer,
  searchMarkets,
  addMarkets,
  updateShopMarkets,
};
