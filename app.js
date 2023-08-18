const path = require('path');
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const nconf = require('nconf');
const mongoose = require('mongoose');
const debug = require('debug')('app');
const cors = require('cors');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

nconf.argv()
  .env();

const env = nconf.get('NODE_ENV') || 'dev';
if (env === 'production') {
  nconf.file({ file: path.join(__dirname, 'config.prod.json') });
} else {
  nconf.file({ file: path.join(__dirname, 'config.json') });
}

const mongoDB = nconf.get('mongoDB');
const main = async () => {
  await mongoose.connect(mongoDB);
};
main().catch((err) => debug(err));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
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
