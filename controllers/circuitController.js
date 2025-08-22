const {
  calculateMaxLatitudeLongitude,
} = require("../helpers/localisationHelpers");
const { Shop } = require("../models");
const { validationModule } = require("../modules");
const mongoose = require("mongoose");
const { search } = require("../routes/types");

const getCircuit = async (req, res) => {
  try {
    const checkBodyFields = [
      "duration",
      "radius",
      "types",
      "userPosition",
      "features",
    ];

    if (validationModule.checkBody(req.body, checkBodyFields)) {
      const { duration, radius, types, userPosition, features } = req.body;

      const searchArea = calculateMaxLatitudeLongitude(
        userPosition,
        radius.value[0],
      );

      const searchResults = await Shop.aggregate([
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
            ...(types?.length
              ? {
                  types: {
                    $in: types.map((id) => new mongoose.Types.ObjectId(id)),
                  },
                }
              : {}), // recherche souple $in
            ...(features?.length
              ? {
                  features: {
                    $all: features.map((id) => new mongoose.Types.ObjectId(id)),
                  },
                }
              : {}), // recherche stricte $all
            isOpen: { $eq: true },
            isPremium: { $eq: "true" },
          },
        },
      ]);

      console.log("CIRCUITCONT :", searchResults);

      const results = {
        shops: searchResults,
        route: "",
      };

      res.status(200).json({ success: true, results });
    } else {
      console.log("Des paramètres sont manquants.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

module.exports = {
  getCircuit,
};
