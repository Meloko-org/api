const Role = require("../models/Role");

const createMockRole = async (role) => {
  // créer un producer dans la memory bdd
  const mockRole = new Role({
    name: role,
    description: "the description of the role",
  });

  await mockRole.save();

  return mockRole;
};

module.exports = {
  createMockRole,
};
