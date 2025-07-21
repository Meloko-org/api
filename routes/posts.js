var express = require("express");
var router = express.Router();
const { postController } = require("../controllers");
const { clerkMiddlewares } = require("../middlewares");

router.post(
  "/generate",
  clerkMiddlewares.isUserLogged,
  postController.generatePost,
);

router.post("/", clerkMiddlewares.isUserLogged, postController.validatePost);

router.get("/", clerkMiddlewares.isUserLogged, postController.getPostsFromShop);

router.post("/:id/publish", postController.publishPost);

module.exports = router;
