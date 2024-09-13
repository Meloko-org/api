const { getTestingKey } = require("./utils");
const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { toBeOneOf } = require("jest-extended");
expect.extend({ toBeOneOf });

const testUUID = "user_2kHhC1eGdQcKdPwk9hY2gz3kKHi";

it("GET /:id - Retrieve a shop", async () => {
  const shopId = "66be0353da92d57bdba1bcb3";
  const res = await request(app).get(`/shops/${shopId}`);
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual(expect.any(Object));

  // expect(res.body).toEqual({
  // 	result: true,
  // 	shop: {
  // 		_id: expect.any(String),
  // 		producer: expect.any(String),
  // 		name: expect.any(String),
  // 		siret: expect.any(String),
  // 		address: {
  // 			address1: expect.any(String),
  // 			address2: expect.toBeOneOf([expect.any(String), null]),
  // 			postalCode: expect.any(String),
  // 			city: expect.any(String),
  // 			country: expect.any(String),
  // 			latitude: {
  // 					$numberDecimal: expect.any(String)
  // 			},
  // 			longitude: {
  // 					$numberDecimal: expect.any(String)
  // 			},
  // 			createdAt: expect.any(String),
  // 			updatedAt: expect.any(String),
  // 			_id: expect.any(String)
  // 		},
  // 		description: expect.any(String),
  // 		photos: expect.any(Array),
  // 		video: expect.any(Array),
  // 		types: [
  // 		{
  // 			_id: expect.any(String),
  // 			name: expect.any(String),
  // 			image: expect.any(String),
  // 			description: expect.any(String),
  // 			createdAt: expect.any(String),
  // 			updatedAt: expect.any(String),
  // 			__v: 0
  // 		}
  // 		],
  // 		isOpen: expect.any(Boolean),
  // 		reopenDate: expect.toBeOneOf([expect.any(String), null]),
  // 		markets: expect.any(Array),
  // 		createdAt: expect.any(String),
  // 		updatedAt: expect.any(String),
  // 		__v: expect.any(Number),
  // 		notes: expect.any(Array),
  // 		clickCollect: expect.toBeOneOf([expect.any(Array), null]),
  // 		logo: expect.any(String)
  // 	}
  // })
});

it("POST - createNewShop & deleteShop", async () => {
  const testKey = await getTestingKey();

  const res = await request(app)
    .post(
      `/shops/?__clerk_testing_token=${testKey}&__clerk_testing_user_uuid=${testUUID}`,
    )
    .send({
      producer: "66b212eb32185b4275e18721",
      name: "TestShop",
      description: "test création de shop",
      address: {
        address1: "test adresse 1",
        address2: null,
        postalCode: "06542",
        city: "Test ville",
        country: "Test country",
        latitude: 43.7009358,
        longitude: 7.2683912,
        _id: "66b339729a76167d3a93df3c",
      },
      siret: "000 000 000 000",
      types: ["66b210b5bd946e81e70977dd"],
      photo: [],
      video: [],
      isOpen: false,
      reopenDate: null,
      markets: [],
      notes: [],
      logo: "https://www.made-in-06.com/wp-content/uploads/image4-e1542711265400-1080x608.jpg",
      clickCollect: null,
    });

  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual(expect.any(Object));
  // expect(res.body).toEqual({
  // 	result: true,
  // 	shop: {
  // 		_id: expect.any(String),
  // 		producer: expect.any(String),
  // 		name: expect.any(String),
  // 		siret: expect.any(String),
  // 		address: {
  // 			address1: expect.any(String),
  // 			address2: expect.any(String),
  // 			postalCode: expect.any(String),
  // 			city: expect.any(String),
  // 			country: expect.any(String),
  // 			_id: expect.any(String),
  // 			createdAt: expect.any(String),
  // 			updatedAt: expect.any(String)
  // 		},
  // 		description: expect.any(String),
  // 		photos: expect.any(Array),
  // 		video: expect.any(Array),
  // 		types: expect.any(Array),
  // 		isOpen: expect.any(Boolean),
  // 		reopenDate: expect.toBeOneOf(expect.any(String), null),
  // 		markets: expect.any(Array),
  // 		createdAt: expect.any(String),
  // 		updatedAt: expect.any(String),
  // 		__v: expect.any(Number),
  // 		notes: expect.any(Array),
  // 		clickCollect: expect.toBeOneOf(expect.any(String), null),
  // 		logo: expect.any(String)
  // 	}
  // })
  console.log(res.body.shop._id);
  const resDelete = await request(app).delete(
    `/shops/${res.body.shop._id}?__clerk_testing_token=${testKey}&__clerk_testing_user_uuid=${testUUID}`,
  );
  expect(resDelete.statusCode).toBe(200);
});

afterAll(() => {
  mongoose.connection.close();
});
