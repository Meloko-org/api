require("dotenv").config();
require("./database/connection");
require("./models");

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { clerkMiddleware } = require("@clerk/express");

const {
  usersRouter,
  authRouter,
  clerkRouter,
  categoriesRouter,
  familiesRouter,
  producersRouter,
  shopsRouter,
  rolesRouter,
  typesRouter,
  tagsRouter,
  stocksRouter,
  productsRouter,
  stripeRouter,
  businessRouter,
  orderRouter,
  postRouter,
  postThemeRouter,
  shopFeaturesRouter,
  circuitRouter,
  onboardingRouter,
  withdrawsRouter,
} = require("./routes");

var app = express();

const cors = require("cors");
app.use(cors());
app.use(clerkMiddleware());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/clerk", clerkRouter);
app.use("/categories", categoriesRouter);
app.use("/families", familiesRouter);
app.use("/producers", producersRouter);
app.use("/shops", shopsRouter);
app.use("/stocks", stocksRouter);
app.use("/roles", rolesRouter);
app.use("/types", typesRouter);
app.use("/tags", tagsRouter);
app.use("/products", productsRouter);
app.use("/stripe", stripeRouter);
app.use("/business", businessRouter);
app.use("/orders", orderRouter);
app.use("/posts", postRouter);
app.use("/postThemes", postThemeRouter);
app.use("/shopFeatures", shopFeaturesRouter);
app.use("/circuits", circuitRouter);
app.use("/onboarding", onboardingRouter);
app.use("/withdraws", withdrawsRouter);

module.exports = app;
