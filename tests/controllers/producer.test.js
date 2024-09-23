const mongoose = require("mongoose");

// importation du setup de mongo-memory-server
require("../mms.setup");

// importation des getters de mock
const {
  getMockRole,
  getMockUser1,
  getMockOrder,
  getMockProducer,
  getMockShop,
  getMockUser2,
} = require("../mms.setup");

// const Role = require("../../models/Role");
const { createNewProducer } = require("../../controllers/producerController");

// initialisation des mocks avant chaque test
let mockRole, mockUser1, mockOrder, mockProducer, mockShop, mockUser2;
beforeEach(async () => {
  mockRole = getMockRole();
  mockUser1 = getMockUser1();
  mockOrder = getMockOrder();
  mockProducer = getMockProducer();
  mockShop = getMockShop();
  mockUser2 = getMockUser2();
});

describe("createNewProducer", () => {
  it("should return a new producer if created", async () => {
    const req = {
      auth: {
        userId: mockUser2.clerkUUID,
      },
      body: {
        socialReason: "Producteur test",
        siren: "123456789054",
        iban: "FR76 1234 5678 7845",
        bic: "JF1FD54723GD",
        address: {
          address1: "test adresse 1 producteur",
          address2: "test adresse 2 producteur",
          postalCode: "01234",
          city: "ville Test",
          country: "France",
        },
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createNewProducer(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    // Récupérer l'objet envoyé dans `res.json`
    const receivedResponse = res.json.mock.calls[0][0];
    console.log(res.json.mock.calls);
    console.log("receivedResponse:", receivedResponse);

    expect(receivedResponse).toMatchObject(
      expect.objectContaining({
        result: true,
        producer: expect.objectContaining({
          socialReason: expect.any(String),
          siren: expect.any(String),
          owner: mockUser2._id,
          iban: expect.any(String),
          bic: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          __v: expect.any(Number),
          address: expect.objectContaining({
            address1: expect.any(String),
            address2: expect.any(String),
            postalCode: expect.any(String),
            city: expect.any(String),
            country: expect.any(String),
            _id: expect.any(mongoose.Types.ObjectId),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
          _id: expect.any(mongoose.Types.ObjectId),
        }),
      }),
    );
  });
});
