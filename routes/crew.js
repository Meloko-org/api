var express = require("express");
var router = express.Router();
const { crewController } = require("../controllers");
const { clerkMiddlewares } = require("../middlewares");

router.post(
  "/add",
  clerkMiddlewares.isUserLogged,
  crewController.addCrewMember,
);

router.delete(
  "/:memberId",
  clerkMiddlewares.isUserLogged,
  crewController.deleteCrewMember,
);

router.patch(
  "/:memberId",
  clerkMiddlewares.isUserLogged,
  crewController.updateCrewMember,
);

module.exports = router;
