const authRouter = require("./auth");
const clerkRouter = require("./clerk");
const categoriesRouter = require("./categories");
const producersRouter = require("./producers");
const rolesRouter = require("./roles");
const shopsRouter = require("./shops");
const typesRouter = require("./types");
const usersRouter = require("./users");
const tagsRouter = require("./tags");
const stocksRouter = require("./stocks");
const productsRouter = require("./products");
const stripeRouter = require("./stripe");
const businessRouter = require("./business");

module.exports = {
  authRouter,
  clerkRouter,
  categoriesRouter,
  producersRouter,
  rolesRouter,
  shopsRouter,
  typesRouter,
  usersRouter,
  tagsRouter,
  stocksRouter,
  productsRouter,
  stripeRouter,
  businessRouter,
};
