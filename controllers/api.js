/* eslint no-unused-vars: 0 */

const Network = require('../models/network');
const Weights = require('../models/weights');

/**
 ** GET /networks route to retrieve all the networks.
 * Networks page.
 */
function getAllNetworks(req, res) {
  Network.find()
    .then(docs => res.json(docs))
    .catch((err) => {
      if (err) res.send(err);
    });
} // end of "function getAllNetworks(req, res) {"

/** POST /network New network. */
function postMultipleNetworks(req, res) {
  const keys = Object.keys(req.body);
  const msg = {};
  const promises = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = JSON.parse(req.body[key]);
    const doc = new Network();
    if (value.description) doc.description = value.description;
    if ((value.activation === 'sigmoid') || (value.activation === 'relu') ||
        (value.activation === 'leaky-relu') || (value.activation === 'tanh')) {
      doc.activation = value.activation;
    }
    if (value.hiddenLayers) doc.hiddenLayers = value.hiddenLayers;
    if (value.iterations) doc.iterations = value.iterations;
    if (value.errorThresh) doc.errorThresh = value.errorThresh;
    if (value.learningRate) doc.learningRate = value.learningRate;
    if (value.momentum) doc.momentum = value.momentum;
    promises[i] = doc.save().then((savedDoc) => {
      msg[key] = {
        id: savedDoc.id,
        activation: savedDoc.activation,
        hiddenLayers: savedDoc.hiddenLayers,
        iterations: savedDoc.iterations,
        errorThresh: savedDoc.errorThresh,
        learningRate: savedDoc.learningRate,
        momentum: savedDoc.momentum,
      };
    }).catch((err) => {
      msg[key] = `${err.name}: ${err.message}`;
    }); // promises[i] = doc.save().then((savedDoc) => {
  }
  // let i = 0;
  Promise.all(promises).then(() => {
    // if (i === keys.length - 1)
    res.send(msg);
    // i++;
  });
} // function postMultipleNetworks(req, res) {

/** POST /network New network. */
function postNetwork(req, res) {
  const doc = new Network();
  if (req.body.description) doc.description = req.body.description;
  if (req.body.activation) doc.activation = req.body.activation;
  if (req.body.hiddenLayers) doc.hiddenLayers = req.body.hiddenLayers.split(',').map(Number);
  if (req.body.iterations) doc.iterations = req.body.iterations;
  if (req.body.errorThresh) doc.errorThresh = req.body.errorThresh;
  if (req.body.learningRate) doc.learningRate = req.body.learningRate;
  if (req.body.momentum) doc.momentum = req.body.momentum;
  doc.save().catch((err) => {
    if (err) res.send(err);
  }).then((savedDoc) => {
    res.send({
      id: savedDoc.id,
      activation: savedDoc.activation,
      hiddenLayers: savedDoc.hiddenLayers,
      iterations: savedDoc.iterations,
      errorThresh: savedDoc.errorThresh,
      learningRate: savedDoc.learningRate,
      momentum: savedDoc.momentum,
    });
  }); // end of "  doc.save().then((savedDoc) => {"
} // end of "function postNetwork(req, res) {"

/**
 * GET /network/:id
 * Network detailed page.
 */
function getNetwork(req, res) {
  Network.findOne({ _id: req.params.id })
    .then(doc => res.json(doc))
    .catch((err) => {
      if (err) res.send(err);
    });
}

/*
 * PUT /book/:id to updatea a book given its id
 */
function updateNetwork(req, res) {
  Network.findById({ _id: req.params.id }, (error, network) => {
    if (error) res.send(error);
    // Error is here. The server falls when trying to PUT into book with inexistent ID
    Object.assign(network, req.body).save((err, net) => {
      if (err) res.send(err);
      res.json({ message: 'Book updated!', net });
    });
  });
}
// I DON'T LIKE THIS FUNCTION, I WILL SEE IT LATER

/*
 * DELETE /network/:id to delete a network given its id.
 */
function deleteNetwork(req, res) {
  Network.remove({ _id: req.params.id }, (err, result) => {
    if (err) res.send(err);
    else res.json({ message: 'Network successfully deleted!', result });
  });
}

/**
 * GET http://localhost:8080/network-json/:id
 * Network detailed page.
 */
function getNetworkJSON(req, res) {
  Weights.findOne({ _id: req.params.id })
    .then(doc => res.json(doc))
    .catch((err) => {
      if (err) res.send(err);
    });
}

function getNetJsonGraph(req, res) {
  Weights.findOne({ _id: req.params.id })
    .then((docJSON) => {
      const doc = JSON.parse(docJSON.weights);
      const nodes = [];
      const links = [];
      const { sizes } = doc;
      doc.layers.forEach((layer, i) => {
        Object.getOwnPropertyNames(layer).forEach((neuron, j) => {
          const node = {
            id: `${i}.${neuron}`,
            // label: `node ${i}.${neuron}`,
            // name: `node ${i}.${neuron}`,
            // layer: i, // group: i,
            // neuron: j,
          };
          if (layer[j].bias) node.bias = layer[j].bias;
          nodes.push(node);
          if (layer[j].weights) {
            Object.getOwnPropertyNames(layer[j].weights).forEach((src) => {
              const link = {
                // id: `${i - 1}.${src}-${i}.${neuron}`,
                // layer1: i - 1,
                // neuron1: Number(src),
                // layer2: i,
                // neuron2: Number(neuron),
                source: `${i - 1}.${src}`,
                target: `${i}.${neuron}`,
                weight: layer[j].weights[src],
                // value: layer[j].weights[src],
                // type: layer[j].weights[src],
              };
              links.push(link);
            });
          }
        });
      });
      res.json({ nodes, links, sizes });
    }).catch((err) => {
      if (err) res.send(err);
    });
}

// export all the functions
module.exports = {
  getAllNetworks,
  postMultipleNetworks,
  getNetwork,
  postNetwork,
  updateNetwork,
  deleteNetwork,
  getNetworkJSON,
  getNetJsonGraph,
};
