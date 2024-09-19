// importation du setup de mongo-memory-server
require("../mms.setup");

// importation du mock de clerk
import "../mockClerk";

const request = require("supertest");
const app = require("../../app");

const Producer = require("../../models/Producer");

// importation des getters de mock
const {
  getMockRole,
  getMockUser1,
  getMockUser2,
  getMockOrder,
  getMockProducer,
  getMockShop,
} = require("../mms.setup");

// initialisation des mocks avant chaque test
let mockRole, mockUser1, mockUser2, mockOrder, mockProducer, mockShop;

beforeEach(async () => {
  mockRole = getMockRole();
  mockUser1 = getMockUser1();
  mockOrder = getMockOrder();
  mockProducer = getMockProducer();
  mockShop = getMockShop();
});

describe("get /producers/logged", () => {
  it("should return producer's infos", async () => {
    const response = await request(app)
      .get("/producers/logged")
      .set("Authorization", "Bearer mock-valid-token")
      .expect(200);

    expect(response.status).toBe(200);
  });

  it("should return 401 if invalid tocken is provided", async () => {
    const response = await request(app)
      .get("/producers/logged")
      .set("Authorization", "Bearer invalid-tocken")
      .expect(401);

    expect(response.body.message).toBe("Unauthorized.");
  });

  it("should return 401 if no tocken is provided", async () => {
    const response = await request(app).get("/producers/logged").expect(401);

    expect(response.body.message).toBe("Unauthorized.");
  });
});

describe("Get /producers/:producer", () => {
  it("should return a producer from his social reason", async () => {
    const producer = "Producteur test";
    const response = await request(app)
      .get(`/producers/${producer}`)
      .expect(200);

    expect(response.status).toBe(200);
  });

  it("should return 404 if not found", async () => {
    const producer = "no producer";
    const response = await request(app)
      .get(`/producers/${producer}`)
      .expect(404);

    expect(response.body.message).toBe("No producer found.");
  });

  it("should return 404 if missing params", async () => {
    const response = await request(app).get("/producers/").expect(404);

    expect(response.body.message).toBe("Missing field.");
  });
});

describe("POST / : create a producer", () => {
  it("should return producer if created", async () => {
    // suppression du producer crée dans mms.setup pour pouvoir
    // passer le test
    await Producer.deleteMany({});

    const producerData = {
      socialReason: "Producteur test2",
      siren: "0987654321",
      owner: mockUser1._id,
      iban: "FR76 1234 5128 8912",
      bic: "JF1F54523GD",
      address: {
        address1: "test adresse 1 producteur",
        address2: "test adresse 2 producteur",
        postalCode: "01234",
        city: "ville Test",
        country: "France",
      },
    };

    const response = await request(app)
      .post("/producers/")
      .set("Authorization", "Bearer mock-valid-token")
      .send(producerData)
      .expect(201);

    expect(response.status).toBe(201);
  });

  it("should return 404 if producer already exists", async () => {
    const response = await request(app)
      .post("/producers/")
      .set("Authorization", "Bearer mock-valid-token")
      .expect(404);

    expect(response.body.message).toBe("Producer already exists");
  });
});
