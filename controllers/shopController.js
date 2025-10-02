const {
  Shop,
  User,
  Producer,
  Product,
  ProductFamily,
  ProductCategory,
  Stock,
  Type,
  Market,
} = require("../models");
const { isProducerUser, hasShop } = require("../helpers/authHelpers");
const mongoose = require("mongoose");
const { validationModule } = require("../modules");
const Fuse = require("fuse.js");
const { returnShop } = require("../helpers/shopHelpers");

const updateShop = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(200)
        .json({ succes: false, message: "Shop not found." });
    }

    const { _id, name, siret, shortDesc, longDesc, logo, address, ...rest } =
      req.body;

    /* Add coordinates to address */
    const coordinates = await getCoordinates(address);
    address.latitude = coordinates.lat;
    address.longitude = coordinates.lon;

    await Shop.findOneAndUpdate(
      { _id },
      {
        producer: shop.producer,
        name,
        siret,
        shortDesc,
        longDesc,
        logo,
        address,
        ...rest,
      },
    );

    const updatedShop = await Shop.findById(_id);

    res.status(200).json({ success: true, shop: updatedShop });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
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

const updateTypes = async (req, res) => {
  console.log("les types :", req.body.types);
  try {
    const checkBodyFields = ["types"];

    if (!validationModule.checkBody(req.body, checkBodyFields)) {
      return res
        .status(404)
        .json({ success: false, message: "Les infos ne sont pas passées." });
    }

    const shop = await hasShop(req.auth.userId);

    shop.types = req.body.types;
    await shop.save();

    console.log(shop.types);

    res.status(200).json({
      success: true,
      types: shop.types,
    });
  } catch (error) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

const updateFeatures = async (req, res) => {
  try {
    const checkBodyFields = ["features"];

    if (!validationModule.checkBody(req.body, checkBodyFields)) {
      return res
        .status(404)
        .json({ success: false, message: "Les infos ne sont pas passées." });
    }

    const shop = await hasShop(req.auth.userId);

    shop.features = req.body.features;
    await shop.save();

    await shop.populate("features");
    console.log(shop.features);

    res.status(200).json({
      success: true,
      features: shop.features,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

const updateOffline = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found." });
    }

    const { isOpen, reopenDate } = req.body;

    shop.isOpen = isOpen;
    shop.reopenDate = reopenDate;

    await shop.save();

    const updatedShop = await Shop.findById(shop._id);

    res.status(200).json({ success: true, shop: updatedShop });
  } catch (error) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

const updateClickCollect = async (req, res) => {
  console.log("youpi");
  try {
    const checkBodyFields = ["openingHours"];

    console.log("body :", JSON.stringify(req.body, null, 2));

    if (!validationModule.checkBody(req.body, checkBodyFields)) {
      return res
        .status(404)
        .json({ success: false, message: "Les infos ne sont pas passées." });
    }

    const producer = await isProducerUser(req.auth.userId);

    if (!producer) {
      return res
        .status(404)
        .json({ success: false, message: "No producer found" });
    }

    const shop = await Shop.findOne({ producer: producer._id });

    if (!shop) {
      return res.status(404).json({ success: false, message: "No shop found" });
    }

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
    updateFields["clickCollect.isActive"] = req.body.isActive;

    // puis on met à jour le shop
    const updatedShop = await Shop.updateOne(
      { _id: shop._id },
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (updatedShop.mofifiedCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Aucun changement effectué." });
    }

    const updatedShopDetails = await Shop.findById(shop._id);

    console.log("updatedShop: ", updatedShop);

    res.status(200).json({
      success: true,
      shop: updatedShopDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

const searchShopsOrMarkets = async (req, res) => {
  try {
    const checkBodyFields = ["radius", "userPosition", "searchType"];

    if (!validationModule.checkBody(req.body, checkBodyFields)) {
      res
        .status(404)
        .json({ success: false, message: "Des champs sont manquants." });
    }

    const { query = "", userPosition, radius, searchType } = req.body;

    const isQueryProvided = query && query.trim() !== "";

    const bounds = calculateMaxLatitudeLongitude(userPosition, radius);

    console.log("params : ", query, userPosition, radius, searchType);
    console.log("bounds: ", bounds);

    if (searchType === "shop") {
      // on établie la liste des shops (isOpen = true)
      // - qui se trouvent dans le périmètre défini puisque c'est une recherche par shop
      // - qui vendent le ou les produits recherchés (avec fuse) si stock > 0
      const shops = await Shop.aggregate([
        {
          $match: {
            isOpen: true,
            "address.latitude": {
              $gte: bounds.latitude.min,
              $lte: bounds.latitude.max,
            },
            "address.longitude": {
              $gte: bounds.longitude.min,
              $lte: bounds.longitude.max,
            },
          },
        },
        {
          $lookup: {
            from: "stocks",
            let: { shopId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$shop", "$$shopId"] },
                      { $gt: ["$stock", 0] },
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: "products",
                  localField: "product",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $unwind: "$product",
              },
              {
                $lookup: {
                  from: "productfamilies",
                  localField: "product.family",
                  foreignField: "_id",
                  as: "product.family",
                },
              },
              {
                $unwind: {
                  path: "$product.family",
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
            as: "stocks",
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

      // console.log(
      //   shops
      //     .map((shop) =>
      //       shop.stocks.map((stock) => ({
      //         productCustomName: stock.productCustomName,
      //         productName: stock.product?.name,
      //         familyName: stock.product?.family?.name,
      //         tagNames: stock.tags?.map((tag) => tag.name),
      //       })),
      //     )
      //     .flat(),
      // );

      // Étape 1 : construire une liste à aplatir pour la recherche Fuse
      const fuseItems = shops
        .map((shop) =>
          shop.stocks.map((stock) => {
            const searchable = [
              stock.productCustomName || "",
              stock.product?.name || "",
              stock.product?.family?.name || "",
              ...(stock.tags?.map((tag) => tag.name) || []),
            ]
              .join(" ")
              .toLowerCase(); // 👈 pour rendre insensible à la casse

            return {
              shop,
              stock,
              searchable,
            };
          }),
        )
        .flat();

      // fuseItems.forEach(item => console.log(item.searchable));

      // Étape 2 : configuration de Fuse
      const fuse = new Fuse(fuseItems, {
        includeScore: true,
        threshold: 0.5, // ajustable
        keys: ["searchable"],
      });

      let matchedShops;

      if (isQueryProvided) {
        // Étape 3 : lancer la recherche
        const fuseResults = fuse.search(query);

        // Étape 4 : regrouper les résultats par shop, en comptant le nombre de produits matchés
        const shopMatchesMap = new Map();

        fuseResults.forEach(({ item }) => {
          const shopId = item.shopId;
          if (!shopMatchesMap.has(shopId)) {
            shopMatchesMap.set(shopId, {
              shop: item.shop,
              matchedStocks: [],
            });
          }
          shopMatchesMap.get(shopId).matchedStocks.push(item.stock);
        });

        // Étape 5 : transformer en tableau et trier par nombre de produits matchés puis distance
        matchedShops = Array.from(shopMatchesMap.values()).map((entry) => ({
          ...entry,
          matchCount: entry.matchedStocks.length,
        }));
      } else {
        // Pas de query -> on retourne tous les shops trouvés dans le périmètre avec leurs stocks
        matchedShops = shops.map((shop) => ({
          shop,
          matchedStocks: shop.stocks,
          matchCount: shop.stocks.length,
        }));
      }

      // Étape 5 : transformer en tableau et trier par nombre de produits matchés puis distance
      // matchedShops = Array.from(shopMatchesMap.values());

      // Calculer la distance
      matchedShops = matchedShops.map((entry) => {
        const { shop } = entry;
        const distance = calculateDistance(
          userPosition.latitude,
          userPosition.longitude,
          parseFloat(shop.address.latitude),
          parseFloat(shop.address.longitude),
        );
        return {
          ...entry,
          distance,
          matchCount: entry.matchedStocks.length,
        };
      });

      // Trier : d'abord par matchCount (desc), puis par distance (asc)
      matchedShops.sort((a, b) => {
        if (b.matchCount !== a.matchCount) {
          return b.matchCount - a.matchCount;
        }
        return a.distance - b.distance;
      });

      // console.log("matchedShops :", matchedShops)

      // Et renvoyer au frontend
      return res.status(200).json({
        success: true,
        shopResults: matchedShops.map(({ shop, matchedStocks, distance }) => ({
          shop: shop,
          relevantProducts: matchedStocks,
          distance,
        })),
      });
    }

    if (searchType === "market") {
      // on détermine les markets dans le périmètre
      const matchedMarkets = await Market.find({
        "address.latitude": {
          $gte: bounds.latitude.min,
          $lte: bounds.latitude.max,
        },
        "address.longitude": {
          $gte: bounds.longitude.min,
          $lte: bounds.longitude.max,
        },
      });
      // on stocke leur id
      const matchedMarketIdsSet = new Set(
        matchedMarkets.map((m) => m._id.toString()),
      );

      const shops = await Shop.aggregate([
        {
          $match: {
            isOpen: true,
          },
        },
        {
          $lookup: {
            from: "stocks",
            let: { shopId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$shop", "$$shopId"] },
                      { $gt: ["$stock", 0] },
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: "products",
                  localField: "product",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $unwind: "$product",
              },
              {
                $lookup: {
                  from: "productfamilies",
                  localField: "product.family",
                  foreignField: "_id",
                  as: "product.family",
                },
              },
              {
                $unwind: {
                  path: "$product.family",
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
            as: "stocks",
          },
        },
        {
          $lookup: {
            from: "markets",
            localField: "markets.market",
            foreignField: "_id",
            as: "populatedMarkets",
          },
        },
        {
          $addFields: {
            markets: {
              $map: {
                input: "$markets",
                as: "marketEntry",
                in: {
                  $let: {
                    vars: {
                      matchedMarket: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$populatedMarkets",
                              as: "pm",
                              cond: {
                                $eq: ["$$pm._id", "$$marketEntry.market"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      $mergeObjects: [
                        "$$marketEntry",
                        {
                          market: {
                            $ifNull: ["$$matchedMarket", {}], // <- si pas trouvé, on met un objet vide
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        // {
        //   $addFields: {
        //     markets: {
        //       $map: {
        //         input: "$markets",
        //         as: "marketEntry",
        //         in: {
        //           $mergeObjects: [
        //             "$$marketEntry",
        //             {
        //               market: {
        //                 $arrayElemAt: [
        //                   {
        //                     $filter: {
        //                       input: "$populatedMarkets",
        //                       as: "pm",
        //                       cond: {
        //                         $eq: ["$$pm._id", "$$marketEntry.market"],
        //                       },
        //                     },
        //                   },
        //                   0,
        //                 ],
        //               },
        //             },
        //           ],
        //         },
        //       },
        //     },
        //   },
        // },
        {
          $project: {
            populatedMarkets: 0, // on nettoie ce champ temporaire
          },
        },
        // {
        //   $lookup: {
        //     from: "types",
        //     localField: "types",
        //     foreignField: "_id",
        //     as: "types",
        //   },
        // },
        {
          $lookup: {
            from: "notes",
            localField: "notes",
            foreignField: "_id",
            as: "notes",
          },
        },
      ]);

      // Étape 1 : construire une liste à aplatir pour la recherche Fuse
      const fuseItems = shops
        .map((shop) =>
          shop.stocks.map((stock) => {
            const searchable = [
              stock.productCustomName || "",
              stock.product?.name || "",
              stock.product?.family?.name || "",
              ...(stock.tags?.map((tag) => tag.name) || []),
            ]
              .join(" ")
              .toLowerCase(); // 👈 pour rendre insensible à la casse

            return {
              shop,
              stock,
              searchable,
            };
          }),
        )
        .flat();

      // fuseItems.forEach(item => console.log(item.searchable));

      // Étape 2 : configuration de Fuse
      const fuse = new Fuse(fuseItems, {
        includeScore: true,
        threshold: 0.5, // ajustable
        keys: ["searchable"],
      });

      let matchedShops;

      if (isQueryProvided) {
        // Étape 3 : lancer la recherche
        const fuseResults = fuse.search(query);

        // Étape 4 : regrouper les résultats par shop, en comptant le nombre de produits matchés
        const shopMatchesMap = new Map();

        fuseResults.forEach(({ item }) => {
          const shopId = item.shopId;
          if (!shopMatchesMap.has(shopId)) {
            shopMatchesMap.set(shopId, {
              shop: item.shop,
              matchedStocks: [],
            });
          }
          shopMatchesMap.get(shopId).matchedStocks.push(item.stock);
        });

        // Étape 5 : transformer en tableau et trier par nombre de produits matchés puis distance
        matchedShops = Array.from(shopMatchesMap.values()).map((entry) => ({
          ...entry,
          matchCount: entry.matchedStocks.length,
        }));
      } else {
        matchedShops = shops.map((shop) => ({
          shop,
          matchedStocks: shop.stocks,
        }));
      }

      // Étape 5 : transformer en tableau et trier par nombre de produits matchés puis distance
      // matchedShops = Array.from(shopMatchesMap.values());

      // Étape 4 : identifier les markets actifs associés à ces shops
      const marketMap = new Map();

      matchedShops.forEach(({ shop, matchedStocks }) => {
        if (Array.isArray(shop.markets)) {
          shop.markets.forEach((marketData) => {
            if (
              marketData.isActive &&
              marketData.market &&
              matchedMarketIdsSet.has(marketData.market._id.toString())
            ) {
              const marketId = marketData.market._id.toString();
              if (!marketMap.has(marketId)) {
                marketMap.set(marketId, {
                  market: marketData.market,
                  shops: [],
                  distance: null, // à calculer ensuite
                });
              }
              marketMap.get(marketId).shops.push({
                ...shop,
                matchedStocks,
              });
            }
          });
        }
      });

      // Étape 5 : calcul des distances + formattage final
      const marketResults = Array.from(marketMap.values()).map((entry) => {
        const { market } = entry;
        // console.log("market :", market);
        const distance = calculateDistance(
          userPosition.latitude,
          userPosition.longitude,
          parseFloat(market.address.latitude),
          parseFloat(market.address.longitude),
        );
        return {
          ...entry,
          distance,
        };
      });

      // Étape 6 : tri des markets (par distance par exemple)
      marketResults.sort((a, b) => a.distance - b.distance);

      console.log("markets :", marketResults);

      return res.status(200).json({
        success: true,
        marketResults,
      });
    }
  } catch (error) {
    console.error("Erreur dans searchShopsOrMarkets:", error);
    res
      .status(500)
      .json({ success: false, message: "Erreur interne du serveur" });
  }
};

const searchShops = async (req, res) => {
  try {
    // define the fields coming from req.body to check
    const checkBodyFields = ["query", "radius", "userPosition", "searchType"];

    console.log("req body :", req.body);

    // If all expected fields are present
    if (validationModule.checkBody(req.body, checkBodyFields)) {
      const { query, userPosition, radius, searchType } = req.body;

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
                $match: {
                  stock: { $gt: 0 },
                },
              },
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

      console.log(
        "results:",
        searchResults.map((result) => result._id),
      );

      // If there are query terms
      if (query !== "") {
        // Define the keys and weights that the fuzzy search will be applied
        const searchKeys = [
          {
            name: "productCustomName",
            weight: 1,
          },
          // {
          //   name: "description",
          //   weight: 1,
          // },
          {
            name: "stocks.product.name",
            weight: 1,
          },
          {
            name: "stocks.product.family.name",
            weight: 0.5,
          },
          // {
          //   name: "types.name",
          //   weight: 0.5,
          // },
          {
            name: "stocks.product.tags.name",
            weight: 0.8,
          },
        ];

        // Define additional fuseSearch options
        const searchOptions = {
          minMatchCharLength: 3,
          includeScore: true,
          includeMatches: true,
          keys: searchKeys,
          shouldSort: true,
          threshold: 0.3,
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

      // console.log("searchData :", JSON.stringify(searchResults, null, 2));

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
      return res.status(200).json({
        success: false,
        data: null,
        message: "Aucune place de marché trouvée.",
      });
    }

    return res.status(200).json({ success: true, markets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const addMarkets = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);

    if (!shop) {
      return res
        .status(200)
        .json({ succes: false, message: "Shop not found." });
    }

    const { marketIds } = req.body;

    const updatedShop = await Shop.findByIdAndUpdate(
      shop._id,
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

    // if (!updatedShop) {
    //   throw new Error("No shop found.");
    // } else {
    //   const markets = await Shop.findById(shop._id, {
    //     _id: 0,
    //     markets: 1,
    //   }).populate({
    //     path: "markets",
    //     populate: [
    //       {
    //         path: "market",
    //         model: "markets",
    //       },
    //     ],
    //   });

    //   res
    //     .status(200)
    //     .json({ success: true, markets });
    // }

    if (!updatedShop) {
      return res.status(200).json({
        success: false,
        message: "Impossible de mettre à jour les points de vente.",
      });
    }

    /* termine la fonction en retournant tout le shop (sans les produits) */
    const returnedShop = await returnShop(shop._id);
    if (!returnedShop) {
      return res
        .status(200)
        .json({ success: false, message: "Impossible de retourner le shop." });
    }
    res.status(200).json({
      success: true,
      shop: returnedShop,
      message: "Point de vente ajouté.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const updateShopMarkets = async (req, res) => {
  // console.log("passées :", JSON.stringify(req.body, null, 2));
  try {
    const shop = await hasShop(req.auth.userId);

    if (!shop) {
      return res.status(200).json({ success: false, message: "No shop found" });
    }

    const markets = req.body;

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

    // const updatedShop = await shop.save();

    // const updatedMarkets = await Shop.findById(shopId, {
    //   _id: 0,
    //   markets: 1,
    // }).populate({
    //   path: "markets",
    //   populate: [
    //     {
    //       path: "market",
    //       model: "markets",
    //     },
    //   ],
    // });

    // res.status(200).json({ success: true, markets: updatedMarkets });

    await shop.save();

    /* termine la fonction en retournant tout le shop (sans les produits) */
    const returnedShop = await returnShop(shop._id);
    if (!returnedShop) {
      return res
        .status(200)
        .json({ success: false, message: "Impossible de retourner le shop." });
    }
    console.log("shopRetourné :", returnedShop);
    res.status(200).json({ success: true, shop: returnedShop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

const getAvailableProductsForAShop = async (req, res) => {
  try {
    const producer = await isProducerUser(req.auth.userId);

    const shop = await Shop.findOne({ producer: producer._id }).select("types");
    if (!shop) {
      throw new Error("No shop found.");
    }

    const typesToCategoriesMapping = {
      "66b210b5bd946e81e70977dd": ["Fruits", "Légumes"],
      "66cc473ec844239d24552630": ["fromages"],
      "66cc477fc844239d24552631": ["vins"],
    };

    const authorizedCategories = new Set();

    console.log("shop:", shop.types);

    shop.types.forEach((typeId) => {
      const categoriesFortype = typesToCategoriesMapping[typeId];
      if (categoriesFortype) {
        categoriesFortype.forEach((category) => {
          authorizedCategories.add(category);
        });
      }
    });

    const categoryNames = Array.from(authorizedCategories);
    // on récupère les id des catégories authorisées
    const categories = await ProductCategory.find({
      name: { $in: categoryNames },
    });
    const categoryIds = categories.map((cat) => cat._id);
    // on récupère les familles de produits en fonction des catégories authorisées
    const families = await ProductFamily.find({
      category: { $in: categoryIds },
    });
    const familyIds = families.map((fam) => fam._id);
    // on récupère tous les produits qui appartiennent aux familles
    const products = await Product.find({
      family: { $in: familyIds },
    }).populate({
      path: "family",
      model: "productFamily",
      populate: {
        path: "category",
        model: "productcategory",
      },
    });

    // Tri des produits d'abord par catégorie, puis par famille
    products.sort((a, b) => {
      // Tri par nom de catégorie (en supposant que le champ s'appelle `name` dans `category`)
      if (a.family.category.name < b.family.category.name) return -1;
      if (a.family.category.name > b.family.category.name) return 1;

      // Si les catégories sont identiques, trier par nom de famille
      if (a.family.name < b.family.name) return -1;
      if (a.family.name > b.family.name) return 1;

      return 0;
    });

    // on déduit de la liste des produits, tous les produits qui ont déjà un stock
    const stocks = await Stock.find({ shop: shop._id });
    const stockedProductIds = new Set(
      stocks.map((stock) => stock.product.toString()),
    );

    let availableProducts = products.filter(
      (product) => !stockedProductIds.has(product._id.toString()),
    );

    console.log("terms:", req.body.searchTerm);

    // réduction des résultats en fonction des terme de recherche
    if (req.body.searchTerm) {
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
          name: "family",
          weight: 1,
        },
      ];

      // Define additional fuseSearch options
      const searchOptions = {
        minMatchCharLength: 3,
        includeScore: true,
        includeMatches: true,
        keys: searchKeys,
        shouldSort: true,
        threshold: 0.4,
      };

      // Instantiate a Fuse class
      const fuse = new Fuse(availableProducts, searchOptions);
      // Execute the fuse search
      const fuseSearch = fuse.search(req.body.searchTerm);

      availableProducts = fuseSearch.map((product) => {
        const item = product.item;

        item.searchData = {
          documentIndex: product.refIndex,
          matches: product.matches,
          score: product.score,
        };

        return item;
      });
    }

    console.log(availableProducts.length);

    res.json(availableProducts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const addProductsToAShop = async (req, res) => {
  try {
    const producer = await isProducerUser(req.auth.userId);

    const shop = await Shop.findOne({ producer: producer._id });
    if (!shop) {
      throw new Error("No shop found.");
    }

    const productIds = req.body;

    await Promise.all(
      productIds.map((id) => {
        const newStock = new Stock({
          product: id,
          shop: shop._id,
          stock: 0,
          price: 0,
          tags: [],
        });
        return newStock.save();
      }),
    );

    res.status(200).json({ message: "Produit(s) ajouté(s)" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
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

const getShopInfos = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    // const shopInfos = await Shop.findById(shop._id)
    //   .populate({
    //     path: "notes",
    //     populate: {
    //       path: "user",
    //       model: "users",
    //     },
    //   })
    //   .populate({
    //     path: "types",
    //     model: "types",
    //   })
    //   .populate({
    //     path: "markets",
    //     populate: [
    //       {
    //         path: "market",
    //         model: "markets",
    //       },
    //     ],
    //   })
    //   .populate({
    //     path: "features",
    //     model: "shopfeatures",
    //   });

    // console.log(shopInfos);

    // res.status(200).json({ success: true, shopInfos });

    const withStocks = req.query.withStocks === "true";

    console.log("withStocks :", withStocks);

    /* termine la fonction en retournant tout le shop (avec les produits) */
    const returnedShop = await returnShop(shop._id, withStocks);

    if (!returnedShop) {
      return res
        .status(200)
        .json({ success: false, message: "Impossible de retourner le shop." });
    }

    // console.log("returnedShop :", returnedShop.products)

    res.status(200).json({ success: true, shopInfos: returnedShop });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

const getMarketById = async (req, res) => {
  try {
    const checkBodyFields = ["marketId"];

    if (!validationModule.checkBody(req.params, checkBodyFields)) {
      throw new Error("Missing fields.");
    }

    const market = await Market.findById(req.params.marketId);

    if (!market) {
      throw new Error("No market found for this id");
    }

    res.status(200).json(market);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
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

const getStocksByShopAndCategory = async (req, res) => {
  try {
    const { shopId, categoryName } = req.params;

    const stocks = await Stock.aggregate([
      {
        $match: {
          shop: new mongoose.Types.ObjectId(shopId),
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "productfamilies",
          localField: "product.family",
          foreignField: "_id",
          as: "family",
        },
      },
      { $unwind: "$family" },
      {
        $lookup: {
          from: "productcategories",
          localField: "family.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $match: {
          "category.name": categoryName,
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
    ]);

    console.log(stocks);

    const formattedStocks = stocks.map((stock) => ({
      _id: stock._id,
      price: stock.price,
      stock: stock.stock,
      shop: stock.shop,
      productCustomName: stock.productCustomName,
      pricePerKilo: stock.pricePerKilo,
      weightPerUnit: stock.weightPerUnit,
      origin: stock.origin,
      format: stock.format,
      portion: stock.portion,
      bestBeforeDate: stock.bestBeforeDate,
      image: stock.image,
      tags: stock.tags,
      description: stock.description,
      product: {
        _id: stock.product._id,
        name: stock.product.name,
        image: stock.product.image,
        weight: stock.product.weight,
        family: {
          _id: stock.family._id,
          name: stock.family.name,
          productsTypes: stock.family.productsTypes,
          category: {
            _id: stock.category._id,
            name: stock.category.name,
          },
        },
      },
    }));

    res.status(200).json({
      success: true,
      stocks: formattedStocks,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erreur interne du serveur." });
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
    lat: data.features[0].geometry.coordinates[1],
    lon: data.features[0].geometry.coordinates[0],
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
    latitude: data.features[0].geometry.coordinates[1],
    longitude: data.features[0].geometry.coordinates[0],
  };
  return coordinates;
};

const updateSocialNetworks = async (req, res) => {
  try {
    const { network, updates } = req.body;

    if (!["instagram", "facebook", "tiktok"].includes(network)) {
      return res
        .status(400)
        .json({ success: false, message: "Réseau non supporté" });
    }

    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found." });
    }

    shop.socials[network] = {
      ...shop.socials[network]._doc,
      ...updates,
    };

    await shop.save();

    return res.status(200).json({ success: true, shop });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateSocialPostSettings = async (req, res) => {
  try {
    const { frequency, customHashtags, customMentions } = req.body;

    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found." });
    }

    if (frequency) {
      shop.socialPostSettings.frequency = frequency;
    }
    if (customHashtags) {
      shop.socialPostSettings.customHashtags = customHashtags;
    }
    if (customMentions) {
      shop.socialPostSettings.customMentions = customMentions;
    }

    await shop.save();

    return res.status(200).json({ success: true, shop });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAvailableHashtags = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found." });
    }

    const stocks = await Stock.find({ shop: shop._id }).populate("tags");
    const tagMap = new Map();

    stocks.forEach((stock) => {
      stock.tags.forEach((tag) => {
        tagMap.set(tag._id.toString(), tag);
      });
    });

    console.log(tagMap);

    const uniqueTags = Array.from(tagMap.values());

    return res.status(200).json({ success: true, tags: uniqueTags });
  } catch (error) {
    console.error("Erreur getAvailableHashtags", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  // createNewShop,
  updateShop,
  createOrUpdateShop,
  updateTypes,
  updateFeatures,
  updateOffline,
  updateClickCollect,
  searchShopsOrMarkets,
  searchShops,
  getById,
  deleteShop,
  getCoordinates,
  getShopInfos,
  searchMarkets,
  addMarkets,
  updateShopMarkets,
  getAvailableProductsForAShop,
  getStocksByShopAndCategory,
  addProductsToAShop,
  getMarketById,
  updateSocialNetworks,
  updateSocialPostSettings,
  getAvailableHashtags,
};
