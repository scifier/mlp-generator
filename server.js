// used node modules
const express = require('express'); // for creating the app
const morgan = require('morgan'); // for logging http requests
const path = require('path'); // for more safe calling of app.set('views', './views');
const bodyParser = require('body-parser'); // for parsing application/json and look for raw text
// useless package
// const expressStatusMonitor = require('express-status-monitor'); // routing /status page
const compression = require('compression'); // for gzip compression
const sass = require('node-sass-middleware'); // for compiling scss and sass
// controllers
const router = require('./controllers/router');
const api = require('./controllers/api');
// creating the express app
const app = express();
// *** MIDDLEWARES ***
// this crashes the server
// app.use(express.favicon());
// app.use(expressStatusMonitor());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));
app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
/* if (config.util.getEnv('NODE_ENV') !== 'test') { // don't show the log when it is test
  app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
} */
app.use(sass({
  src: path.join(__dirname, 'src'),
  dest: path.join(__dirname, 'public'),
}));
// TODO: add error handler
// app.use((err, req, res, next) => {
//   /* handle error */
// });
// *** MIDDLEWARES ***

// *** VIEWS ***
// for serving static html
app.use(express.static(path.join(__dirname, 'public')));
// TODO: add 404 page and static page rendering
// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// app.set('view engine', 'html');
// *** VIEWS ***

// *** ROUTES ***
app.get('/', router.getHome);
app.get('/network-form', router.getNetworkForm);
app.get('/expert-network-form', router.getExpertNetworkForm);
app.get('/networks', router.getAllNetworks);
app.get('/network/:id', router.getNetwork);
app.get('/network-graph/', router.getGraph);
// app.route('/new-network-form').get(network.getNewNetworkForm);
// app.route('/network-description/:id').post(network.postDescription);
// app.route('/network-status/:id').post(network.postDescription);
// app.route('/network-status-processed/:id').get(network.setStatusProcessed);
// app.route('/network-status-unprocessed/:id').get(network.setStatusUnprocessed);
// app.route('/load-from-json/:id').get(network.loadNetwork);
// *** ROUTES ***

// *** JSON API ***
app.route('/api/net-json-graph/:id').get(api.getNetJsonGraph);
app.route('/api/network-json/:id').get(api.getNetworkJSON);
app.route('/api/network/:id')
  .get(api.getNetwork)
  .put(api.updateNetwork)
  .delete(api.deleteNetwork);
// app.route('/network/delete/:id').get(network.deleteNetwork);
// .delete(network.deleteNetwork);
app.route('/api/network/').post(api.postNetwork);
app.route('/api/networks')
  .get(api.getAllNetworks)
  .post(api.postMultipleNetworks);
// *** JSON API ***

function run(port, hostname, callback) {
  app.listen(port, hostname, () => {
    // console.log(`Server is running at http://${hostname}:${port}`);
    callback(`listening on port ${port}`);
  });
}

module.exports = {
  app, run,
}; // for testing
