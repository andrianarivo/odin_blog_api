const path = require('path');
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const debug = require('debug')('app');
const cors = require('cors');
const passport = require('passport');
const nconf = require('./envconf');
const jwtStrategy = require('./jwtStrategy');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const mongoDB = nconf.get('mongoDB');
const main = async () => {
  await mongoose.connect(mongoDB);
};
main().catch((err) => debug(err));

const app = express();

// passport strategy
passport.use(jwtStrategy);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', cors(), apiRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
