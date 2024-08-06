const userController = require('./userController')

// Is called by Clerk when one of the subscribed events happens
const webhookReceiver = async (req, res) => {
  let userId = null

  switch(true) {
    case (req.body.type === 'user.created'):

      const createdUser = await userController.createNewUser(req.body.data)
      if(!createdUser) { 
        res.status(409).json({ error: 'user already exist' })
        return
      }
      
      console.log("user created")
      res.status(201).json({ result: true });
      break;
    case (req.body.type === 'user.deleted'):
      userId = req.body.data.id
      console.log("user deleted")
      res.json({ result: true, userId});
      break;
    case (req.body.type === 'user.updated'):
      userId = req.body.data.id
      console.log("user updated")
      res.json({ result: true, userId});
      break;
    case (req.body.type === 'user.createdAtEdge'):
      userId = req.body.data.id
      console.log("user createdAtEdge")
      res.json({ result: true, userId});
      break;
    default: 
      console.log("unhandled case")
      res.json({ result: true, message: 'unhandled case'});
      break;
  }

}

module.exports = {
  webhookReceiver
}