const Role = require("../models/Role");
const User = require("../models/User");

// Check if the logged user has the admin role in its roles field
const isUserAdmin = async (req, res, next) => {
  try {
    const roleName = "admin";
    const role = await Role.findOne({ name: roleName });
    const { userId } = req.auth;
    const user = await User.findOne({ clerkUUID: userId });
    if (user.roles.includes(role._id)) {
      next();
    } else {
      throw new Error("User do not have the right privileges.");
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: error.message });
  }
};

module.exports = {
  isUserAdmin,
};
