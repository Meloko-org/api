const authRouter = require('./auth')
const clerkRouter = require('./clerk')
const producersRouter = require('./producers')
const rolesRouter = require('./roles')
const shopsRouter = require('./shops')
const typesRouter = require('./types')
const usersRouter = require('./users')
const tagsRouter = require('./tags')

module.exports = {
  authRouter,
  clerkRouter,
  producersRouter,
  rolesRouter,
  shopsRouter,
  typesRouter,
  usersRouter,
  tagsRouter
}