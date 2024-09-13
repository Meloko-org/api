const User = require("../models/User");

const createMockUser = async () => {
  // crée un utilisateur dans la memory bdd
  const mockUser = new User({
    email: "test@example.com",
    clerkUUID: "mockClerkUUID",
    clerkPasswordEnabled: "true",
    roles: [],
    firstname: "john",
    lastname: "Doe",
    bookmarks: [],
    favSearch: [],
    stripeUUID: "cus_QeJJqJlIIRcrBh",
  });
  await mockUser.save();

  return mockUser;
};

module.exports = {
  createMockUser,
};
