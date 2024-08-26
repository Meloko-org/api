const Role = require("../models/Role");
const { validationModule } = require("../modules");

const createNewRole = async (req, res) => {
  try {
    // define the fields coming from req.body to check
    const checkBodyFields = ["name", "description"];

    // If all expected fields are present
    if (validationModule.checkBody(req.body, checkBodyFields)) {
      // Create and save the new role
      const { name, description } = req.body;

      const newRole = new Role({
        name,
        description,
      });

      await newRole.save();

      res.json({ result: true, role: newRole });
    } else {
      throw new Error("Missing fields.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

module.exports = {
  createNewRole,
};
