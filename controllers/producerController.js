const Producer = require("../models/Producer");
const User = require("../models/User");
const { validationModule } = require("../modules");
const userController = require("./userController");

const createNewProducer = async (req, res) => {
  try {
    // Retreive the logged user
    const owner = await User.findOne({ clerkUUID: req.auth.userId });

    if (await Producer.findOne({ owner: owner._id })) {
      throw new Error("User already has a producer profile");
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

      res.json({ result: true, producer: newProducer });

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

const searchProducer = async (req, res) => {
  try {
    const checkBodyFields = ["producer"];

    if (validationModule.checkBody(req.params, checkBodyFields)) {
      const producerFound = await Producer.findOne({
        socialReason: req.params.producer,
      });
      if (!producerFound) {
        throw new Error("No producers found.");
      }
      res.json({ result: true, producerFound });
    } else {
      throw new Error("Missing fields.");
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
};
