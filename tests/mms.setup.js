const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const User = require("../models/User");

process.env.NODE_ENV = "test";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose
    .connect(uri)
    .then(() => console.log("Memory Database connected"));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// après le test, on nettoie tous les mocks créés
afterEach(async () => {
  await User.deleteMany({});
  jest.clearAllMocks();
  // consoleLogMock.mockRestore()
});

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
