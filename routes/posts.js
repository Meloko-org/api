var express = require("express");
var router = express.Router();
const { postController } = require("../controllers");
const { clerkMiddlewares } = require("../middlewares");

router.post(
  "/generate",
  clerkMiddlewares.isUserLogged,
  postController.generatePost,
);

router.post(
  "/validate",
  clerkMiddlewares.isUserLogged,
  postController.validatePost,
);

router.post(
  "/activities/by-product-type",
  clerkMiddlewares.isUserLogged,
  postController.getActivitiesByProductType,
);

router.get("/", clerkMiddlewares.isUserLogged, postController.getPostsFromShop);

router.get(
  "/programmed",
  clerkMiddlewares.isUserLogged,
  postController.getProgrammedPosts,
);

router.post(
  "/postProgrammedPosts",
  clerkMiddlewares.isUserLogged,
  postController.postProgrammedPosts,
);

router.get(
  "/history",
  clerkMiddlewares.isUserLogged,
  postController.getPostHistory,
);

router.delete(
  "/delete/:postId",
  clerkMiddlewares.isUserLogged,
  postController.deleteProgrammedPost,
);

module.exports = router;
