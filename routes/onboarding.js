var express = require("express");
var router = express.Router();

const { onboardingController } = require("../controllers");
const { clerkMiddlewares } = require("../middlewares");

router.post(
  "/1",
  clerkMiddlewares.isUserLogged,
  onboardingController.onboarding1,
);

router.post(
  "/2",
  clerkMiddlewares.isUserLogged,
  onboardingController.onboarding2,
);

router.post(
  "/3",
  clerkMiddlewares.isUserLogged,
  onboardingController.onboarding3,
);

router.post(
  "/4",
  clerkMiddlewares.isUserLogged,
  onboardingController.onboarding4,
);

router.post(
  "/5",
  clerkMiddlewares.isUserLogged,
  onboardingController.onboarding5,
);

router.post(
  "/6",
  clerkMiddlewares.isUserLogged,
  onboardingController.onboarding6,
);

module.exports = router;
