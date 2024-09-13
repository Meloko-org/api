// importation du setup de mongo-memory-server
require("../mms.setup");

const User = require("../../models/User");
const Order = require("../../models/Order");

const { createMockUser } = require("../../fixtures/userFixtures");
const { createMockOrder } = require("../../fixtures/OrderFixtures");
const { getUserInfos } = require("../../controllers/userController");

describe("getUserInfos", () => {
  beforeEach(async () => {
    // vide les collections avant chaque test
    await User.deleteMany({});
    await Order.deleteMany({});
    // consoleLogMock = jest.spyOn(console, 'error').mockImplementation(()=>{})
  });

  it("should return an user with this infos and orders", async () => {
    const mockUser = await createMockUser();
    const mockOrder = await createMockOrder(mockUser._id);

    const expectedResponse = {
      _id: mockUser._id,
      clerkUUID: "mockClerkUUID",
      clerkPasswordEnabled: "true",
      email: "test@example.com",
      firstname: "john",
      lastname: "Doe",
      avatar: null,
      bookmarks: [],
      favSearch: [],
      stripeUUID: "cus_QeJJqJlIIRcrBh",
      orders: [
        {
          _id: mockOrder._id,
          user: mockUser._id,
          details: [],
          isWithdrawn: false,
          isPaid: true,
          stripePIId: "pi_mock123",
          __v: mockOrder.__v,
          createdAt: mockOrder.createdAt,
          updatedAt: mockOrder.updatedAt,
        },
      ],
    };

    // Mock de la requête et de la réponse
    const req = {
      auth: {
        userId: "mockClerkUUID",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // appel de la fonction qu'on veut tester
    await getUserInfos(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    // Récupérer l'objet envoyé dans `res.json`
    const receivedResponse = res.json.mock.calls[0][0];

    console.log(receivedResponse);

    // Validation des champs de l'utilisateur
    expect(receivedResponse).toEqual(
      expect.objectContaining({
        email: "test@example.com",
        firstname: "john",
        lastname: "Doe",
        clerkPasswordEnabled: "true",
        stripeUUID: "cus_QeJJqJlIIRcrBh",
        avatar: null,
        bookmarks: [],
        favSearch: [],
      }),
    );

    // Vérifier que orders est un tableau
    expect(Array.isArray(receivedResponse.orders)).toBe(true);

    // Validation des commandes de l'utilisateur
    expect(receivedResponse.orders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          isPaid: true,
          isWithdrawn: false,
          stripePIId: "pi_mock123",
          details: [],
          user: mockUser._id, // Vérification de l'id utilisateur en string
          _id: mockOrder._id, // L'ID est généré dynamiquement, donc `any(String)`
          createdAt: mockOrder.createdAt, // Date générée dynamiquement
          updatedAt: mockOrder.updatedAt, // Date générée dynamiquement
          __v: mockOrder.__v, // Le versionnement de Mongoose
        }),
      ]),
    );
  });

  it("should return a 404 error if user not found", async () => {
    // Mock de la requête et de la réponse
    const req = {
      auth: {
        userId: "mockClerkUUID",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getUserInfos(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});

/* première version only Jest */
/*
// mock des modèles mongoose
jest.mock('../../models/User')
jest.mock('../../models/Order')


const mockUser = {
  _id: 'mockUserId',
  email: 'test@example.com',
  firstname: 'John',
  lastname: 'Doe',
  avatar: 'avatar.png',
  favSearch: [],
  bookmarks: [],
  toObject: jest.fn().mockReturnValue({ _id: 'mockUserId', email: 'test@example.com' }),
}

const mockOrders = [
  { _id: 'order1', details: [] },
  { _id: 'order2', details: [] },
]

describe('getUserInfos', () => {

    let consoleErrorMock
  
    const req = { auth: { userId: 'mockUserId' } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }
  
    // avant le test, on moque les fonctions mongoose
    beforeEach(() => {
      User.findOne = jest.fn()
      Order.find = jest.fn()
      consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(()=>{})
    })
  
    // après le test, on nettoie tous les mocks créés
    afterEach(() => {
      jest.clearAllMocks()
      consoleErrorMock.mockRestore()
    })
  
  
    it("should return the user infos and orders", async () => {
      
      User.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),  // Populate needs to return mockUser
      })
      Order.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),  // Important to chain populate correctly
        sort: jest.fn().mockResolvedValue(mockOrders),  // Resolving the promise with mock orders
      })
      
      
      // enfin on appelle la fonction, avec les mocks
      await getUserInfos(req, res)
  
      expect(User.findOne).toHaveBeenCalledWith(
        {clerkUUID: 'mockUserId'},
        expect.any(Object)
      )
      expect(Order.find).toHaveBeenCalledWith({user: 'mockUserId', isPaid: true})
      expect(res.json).toHaveBeenCalledWith({...mockUser.toObject(), orders: mockOrders })
  
    })
  
    it("should return an error 500 if no user found", async () => {
  
      // simuler un utilisateur non trouvé
      User.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      })
      
      await getUserInfos(req, res)
  
      expect(consoleErrorMock).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({error: "No user found"})
    })
  
    it("should return an error 500 if database error", async () => {
      // simuler un utilisateur non trouvé
      User.findOne.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Database error")),
      })
      await getUserInfos(req, res)
  
      expect(consoleErrorMock).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({error: "Database error"})
    })
    
  })*/
