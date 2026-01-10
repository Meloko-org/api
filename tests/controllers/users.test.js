// importation du setup de mongo-memory-server
require("../mms.setup");

// importation des getters de mock
const {
  getMockRole,
  getMockUser1,
  getMockOrder,
  getMockProducer,
  getMockShop,
} = require("../mms.setup");

const Role = require("../../models/Role");
const {
  getUserInfos,
  createNewUser,
  updateUser,
  addShopToBookmark,
  updateBookmarks,
} = require("../../controllers/userController");

// initialisation des mocks avant chaque test
let mockRole, mockUser1, mockOrder, mockProducer, mockShop;
beforeEach(async () => {
  mockRole = getMockRole();
  mockUser1 = getMockUser1();
  mockOrder = getMockOrder();
  mockProducer = getMockProducer();
  mockShop = getMockShop();
});

describe("createNewUser", () => {
  const mockClerkUserData = {
    id: "clerkUserId123",
    email_addresses: [
      { id: "email1", email_address: "test3@example.com" },
      { id: "email2", email_address: "test4@example.com" },
    ],
    primary_email_address_id: "email2",
    password_enabled: true,
  };

  it("should return true if a user is created", async () => {
    const response = await createNewUser(mockClerkUserData);
    expect(response).toBe(true);
  });

  /*it("should return false if user not created", async () => {
    // suppression du role pour faire échouer le test
    await Role.deleteMany({});
    const response = await createNewUser(mockClerkUserData);
    expect(response).toBe(false);
  });*/
});

describe("getUserInfos", () => {
  it("should return an user with this infos and orders", async () => {
    // Mock de la requête et de la réponse
    const req = {
      auth: {
        userId: mockUser1.clerkUUID,
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

    console.log("GETUSERINFOS:", receivedResponse);

    expect(receivedResponse).toMatchObject(
      expect.objectContaining({
        success: expect.any(Boolean),
        user: expect.objectContaining({
          _id: expect.anything(),
          email: expect.any(String),
          clerkPasswordEnabled: expect.any(String),
          stripeUUID: expect.any(String),
          firstname: expect.any(String),
          lastname: expect.any(String),
          avatar: expect.any(String),
          addresses: expect.any(Array),
          bookmarks: expect.any(Array),
          favSearch: expect.any(Array),
          settings: expect.objectContaining({
            helpHints: expect.any(Boolean),
          }),
          producer: expect.anything(),
        }),
      }),
    );
  });

  it("should return a 200 error if user not found", async () => {
    // Mock de la requête et de la réponse
    const req = {
      auth: {
        userId: "invalid-mockClerkUUID",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getUserInfos(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });
});

describe("updateUser", () => {
  it("should return the user updated", async () => {
    // Mock de la requête et de la réponse
    const req = {
      auth: {
        userId: mockUser1.clerkUUID,
      },
      body: {
        firstname: "new firstname",
        lastname: "new lastname",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        user: expect.objectContaining({
          firstname: "new firstname",
          lastname: "new lastname",
        }),
      }),
    );
  });
});

describe("Bookmarks", () => {
  it("should add a bookmarks to a user", async () => {
    const req = {
      auth: {
        userId: mockUser1.clerkUUID,
      },
      params: {
        shopId: mockShop._id,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateBookmarks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    // Récupérer l'objet envoyé dans `res.json`
    const receivedResponse = res.json.mock.calls[0][0];

    // console.log(receivedResponse);

    // Validation des champs de l'utilisateur
    expect(receivedResponse).toMatchObject(
      expect.objectContaining({
        success: true,
        user: expect.objectContaining({
          bookmarks: [expect.any(Object)],
        }),
        message: expect.any(String),
      }),
    );
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
