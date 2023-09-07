const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const nconf = require('./envconf');
const User = require('./models/user');

const secret = nconf.get('jwt_secret');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret,
};

const strategy = new JwtStrategy(opts, (async (jwtPayload, done) => {
  try {
    const user = await User.findById(jwtPayload.sub);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (err) {
    return done(err, false);
  }
}));

module.exports = strategy;
