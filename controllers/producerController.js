const Producer = require('../models/Producer')
const User = require('../models/User')
const { validationModule } = require('../modules')

const createNewProducer = async (req, res) => {
  try {
    // Retreive the logged user 
    const owner = await User.findOne({ clerkUUID: req.auth.userId})

    if(await Producer.findOne({ owner: owner._id })) {
      throw new Error("User already has a producer profile");
    } 
    
    // define the fields coming from req.body to check
    const checkBodyFields = [
      'socialReason',
      'siren',
      'iban',
      'bic',
      'address'
    ]

    // If all expected fields are present
    if(validationModule.checkBody(req.body, checkBodyFields)) {


      // Create and save the new producer
      const { socialReason, siren, iban, bic, address } = req.body
      
      const newProducer = new Producer({
        socialReason,
        siren,
        iban,
        bic,
        address,
        owner: owner._id
      })

      await newProducer.save()

      res.json({ result: true, producer: newProducer })
    } else {
      throw new Error("Missing fields."); 
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
    return
  }
}


const searchProducer = async (req, res) => {
  try {

    const checkBodyFields = [
      'producer'
    ];

    if (validationModule.checkBody(req.params, checkBodyFields)) {
      const producerFound = await Producer.findOne({ socialReason: req.params.producer });
      if (!producerFound) {
        throw new Error("No producers found.");
      }
      res.json({ result: true, producerFound});
    } else {
      throw new Error("Missing fields.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createNewProducer,
  searchProducer
}