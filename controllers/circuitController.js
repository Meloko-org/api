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

      /* Recherche des shops correspondant aux paramètres */
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
        // on récupère les notes du shop
        {
          $lookup: {
            from: "notes",
            localField: "notes",
            foreignField: "_id",
            as: "notesData",
          },
        },
        // on crée un nouveau champ qui accueille la moyenne des notes
        {
          $addFields: {
            avgRating: { $avg: "$notesData.note" }, // $toDouble: pour éviter d'avoir {"$numberDecimal": "4.5"} cote frontend
          },
        },
        {
          $sort: { avgRating: -1 },
        },
      ]);

      if (!searchResults.length) {
        return res
          .status(200)
          .json({ success: true, results: { shops: [], route: null } });
      }

      console.log("CIRCUITCONT :", searchResults);

      /* construction de la requête Directions */
      const waypoints = searchResults
        .map((shop) => `${shop.address.latitude},${shop.address.longitude}`)
        .join("|");
      const origin = `${userPosition.latitude},${userPosition.longitude}`;
      const destination = origin;

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=optimize:true|${waypoints}&mode=driving&key=${process.env.GOOGLE_MAPS_API_KEY}`;

      /* appel google Direction */
      const response = await fetch(url);
      const data = await response.json();

      if (!data.routes?.length) {
        return res
          .status(200)
          .json({ success: false, message: "No route found" });
      }

      const route = data.routes[0];
      const polyline = route.overview_polyline.points;
      const waypointOrder = route.waypoint_order;

      /* total distance et duration */
      let totalDistance = 0;
      let totalDuration = 0;

      route.legs.forEach((leg) => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
      });

      /* réordonner les shops selon waypoint_order */
      const orderedShops = waypointOrder.map((idx) => searchResults[idx]);

      const results = {
        shops: orderedShops,
        polyline,
        totalDistance,
        totalDuration,
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
