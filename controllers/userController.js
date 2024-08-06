const User = require('../models/User')
const Role = require('../models/Role')

// Create a new user in the database using data provided by a Clerk webhook
const createNewUser = async (clerkUserData) => {
  try {
    const userRole = await Role.findOne({ name: 'user' })
    const email = clerkUserData.email_addresses.find(ea => ea.id === clerkUserData.primary_email_address_id).email_address
    const clerkUUID = clerkUserData.id

    const newUser = new User({
      email, 
      clerkUUID,
      roles: [userRole._id]
    })

    await newUser.save()

    return true
  } catch (error) {
    console.error(error)
    return false
  }

}

module.exports = {
  createNewUser
}