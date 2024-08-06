require('dotenv').config();
require('./models/connection');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const {
  usersRouter,
  authRouter,
  clerkRouter,
  producersRouter,
  shopsRouter,
  rolesRouter,
  typesRouter,
  tagsRouter
} = require('./routes')
const stocksRouter = require('./routes/stocks');

var app = express();

const cors = require('cors')
app.use(cors())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/clerk', clerkRouter);
app.use('/producers', producersRouter);
app.use('/shops', shopsRouter);
app.use('/stocks', stocksRouter);
app.use('/roles', rolesRouter)
app.use('/types', typesRouter)
app.use('/tags', tagsRouter)

module.exports = app;
