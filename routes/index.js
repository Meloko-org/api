const authRouter = require("./auth");
const clerkRouter = require("./clerk");
const categoriesRouter = require("./categories");
const familiesRouter = require("./families");
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
const orderRouter = require("./order");
const postRouter = require("./posts");
const postThemeRouter = require("./postThemes");
const shopFeaturesRouter = require("./shopFeatures");
const circuitRouter = require("./circuit");
const onboardingRouter = require("./onboarding");
const withdrawsRouter = require("./withdraws");
const invoiceRouter = require("./invoices");
const creditNoteRouter = require("./creditNotes");
const savRouter = require("./sav");

module.exports = {
  authRouter,
  clerkRouter,
  categoriesRouter,
  familiesRouter,
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
  orderRouter,
  postRouter,
  postThemeRouter,
  shopFeaturesRouter,
  circuitRouter,
  onboardingRouter,
  withdrawsRouter,
  invoiceRouter,
  creditNoteRouter,
  savRouter,
};
