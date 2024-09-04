const { getTestingKey } = require("./utils");
const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { toBeOneOf } = require("jest-extended");
expect.extend({ toBeOneOf });

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
    /*producer: {
      _id: expect.any(String),
      socialReason: expect.any(String),
      siren: expect.any(String),
      owner: expect.any(String),
      iban: expect.any(String),
      bic: expect.any(String),
      address: {
        address1: expect.any(String),
        address2: expect.any(String),
        postalCode: expect.any(String),
        city: expect.any(String),
        country: expect.any(String),
        _id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      __v: expect.any(Number),
    },*/
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
