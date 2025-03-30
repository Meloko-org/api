const userController = require("./userController");

// Is called by Clerk when one of the subscribed events happens
const webhookReceiver = async (req, res) => {
  let userId = null;

  switch (true) {
    case req.body.type === "user.created":
      const createdUser = await userController.createNewUser(req.body.data);
      if (!createdUser) {
        res
          .status(409)
          .json({ success: false, message: "L'utilisateur existe déjà." });
        return;
      }

      res
        .status(201)
        .json({ success: true, message: "L'utilisateur est créé." });
      break;
    case req.body.type === "user.deleted":
      userId = req.body.data.id;
      res.json({ result: true, userId });
      break;
    case req.body.type === "user.updated":
      userId = req.body.data.id;
      res.json({ result: true, userId });
      break;
    case req.body.type === "user.createdAtEdge":
      userId = req.body.data.id;
      res.json({ result: true, userId });
      break;
    default:
      console.error("unhandled case");
      res.json({ result: true, message: "unhandled case" });
      break;
  }
};

module.exports = {
  webhookReceiver,
};
