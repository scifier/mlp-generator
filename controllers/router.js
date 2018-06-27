/* eslint no-unused-vars: 0 */

const Network = require('../models/network');
const Weights = require('../models/weights');

/** GET / Home page. */
function getHome(req, res) {
  res.render('home', { title: 'Home' });
} // end of "function getHome(req, res) {"

/**
 * GET /network-form
 */
function getNetworkForm(req, res) {
  res.render('network-form', {
    title: 'New network',
  }); // end of "res.render('network-form', {"
} // end of "function getNetworkForm(req, res) {"

/**
 * GET /expert-network-form
 */
function getExpertNetworkForm(req, res) {
  res.render('expert-network-form', {
    title: 'New network',
  }); // end of "res.render('network-form', {"
} // end of "function getNetworkForm(req, res) {"

/**
 * GET /networks route to retrieve all the networks. Networks page.
 */
function getAllNetworks(req, res) {
  Network.find().catch((err) => {
    if (err) res.send(err);
  }).then((docs) => {
    res.render('networks', {
      title: 'Networks',
      docs,
    }); // end of "res.render('networks', {"
  }); // end of "}).then((docs) => {"
} // end of "function getAllNetworks(req, res) {"

/** GET /network/:id Network detailed page. */
function getNetwork(req, res) {
  Network.findOne({ _id: req.params.id }).catch((err) => {
    if (err) res.send(err);
  }).then((doc) => {
    Weights.findOne({ _id: doc.jsonStringID[doc.jsonStringID.length - 1] }).catch((err) => {
      if (err) res.send(err);
    }).then((weightsDoc) => {
      // const json = JSON.parse(weightsDoc.weights);
      // res.json(json);
      res.render('network', {
        title: `Network ${doc.id}`,
        doc,
        // json,
      }); // end of "res.render('network', {"
    });
  }); // end of "}).then((doc) => {"
} // end of "function getNetwork(req, res) {"

function getGraph(req, res) {
  // Weights.findOne({ _id: req.params.id })
  //   .then((docJSON) => {
  //     const doc = JSON.parse(docJSON.weights);
  //     const nodes = [];
  //     const links = [];
  //     doc.layers.forEach((layer, i, arr) => {
  //       Object.getOwnPropertyNames(layer).forEach((neuron, j, arr2) => {
  //         const node = {
  //           id: `${i}.${neuron}`,
  //           label: `node ${i}.${neuron}`,
  //         };
  //         if (layer[j].bias) node.properties = { bias: layer[j].bias };
  //         nodes.push(node);
  //         if (layer[j].weights) {
  //           Object.getOwnPropertyNames(layer[j].weights).forEach((src, idx, array) => {
  //             const link = {
  //               source: `${i - 1}.${src}`,
  //               target: `${i}.${neuron}`,
  //               cost: `${layer[j].weights[src]}`,
  //             };
  //             links.push(link);
  //           });
  //         }
  //       });
  //     });
  //     res.json({ nodes, links });
  //   }).catch((err) => {
  //     if (err) res.send(err);
  //   });
  res.render('network-graph', { title: 'blabla' });
  // res.render('network-graph', { title: 'blabla' }, (err, html) => {
  //   //
  // });
}

module.exports = {
  getHome,
  getNetworkForm,
  getExpertNetworkForm,
  getAllNetworks,
  getNetwork,
  getGraph,
};
