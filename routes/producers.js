var express = require("express");
var router = express.Router();
const { producerController } = require("../controllers");
const { clerkMiddlewares } = require("../middlewares");

router.post(
  "/",
  clerkMiddlewares.isUserLogged,
  producerController.createNewProducer,
);

router.get(
  "/logged",
  clerkMiddlewares.isUserLogged,
  producerController.getProducerInfos,
);

router.get("/:producer", producerController.searchProducer);
router.get("/", producerController.searchProducer);

router.put(
  "/update",
  clerkMiddlewares.isUserLogged,
  producerController.updateProducer,
);

module.exports = router;
