const { getTestingKey } = require('./utils')
const request = require('supertest')
const app = require('../app')
const mongoose = require('mongoose');
const { toBeOneOf } = require('jest-extended');
expect.extend({ toBeOneOf });

it('GET /logged', async () => {
    const testKey = await getTestingKey()
    const testUUID = 'user_2kYqqKeWxa4XxjAR4NkoFbM4DPv'
    const res = await request(app).get(`/users/logged?__clerk_testing_token=${testKey}&__clerk_testing_user_uuid=${testUUID}`)
    expect(res.statusCode).toBe(200)

    expect(res.body).toEqual({
      _id: expect.any(String),
      email: expect.any(String),
      firstname: expect.any(String),
      lastname: expect.any(String),
      avatar: expect.toBeOneOf([expect.any(String), null]),
      favSearch: expect.any(Array),
      bookmarks: expect.any(Array),
      orders: expect.any(Array),
      producer: {
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
          updatedAt: expect.any(String)
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number)
      }
    })
})

afterAll(() => {
  mongoose.connection.close();
});