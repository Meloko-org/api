const User = require("../models/User");

const createMockUser = async (email, mockClerkUUID, stripeUUID) => {
  // crée un utilisateur dans la memory bdd
  const mockUser = new User({
    email: email,
    clerkUUID: mockClerkUUID,
    clerkPasswordEnabled: "true",
    roles: [],
    firstname: "john",
    lastname: "Doe",
    bookmarks: [],
    favSearch: [],
    stripeUUID: stripeUUID,
  });
  await mockUser.save();

  return mockUser;
};

module.exports = {
  createMockUser,
};
