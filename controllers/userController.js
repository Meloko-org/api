const { User, Role, Order } = require('../models')

// Create a new user in the database using data provided by a Clerk webhook
const createNewUser = async (clerkUserData) => {
  try {
    const userRole = await Role.findOne({ name: 'user' })
    const email = clerkUserData.email_addresses.find(ea => ea.id === clerkUserData.primary_email_address_id).email_address
    const clerkUUID = clerkUserData.id
    const clerkPasswordEnabled = clerkUserData.password_enabled

    const newUser = new User({
      email, 
      clerkUUID,
      roles: [userRole._id],
      clerkPasswordEnabled
    })

    await newUser.save()

    return true
  } catch (error) {
    console.error(error)
    return false
  }

}

const getUserInfos = async (req,res) => {
  try {
    const user = await User.findOne({ clerkUUID: req.auth.userId}, {
      _id: 1,
      email: 1,
      firstname: 1,
      lastname: 1,
      avatar: 1,
      favSearch: 1,
      bookmarks: 1,
      ClerkPasswordEnabled: 1
    }).populate({
      path: 'bookmarks',
      model: 'shops',
      populate: {
        path: 'notes',
        models: 'notes'
      }
    })

    let userOrders = await Order.find({ user: user._id, isPaid: true})
    console.log(userOrders)
    userOrders.length > 0 && userOrders.populate({
      path: 'details', 
      populate: 
        [{ 
          path: 'products', 
          populate: {
            path: 'product', model: 'stocks',
            populate: {
              path: 'product',
              model: 'products',
              populate: { 
                path: 'family',
                model: 'productFamily' 
              }
            }
          }

        }, {
          path: 'shop', model: 'shops', 
          populate: {
            path: 'notes', model: 'notes'
          }
        }]
      
    }).sort('-createdAt')

    if(!user) {
      throw new Error("No user found")
    }

    res.json({ ...user.toObject(), orders: userOrders })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
    return
  }
}


const updateUser = async (req, res) => {
  try {
    const user = await User.findOne({clerkUUID: req.auth.userId})

    if(!user) {
      throw new Error("No user found")
    }

    // req.body.email && (user.email = req.body.email)
    req.body.firstname && (user.firstname = req.body.firstname)
    req.body.lastname && (user.lastname = req.body.lastname)
    await user.save()
    await user.populate({
      path: 'bookmarks',
      model: 'shops',
      populate: {
        path: 'notes',
        models: 'notes'
      }
    })

    const userOrders = await Order.find({ user: user._id, isPaid: true}).populate({
      path: 'details', 
      populate: 
        [{ 
          path: 'products', 
          populate: {
            path: 'product', model: 'stocks',
            populate: {
              path: 'product',
              model: 'products',
              populate: { 
                path: 'family',
                model: 'productFamily' 
              }
            }
          }

        }, {
          path: 'shop', model: 'shops', 
          populate: {
            path: 'notes', model: 'notes'
          }
        }]
      
    }).sort('-createdAt')

    res.json({ result: true, user: {...user.toObject(), orders: userOrders}})
    
  } catch (error) {
    console.error(error)
    return
  }
}

const addShopToBookmark = async (req, res) => {
  try {
    const user = await User.findOne({clerkUUID: req.auth.userId})

    if(!user) {
      throw new Error("No user found")
    }

    user.bookmarks.push(req.params.shopId)

    await user.save()
    await user.populate({
      path: 'bookmarks',
      model: 'shops',
      populate: {
        path: 'notes',
        models: 'notes'
      }
    })
    const userOrders = await Order.find({ user: user._id, isPaid: true}).populate({
      path: 'details', 
      populate: 
        [{ 
          path: 'products', 
          populate: {
            path: 'product', model: 'stocks',
            populate: {
              path: 'product',
              model: 'products',
              populate: { 
                path: 'family',
                model: 'productFamily' 
              }
            }
          }

        }, {
          path: 'shop', model: 'shops', 
          populate: {
            path: 'notes', model: 'notes'
          }
        }]
      
    }).sort('-createdAt')

    res.json({ result: true, user: {...user.toObject(), orders: userOrders}})
    
  } catch (error) {
    console.error(error)
    return
  }
}

const removeShopFromBookmark = async (req, res) => {
  try {
    const user = await User.findOne({clerkUUID: req.auth.userId})

    if(!user) {
      throw new Error("No user found")
    }

    user.bookmarks = user.bookmarks.filter(b => b.toString() !== req.params.shopId)

    await user.save()
    await user.populate({
      path: 'bookmarks',
      model: 'shops',
      populate: {
        path: 'notes',
        models: 'notes'
      }
    })
    const userOrders = await Order.find({ user: user._id, isPaid: true}).populate({
      path: 'details', 
      populate: 
        [{ 
          path: 'products', 
          populate: {
            path: 'product', model: 'stocks',
            populate: {
              path: 'product',
              model: 'products',
              populate: { 
                path: 'family',
                model: 'productFamily' 
              }
            }
          }

        }, {
          path: 'shop', model: 'shops', 
          populate: {
            path: 'notes', model: 'notes'
          }
        }]
      
    }).sort('-createdAt')

    res.json({ result: true, user: {...user.toObject(), orders: userOrders}})
    
  } catch (error) {
    console.error(error)
    return
  }
}

module.exports = {
  createNewUser,
  getUserInfos,
  updateUser,
  addShopToBookmark,
  removeShopFromBookmark
}