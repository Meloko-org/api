const Type = require('../models/Type')

const { validationModule } = require('../modules')

const createNewType = async (req, res) => {
  try {
    // define the fields coming from req.body to check
    const checkBodyFields = [
      'name',
      'description',
      'image'
    ]

    // If all expected fields are present
    if(validationModule.checkBody(req.body, checkBodyFields)) {

      // Create and save the new shop type
      const { name, description, image } = req.body

      const newType = new Type({
        name,
        description,
        image,
      })

      await newType.save()

      res.json({ result: true, type: newType })
    } else {
      throw new Error("Missing fields."); 
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error})
    return
  }
}

module.exports = {
  createNewType
}