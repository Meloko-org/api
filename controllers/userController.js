const { User, Role, Order, Producer } = require("../models");

// Create a new user in the database using data provided by a Clerk webhook
const createNewUser = async (clerkUserData) => {
  try {
    const userRole = await Role.findOne({ name: "user" });
    if (!userRole) throw new Error("Le role user n'existe pas.");

    const email = clerkUserData.email_addresses.find(
      (ea) => ea.id === clerkUserData.primary_email_address_id,
    ).email_address;
    const clerkUUID = clerkUserData.id;
    const clerkPasswordEnabled = clerkUserData.password_enabled;

    const newUser = new User({
      email,
      clerkUUID,
      roles: [userRole._id],
      clerkPasswordEnabled,
    });

    await newUser.save();

    return true;
  } catch (error) {
    // console.error(error);
    return false;
  }
};

const getUserInfos = async (req, res) => {
  try {
    const user = await User.findOne(
      { clerkUUID: req.auth.userId },
      {
        email: 1,
        firstname: 1,
        lastname: 1,
        avatar: 1,
        favSearch: 1,
        bookmarks: 1,
        clerkPasswordEnabled: 1,
        stripeUUID: 1,
      },
    ).populate({
      path: "bookmarks",
      model: "shops",
      populate: {
        path: "notes",
        models: "notes",
      },
    });

    if (!user) {
      // console.log("Utilisateur non trouvé avec l'id Clerk: ", req.auth.userId);
      return res.status(404).json({ message: "User not found" });
    }

    const userOrders = await Order.find({ user: user._id, isPaid: true })
      .populate({
        path: "details",
        populate: [
          {
            path: "products",
            populate: {
              path: "product",
              model: "stocks",
              populate: {
                path: "product",
                model: "products",
                populate: {
                  path: "family",
                  model: "productFamily",
                },
              },
            },
          },
          {
            path: "shop",
            model: "shops",
            populate: {
              path: "notes",
              model: "notes",
            },
          },
        ],
      })
      .sort("-createdAt");

    res.status(200).json({ ...user.toObject(), orders: userOrders });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des informations de l'utilisateur: ",
      error,
    );
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findOne({ clerkUUID: req.auth.userId });

    if (!user) {
      throw new Error("No user found");
    }

    // req.body.email && (user.email = req.body.email)
    req.body.firstname && (user.firstname = req.body.firstname);
    req.body.lastname && (user.lastname = req.body.lastname);
    await user.save();
    await user.populate({
      path: "bookmarks",
      model: "shops",
      populate: {
        path: "notes",
        models: "notes",
      },
    });

    const userOrders = await Order.find({ user: user._id, isPaid: true })
      .populate({
        path: "details",
        populate: [
          {
            path: "products",
            populate: {
              path: "product",
              model: "stocks",
              populate: {
                path: "product",
                model: "products",
                populate: {
                  path: "family",
                  model: "productFamily",
                },
              },
            },
          },
          {
            path: "shop",
            model: "shops",
            populate: {
              path: "notes",
              model: "notes",
            },
          },
        ],
      })
      .sort("-createdAt");

    res.status(200).json({ ...user.toObject(), orders: userOrders });
  } catch (error) {
    console.error(error);
    return;
  }
};

const addShopToBookmark = async (req, res) => {
  try {
    const user = await User.findOne({ clerkUUID: req.auth.userId });

    if (!user) {
      throw new Error("No user found");
    }

    user.bookmarks.push(req.params.shopId);

    await user.save();
    await user.populate({
      path: "bookmarks",
      model: "shops",
      populate: {
        path: "notes",
        models: "notes",
      },
    });
    const userOrders = await Order.find({ user: user._id, isPaid: true })
      .populate({
        path: "details",
        populate: [
          {
            path: "products",
            populate: {
              path: "product",
              model: "stocks",
              populate: {
                path: "product",
                model: "products",
                populate: {
                  path: "family",
                  model: "productFamily",
                },
              },
            },
          },
          {
            path: "shop",
            model: "shops",
            populate: {
              path: "notes",
              model: "notes",
            },
          },
        ],
      })
      .sort("-createdAt");

    console.log({
      result: true,
      user: { ...user.toObject(), orders: userOrders },
    });

    res.status(200).json({
      result: true,
      user: { ...user.toObject(), orders: userOrders },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

const removeShopFromBookmark = async (req, res) => {
  try {
    const user = await User.findOne({ clerkUUID: req.auth.userId });

    if (!user) {
      throw new Error("No user found");
    }

    user.bookmarks = user.bookmarks.filter(
      (b) => b.toString() !== req.params.shopId,
    );

    await user.save();
    await user.populate({
      path: "bookmarks",
      model: "shops",
      populate: {
        path: "notes",
        models: "notes",
      },
    });
    const userOrders = await Order.find({ user: user._id, isPaid: true })
      .populate({
        path: "details",
        populate: [
          {
            path: "products",
            populate: {
              path: "product",
              model: "stocks",
              populate: {
                path: "product",
                model: "products",
                populate: {
                  path: "family",
                  model: "productFamily",
                },
              },
            },
          },
          {
            path: "shop",
            model: "shops",
            populate: {
              path: "notes",
              model: "notes",
            },
          },
        ],
      })
      .sort("-createdAt");

    res.json({
      result: true,
      user: { ...user.toObject(), orders: userOrders },
    });
  } catch (error) {
    console.error(error);
    return;
  }
};

module.exports = {
  createNewUser,
  getUserInfos,
  updateUser,
  addShopToBookmark,
  removeShopFromBookmark,
};
