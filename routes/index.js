const authRouter = require("./auth");
const clerkRouter = require("./clerk");
const categoriesRouter = require("./categories");
const familiesRouter = require("./families");
const producersRouter = require("./producers");
const rolesRouter = require("./roles");
const shopsRouter = require("./shops");
const crewRouter = require("./crew");
const typesRouter = require("./types");
const usersRouter = require("./users");
const tagsRouter = require("./tags");
const stocksRouter = require("./stocks");
const productsRouter = require("./products");
const stripeRouter = require("./stripe");
const businessRouter = require("./business");
const orderRouter = require("./order");

module.exports = {
  authRouter,
  clerkRouter,
  categoriesRouter,
  familiesRouter,
  producersRouter,
  rolesRouter,
  shopsRouter,
  crewRouter,
  typesRouter,
  usersRouter,
  tagsRouter,
  stocksRouter,
  productsRouter,
  stripeRouter,
  businessRouter,
  orderRouter,
};
