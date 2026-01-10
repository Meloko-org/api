const User = require("../models/User");

const createMockUser = async (email, mockClerkUUID, stripeUUID) => {
  // crée un utilisateur dans la memory bdd
  const mockUser = new User({
    email: email,
    clerkUUID: mockClerkUUID,
    clerkPasswordEnabled: "true",
    stripeUUID: stripeUUID,
    firstname: "john",
    lastname: "Doe",
    avatar: "url_de_l_image",
    bookmarks: [],
    addresses: [],
    favSearch: [],
    settings: {
      helpHints: true,
    },
  });
  await mockUser.save();

  return mockUser;
};

module.exports = {
  createMockUser,
};
