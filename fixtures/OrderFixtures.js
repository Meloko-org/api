const Order = require("../models/Order");

const createMockOrder = async (mockUserId) => {
  // crée une commande dans la memory bdd
  const mockOrder = new Order({
    user: mockUserId,
    billingAddress: {
      name: "maison",
      address1: "8 rue jean jean",
      postalCode: "06150",
      city: "Cannes",
      country: "France",
    },
    shippingAddress: {
      name: "maison",
      address1: "8 rue jean jean",
      postalCode: "06150",
      city: "Cannes",
      country: "France",
    },
    details: [],
    isWithdrawn: false,
    isPaid: true,
    paymentMethod: "stripe",
    stripePIId: "pi_mock123",
    totalHT: 800,
    totalVAT: 160,
    totalTTC: 960,
    orderNumber: "20251105-000045",
  });
  await mockOrder.save();

  return mockOrder;
};

module.exports = {
  createMockOrder,
};
