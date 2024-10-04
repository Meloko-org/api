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

const Producer = require("../../models/Producer");
const User = require("../../models/User");

const {
  createNewProducer,
  getProducerInfos,
  searchProducer,
  updateProducer,
} = require("../../controllers/producerController");

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
    // console.log(res.json.mock.calls);
    // console.log("receivedResponse:", receivedResponse);

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

  it("should return 404 if producer already exists", async () => {
    const req = {
      auth: {
        userId: mockUser1.clerkUUID,
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

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Producer already exists",
    });
  });

  it("should return 500 if missing fields", async () => {
    await Producer.deleteOne({ owner: mockUser2._id });
    // missing siren field
    const req = {
      auth: {
        userId: mockUser2.clerkUUID,
      },
      body: {
        socialReason: "Producteur test",
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

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing fields." });
  });
});

describe("getProducerInfos", () => {
  it("should return producer infos", async () => {
    const req = {
      auth: {
        userId: mockUser1.clerkUUID,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getProducerInfos(req, res);

    const receivedResponse = res.json.mock.calls[0][0];

    expect(receivedResponse).toMatchObject(
      expect.objectContaining({
        socialReason: expect.any(String),
        siren: expect.any(String),
        owner: mockUser1._id,
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
    );
  });

  it("should return 404 if no producer found", async () => {
    const req = {
      auth: {
        userId: mockUser2.clerkUUID,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getProducerInfos(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({ message: "No producer found" });
  });

  it("should return 500 if error", async () => {
    // Mock User.findOne to simulate an internal error
    const findOneMock = jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(() => {
        throw new Error("Database error");
      });

    const req = {
      auth: {
        userId: mockUser2.clerkUUID,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getProducerInfos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });

    // Restore the original implementation of User.findOne
    findOneMock.mockRestore();
  });
});

describe("searchProducer", () => {
  it("should return a producer", async () => {
    const req = {
      params: {
        producer: mockProducer.socialReason,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await searchProducer(req, res);

    const receivedResponse = res.json.mock.calls[0][0];

    expect(res.status).toHaveBeenCalledWith(200);

    expect(receivedResponse).toMatchObject(
      expect.objectContaining({
        result: true,
        producerFound: expect.objectContaining({
          socialReason: expect.any(String),
          siren: expect.any(String),
          owner: mockUser1._id,
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
          _id: mockProducer._id,
        }),
      }),
    );
  });

  it("should return 404 if missing field", async () => {
    // field producer missing
    const req = {
      params: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await searchProducer(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Missing field." });
  });

  it("should return 404 if no producer found", async () => {
    const req = {
      params: {
        producer: "invalid social reason",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await searchProducer(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No producer found." });
  });

  it("should return 500 if error", async () => {
    // Mock User.findOne to simulate an internal error
    const findOneMock = jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(() => {
        throw new Error("Database error");
      });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await searchProducer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });

    // Restore the original implementation of User.findOne
    findOneMock.mockRestore();
  });
});

describe("updateProducer", () => {
  /*
		it("should return new producer's infos after update", async () => {
	
			const req = {
				auth: {
					userId: mockUser1.clerkUUID
				},
				body: {
					socialReason: "social reason updated",
					siren: "1234567890147",
					iban: "FR76 1234 5678 5487",
					bic: "JF1FDS8873G",
					address: {
						address1: "test adresse 1 producteur updated",
						address2: "test adresse 2 producteur updated",
						postalCode: "01254",
						city: "ville Test updated",
						country: "France",
					}
				}
			}
	
			const res = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn()
			}
	
			await producerController.updateProducer(req, res)
	
			expect(producerController.getProducerInfos).toHaveBeenCalled()
			
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "getProducerInfos called" }))
	
			// getProducerInfosMock.mockRestore()
		})*/

  it("should return 500 if no user found", async () => {
    const req = {
      auth: {
        userId: mockUser2.clerkUUID,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateProducer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "No producer found" });
  });

  it("should return 500 if missing fields", async () => {
    // field siren missing
    const req = {
      auth: {
        userId: mockUser1.clerkUUID,
      },
      body: {
        socialReason: "social reason updated",
        iban: "FR76 1234 5678 5487",
        bic: "JF1FDS8873G",
        address: {
          address1: "test adresse 1 producteur updated",
          address2: "test adresse 2 producteur updated",
          postalCode: "01254",
          city: "ville Test updated",
          country: "France",
        },
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateProducer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing fields." });
  });

  it("should return 500 if error", async () => {
    // Mock User.findOne to simulate an internal error
    const findOneMock = jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(() => {
        throw new Error("Database error");
      });

    const req = {
      auth: {
        userId: mockUser2.clerkUUID,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateProducer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });

    // Restore the original implementation of User.findOne
    findOneMock.mockRestore();
  });
});
