const Shop = require('../models/Shop')
const User = require('../models/User')
const Producer = require('../models/Producer')
const { validationModule } = require('../modules')

const createNewShop = async (req, res) => {
  try {
    // define the fields coming from req.body to check
    const checkBodyFields = [
      'name',
      'description',
      'address',
      'siret',
      'types'
    ]

    // If all expected fields are present
    if(validationModule.checkBody(req.body, checkBodyFields)) {
      // Retreive the logged user and its producer profile
      const user = await User.findOne({ clerkUUID: req.auth.userId})
      const producer = await Producer.findOne({ owner: user._id })

      // If the user has no producer profile, trow an error
      if(!producer) {
        throw new Error("User has no existing producer profile."); 
      } 

      // Create and save the new shop
      const { name, description, address, siret, types } = req.body

      const newShop = new Shop({
        producer: producer._id,
        name,
        description,
        siret,
        address,
        types
      })

      await newShop.save()

      res.json({ result: true, producer: producer })
    } else {
      throw new Error("Missing fields."); 
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message})
    return
  }
}

const searchShops = async (req, res) => {
  try {

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message})
    return
  }
}

module.exports = {
  createNewShop,
  searchShops
}