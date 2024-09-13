const Order = require("../models/Order");

const createMockOrder = async (mockUserId) => {
  // crée une commande dans la memory bdd
  const mockOrder = new Order({
    user: mockUserId,
    details: [],
    isWithdrawn: false,
    isPaid: true,
    stripePIId: "pi_mock123",
  });
  await mockOrder.save();

  return mockOrder;
};

module.exports = {
  createMockOrder,
};
