const Shop = require("../models/Shop");

const createMockShop = async (producerid) => {
  // créer un producer dans la memory bdd
  const mockShop = new Shop({
    producer: producerid,
    name: "Shop name",
    siret: "1234567890",
    address: {
      address1: "test adresse 1 producteur",
      address2: "test adresse 2 producteur",
      postalCode: "01234",
      city: "ville Test",
      country: "France",
      latitude: "11.215454",
      longitude: "32.215454",
    },
    description: "description du shop",
    photos: [],
    video: [],
    types: [],
    isOpen: false,
    reopendate: null,
    markets: [],
    notes: [],
    logo: "url du logo",
  });

  await mockShop.save();

  return mockShop;
};

module.exports = {
  createMockShop,
};
