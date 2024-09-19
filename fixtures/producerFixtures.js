const Producer = require("../models/Producer");

const createMockProducer = async (mockUserId) => {
  // créer un producer dans la memory bdd
  const mockProducer = new Producer({
    socialReason: "Producteur test",
    siren: "1234567890",
    owner: mockUserId,
    iban: "FR76 1234 5678 8912",
    bic: "JF1FDS523GD",
    address: {
      address1: "test adresse 1 producteur",
      address2: "test adresse 2 producteur",
      postalCode: "01234",
      city: "ville Test",
      country: "France",
    },
  });

  await mockProducer.save();

  return mockProducer;
};

module.exports = {
  createMockProducer,
};
