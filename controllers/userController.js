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
      bokmarks: 1,
      ClerkPasswordEnabled: 1
    })

    const userOrders = await Order.find({ user: user._id, isPaid: true})
    console.log("user orders")
    console.log(userOrders)
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

    const email = (req.body.email) ? req.body.email : user.email

    await User.updateOne({_id: user._id}, {
      email: email,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
    })

    await getUserInfos()


    console.log("user updated")
    
  } catch (error) {
    console.error(error)
    return
  }
}

module.exports = {
  createNewUser,
  getUserInfos,
  updateUser
}