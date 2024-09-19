// importation du setup de mongo-memory-server
require("../mms.setup");

// importation du mock ClerkExpressWithAuth
import "../mockClerk";

const request = require("supertest");
const app = require("../../app");

// importation des getters de mock
const {
  getMockRole,
  getMockUser1,
  getMockOrder,
  getMockProducer,
  getMockShop,
} = require("../mms.setup");
// initialisation des mocks avant chaque test
let mockRole, mockUser1, mockOrder, mockProducer, mockShop;
beforeEach(() => {
  mockRole = getMockRole();
  mockUser1 = getMockUser1();
  mockOrder = getMockOrder();
  mockProducer = getMockProducer();
  mockShop = getMockShop();
});

describe("GET /users/logged", () => {
  // beforeEach(async () => {
  //   const mockUser = await createMockUser();
  // });
  it("should return user's info and orders", async () => {
    // simule une requête GET à /users/logged avec tocken valide
    const response = await request(app)
      .get("/users/logged")
      .set("Authorization", "Bearer mock-valid-token")
      .expect(200);

    expect(response.status).toBe(200);
  });

  // simule une requête GET à /users/logged avec un tocken non valide
  it("should return 401 when an invalid tocken is provided", async () => {
    const response = await request(app)
      .get("/users/logged")
      .set("Authorization", "Bearer invalid-tocken")
      .expect(401);

    expect(response.body.message).toBe("Unauthorized.");
  });

  // simule une requête GET à /users/logged sans tocken
  it("should return 401 when no tocken is provided", async () => {
    const response = await request(app).get("/users/logged").expect(401);

    expect(response.body.message).toBe("Unauthorized.");
  });
});

/*const { getTestingKey } = require("./utils");
const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { toBeOneOf } = require("jest-extended");
expect.extend({ toBeOneOf });

import { getUserInfos } from "../controllers/userController";
import { User } from "../models";

const testUUID = "user_2kHhC1eGdQcKdPwk9hY2gz3kKHi";

it("GET /logged - Retreive user data", async () => {
  const testKey = await getTestingKey();
  const res = await request(app).get(
    `/users/logged?__clerk_testing_token=${testKey}&__clerk_testing_user_uuid=${testUUID}`,
  );
  expect(res.statusCode).toBe(200);

  expect(res.body).toEqual({
    _id: expect.any(String),
    email: expect.any(String),
    firstname: expect.any(String),
    lastname: expect.any(String),
    avatar: expect.toBeOneOf([expect.any(String), null]),
    favSearch: expect.any(Array),
    bookmarks: expect.any(Array),
    orders: expect.any(Array),
    // producer: {
    //   _id: expect.any(String),
    //   socialReason: expect.any(String),
    //   siren: expect.any(String),
    //   owner: expect.any(String),
    //   iban: expect.any(String),
    //   bic: expect.any(String),
    //   address: {
    //     address1: expect.any(String),
    //     address2: expect.any(String),
    //     postalCode: expect.any(String),
    //     city: expect.any(String),
    //     country: expect.any(String),
    //     _id: expect.any(String),
    //     createdAt: expect.any(String),
    //     updatedAt: expect.any(String),
    //   },
    //   createdAt: expect.any(String),
    //   updatedAt: expect.any(String),
    //   __v: expect.any(Number),
    // },
  });
});

it("PUT /logged - Update firstname and lastname of user", async () => {
  const testKey = await getTestingKey();

  const resBefore = await request(app).get(
    `/users/logged?__clerk_testing_token=${testKey}&__clerk_testing_user_uuid=${testUUID}`,
  );

  const res = await request(app)
    .put(
      `/users/logged?__clerk_testing_token=${testKey}&__clerk_testing_user_uuid=${testUUID}`,
    )
    .send({
      firstname: "test",
      lastname: "test",
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.firstname).toEqual("test");
  expect(res.body.lastname).toEqual("test");

  const resAfter = await request(app)
    .put(
      `/users/logged?__clerk_testing_token=${testKey}&__clerk_testing_user_uuid=${testUUID}`,
    )
    .send({
      firstname: resBefore.body.firstname,
      lastname: resBefore.body.lastname,
    });

  expect(resAfter.statusCode).toBe(200);
  expect(resAfter.body.firstname).toEqual(resBefore.body.firstname);
  expect(resAfter.body.lastname).toEqual(resBefore.body.lastname);
});

afterAll(() => {
  mongoose.connection.close();
});
*/
