const Tag = require('../models/Tag')
const { validationModule } = require('../modules')

const createNewTag = async (req, res) => {
  try {
    // define the fields coming from req.body to check
    const checkBodyFields = [
      'name',
      'description',
      'color'
    ]

    // If all expected fields are present
    if(validationModule.checkBody(req.body, checkBodyFields)) {

      // Create and save the new tag
      const { name, description, color } = req.body

      const newTag = new Tag({
        name,
        description,
        color
      })

      await newTag.save()

      res.json({ result: true, tag: newTag})
    } else {
      throw new Error("Missing fields."); 
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message})
    return
  }
}

module.exports = {
  createNewTag
}