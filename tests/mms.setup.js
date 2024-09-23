const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const User = require("../models/User");
const Producer = require("../models/Producer");
const Order = require("../models/Order");
const Role = require("../models/Role");
const Shop = require("../models/Shop");

const { createMockUser } = require("../fixtures/userFixtures");
const { createMockOrder } = require("../fixtures/OrderFixtures");
const { createMockRole } = require("../fixtures/roleFixtures");
const { createMockProducer } = require("../fixtures/producerFixtures");
const { createMockShop } = require("../fixtures/shopFixtures");

process.env.NODE_ENV = "test";

let mongoServer,
  mockRole,
  mockUser1,
  mockUser2,
  mockOrder,
  mockProducer,
  mockShop;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose
    .connect(uri)
    .then(() => console.log("Memory Database connected"));

  mockRole = await createMockRole("user");
  mockUser1 = await createMockUser(
    "test@example.com",
    "mockClerkUUID",
    "cus_QeJJqJlIIRcrBh",
  );
  mockOrder = await createMockOrder(mockUser1._id);
  mockProducer = await createMockProducer(mockUser1._id);
  mockShop = await createMockShop(mockProducer._id);
  // user without producer
  mockUser2 = await createMockUser(
    "test2@example.com",
    "mockClerkUUID2",
    "cus_QeJJqJlIIRcrBp",
  );
});

afterAll(async () => {
  await User.deleteMany({});
  await Producer.deleteMany({});
  await Role.deleteMany({});
  await Order.deleteMany({});
  await Shop.deleteMany({});

  await mongoose.disconnect();
  await mongoServer.stop();
});

// après le test, on nettoie tous les mocks créés
afterEach(async () => {
  jest.clearAllMocks();
});

module.exports = {
  getMockRole: () => mockRole,
  getMockUser1: () => mockUser1,
  getMockOrder: () => mockOrder,
  getMockProducer: () => mockProducer,
  getMockShop: () => mockShop,
  getMockUser2: () => mockUser2,
};

// mock des types ObjectId et Decimal128 de mongoose
jest.mock("mongoose", () => {
  const originalModule = jest.requireActual("mongoose");

  return {
    ...originalModule,
    Types: {
      ...originalModule.Types,
      ObjectId: jest.fn(() => "mockedObjectId"), // Mock pour ObjectId
      Decimal128: jest.fn().mockImplementation((value) => ({
        toString: () => value,
        valueOf: () => value,
      })),
    },
  };
});
