const path = require('path');
const nconf = require('nconf');

nconf.argv()
  .env();

const env = nconf.get('NODE_ENV') || 'dev';
if (env === 'production') {
  nconf.file({ file: path.join(__dirname, 'config.prod.json') });
} else {
  nconf.file({ file: path.join(__dirname, 'config.json') });
}

module.exports = nconf;
