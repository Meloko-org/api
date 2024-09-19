const Producer = require("../models/Producer");
const User = require("../models/User");
const { validationModule } = require("../modules");
const userController = require("./userController");

const createNewProducer = async (req, res) => {
  try {
    // Retreive the logged user
    const owner = await User.findOne({ clerkUUID: req.auth.userId });

    console.log("owner:", owner);

    if (await Producer.findOne({ owner: owner._id })) {
      console.log(
        `Un producteur existe déjà pour cet utilisateur ${owner._id}`,
      );
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
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const getProducerInfos = async (req, res) => {
  try {
    const userId = await User.findOne(
      { clerkUUID: req.auth.userId },
      { _id: 1 },
    );

    console.log("userId found: ", userId);

    const producer = await Producer.findOne({ owner: userId });

    if (!producer) {
      console.log(
        `Aucun producteur trouvé à partir du clerkUUID ${req.auth.userId}`,
      );
      return res.status(404).json({ message: "No producer found" });
    }

    res.json({ producer });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const searchProducer = async (req, res) => {
  console.log("searchProducer");
  try {
    const checkBodyFields = ["producer"];

    if (validationModule.checkBody(req.params, checkBodyFields)) {
      const producerFound = await Producer.findOne({
        socialReason: req.params.producer,
      });
      if (!producerFound) {
        console.log(
          `Aucun producteur trouvé avec ce paramètre: ${req.params.producer}`,
        );
        return res.status(404).json({ message: "No producer found." });
      }
      res.json({ result: true, producerFound });
    } else {
      console.log("Paramètre de recherche manquant.");
      return res.status(404).json({ message: "Missing field." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const updateProducer = async (req, res) => {
  try {
    console.log(req.auth.userId);
    const user = await User.findOne({ clerkUUID: req.auth.userId });

    if (!user) {
      throw new Error("No user found");
    }

    const producer = await Producer.findOne({ owner: user._id });

    if (!producer) {
      throw new Error("No producer found");
    }

    console.log(producer);
    console.log("socialReason: ", req.body.socialReason);

    // define the fields coming from req.body to check
    const checkBodyFields = ["socialReason", "siren", "iban", "bic", "address"];

    if (validationModule.checkBody(req.body, checkBodyFields)) {
      req.body.socialReason && (producer.socialReason = req.body.socialReason);
      req.body.siren && (producer.siren = req.body.siren);
      req.body.iban && (producer.iban = req.body.iban);
      req.body.bic && (producer.bic = req.body.bic);
      req.body.address && (producer.address = req.body.address);

      console.log("producer: ", producer);

      await producer.save();

      // res.json({result: true})

      /* récupérer les nouvelles infos pour mettre à jour le store */
      await userController.getUserInfos(req, res);
      // res.json(usertoStore)
    } else {
      throw new Error("Missing fields.");
    }
  } catch (error) {}
};

module.exports = {
  createNewProducer,
  searchProducer,
  updateProducer,
  getProducerInfos,
};
