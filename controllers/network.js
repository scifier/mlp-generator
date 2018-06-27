/* eslint no-unused-vars: 0 */
/* eslint no-shadow: 1 */
const brain = require('brain.js');
const db = require('../middlewares/db');
const Network = require('../models/network');
const Weights = require('../models/weights');

// FOR ADDITIONAL METHODS SEE .backup/network.2.js

function compareRandom(a, b) {
  return Math.random() - 0.5;
}
//  * arr.sort(compareRandom);
//  */

function getData(config, callback) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('Too much time for reading the db!!!')), 60000);
    const datasets = {
      spamTrainingData: [],
      hamTrainingData: [],
      jointTrainingData: [],
      spamTestingData: [],
      hamTestingData: [],
    };
    const {
      sTrS, sTrE, sTeS, sTeE, hTrS, hTrE, hTeS, hTeE,
    } = config.decomposition;
    const { activation } = config.networkOptions;
    db.connect('spam', sTrS, sTrE, 'training', activation, (status) => {
      if (callback) callback(status);
    }).then((arr) => {
      datasets.spamTrainingData.push(...arr);
    }).then(() => {
      // We push() the spam and ham training data to one joint array of objects
      datasets.jointTrainingData.push(...datasets.spamTrainingData);
    }).then(() => {
      db.connect('ham', hTrS, hTrE, 'training', activation, (status) => {
        if (callback) callback(status);
      }).then((arr) => {
        datasets.hamTrainingData.push(...arr);
      }).then(() => {
        datasets.jointTrainingData.push(...datasets.hamTrainingData);
      }).then(() => {
        db.connect('spam', sTeS, sTeE, 'testing', activation, (status) => {
          if (callback) callback(status);
        }).then((arr) => {
          datasets.spamTestingData.push(...arr);
        }).then(() => {
          db.connect('ham', hTeS, hTeE, 'testing', activation, (status) => {
            if (callback) callback(status);
          }).then((arr) => {
            datasets.hamTestingData.push(...arr);
          }).then(() => resolve(datasets));
        }); // (() => {connect('ham')
      }); // (() => {connect('spam')
    }); // (() => {connect('ham')
  }); // end of "new Promise()"
} // end of "getData()" function

function testNetwork(network, data, expected, config) {
  return new Promise((resolve, reject) => {
    let errors = 0;
    let result;
    const total = data.length;
    const {
      activation,
    } = config.networkOptions;
    switch (activation) {
      case 'sigmoid':
        // output must be between 0 and 1
        if (expected === 'ham') {
          data.forEach((item) => {
            result = network.run(item);
            if (Math.round(+result) === 1) errors++;
          });
        } else if (expected === 'spam') {
          data.forEach((item) => {
            result = network.run(item);
            if (Math.round(+result) === 0) errors++;
          });
        } break;
      case 'tanh':
        // output must be between -1? and +1?
        if (expected === 'ham') {
          data.forEach((item) => {
            result = network.run(item);
            if (result > 0) errors++;
          });
        } else if (expected === 'spam') {
          data.forEach((item) => {
            result = network.run(item);
            if (result < 0) errors++;
          });
        } break;
      case 'relu':
        // I THINK THIS IS AN ERROR IN CONDITION!
        // maybe if (result > 0) errors++; (ham)
        // if (result === 0) errors++; (spam) (not worked i remember... i think)
        // maybe not > 0 but Math.round === 1
        if (expected === 'ham') {
          data.forEach((item) => {
            result = network.run(item);
            if (result > 0) errors++;
          });
        } else if (expected === 'spam') {
          data.forEach((item) => {
            result = network.run(item);
            if (!(result > 0)) errors++;
          });
        } break;
      case 'leaky-relu':
        if (expected === 'ham') {
          data.forEach((item) => {
            result = network.run(item);
            if (+result > 0) errors++;
          });
        } else if (expected === 'spam') {
          data.forEach((item) => {
            result = network.run(item);
            if (!(+result > 0)) errors++;
          });
        } break;
      default:
        if (expected === 'ham') {
          data.forEach((item) => {
            result = network.run(item);
            if (Math.round(+result) === 1) errors++;
          });
        } else if (expected === 'spam') {
          data.forEach((item) => {
            result = network.run(item);
            if (Math.round(+result) === 0) errors++;
          });
        } break;
    } resolve({ errors, total });
  }); // end of "new Promise()"
} // end of "testNetwork()" function

function getConfig(callback) {
  Network.findOne({ status: 'unprocessed' }).then((doc) => {
    if (doc) {
      Promise.resolve({
        docID: doc.id,
        loadFromJSON: doc.loadFromJSON,
        networkOptions: {
          activation: doc.activation,
          hiddenLayers: doc.hiddenLayers,
          // learningRate: doc.networkLearningRate, // can be useless
        },
        trainingOptions: {
          iterations: doc.iterations, //* for fast testing: comment this *
          // iterations: 1000, //* ... and uncomment this line *
          errorThresh: doc.errorThresh,
          learningRate: doc.learningRate,
          momentum: doc.momentum,
          // timeout: Infinity, // It's a fix of problem with 'null' timeout
          // THIS WORKS ONLY IN INDEX.JS !!!
          log: false, // The logging is implemented at worker level
          callbackPeriod: doc.callbackPeriod, // || 100, // x iterations
        },
        decomposition: {
          sTrS: doc.sTrS, // || 1,
          sTrE: doc.sTrE, // || 1000,
          sTeS: doc.sTeS, // || 1001,
          sTeE: doc.sTeE, // || 1813,
          hTrS: doc.hTrS, // || 1,
          hTrE: doc.hTrE, // || 1000,
          hTeS: doc.hTeS, // || 1001,
          hTeE: doc.hTeE, // || 1813,
        },
      }).then((config) => {
        Network.updateOne({ _id: config.docID }, {
          $set: { status: 'waiting' },
        }).then(() => callback(config));
        // Network.findOne({ _id: config.docID }).then((unprocessedDoc) => {
        //   unprocessedDoc.setProcessingStatus().then((tempVar) => {
        //     if (tempVar) callback(cfg);
        //   });
        // });
        // }
      });
    } // end of "if (doc) {"
    if (!doc) callback(null); // if no doc
  }); // end of "}).then((config) => {"
} // end of "getConfig()" function

/** run my neural network */
function run(config, callback) {
  return new Promise((resolve, reject) => {
    const { trainingOptions } = config;
    const { docID } = config;
    const network = new brain.NeuralNetwork(config.networkOptions);
    Promise.resolve().then(() => {
      if (config.loadFromJSON) {
        Weights.findOne({ _id: config.loadFromJSON })
          .catch((err) => {
            if (err) callback(err);
          }).then((jsonDoc) => {
            network.fromJSON(JSON.parse(jsonDoc.weights));
          });
      } // end of "if (config.loadFromJSON) {"
    }).then(() => { // ***
      getData(config, (status) => {
        if (callback) callback(status);
      }).then((datasets) => {
        if (callback) callback('data recieved... training...');
        // *** asyncTraining callback definition ***
        trainingOptions.callback = function trainingCallback(res) {
          if (callback) callback(`Trained in ${res.iterations} iterations with avg err: ${res.error}`);
          // if (callback) callback('saving network to JSON...');
          const weights = new Weights({ weights: JSON.stringify(network.toJSON()) });
          // without stringify causes cast to string error
          weights.save().then((weightsDoc) => {
            Network.updateOne({ _id: docID }, {
              $push: {
                trainingIterations: res.iterations,
                trainingErrors: res.error,
                jsonStringID: weightsDoc.id,
              },
            }).then(() => {
              testNetwork(network, datasets.spamTestingData, 'spam', config).then((spamTestRes) => {
                Network.updateOne({ _id: docID }, {
                  $push: {
                    totalTestedSpam: spamTestRes.total,
                    truePositive: spamTestRes.total - spamTestRes.errors,
                    falseNegative: spamTestRes.errors,
                  },
                }).then(() => {
                  const falseNegativeRate = (spamTestRes.errors * 100) / spamTestRes.total;
                  if (callback) { callback(`Spam data tested... ${spamTestRes.errors} false-negative errors (${falseNegativeRate} %)`); }
                }); // }).then(() => { falseNegativeRate
              }); // .then((spamTestRes) => { Network.updateOne
              testNetwork(network, datasets.hamTestingData, 'ham', config).then((hamTestRes) => {
                Network.updateOne({ _id: docID }, {
                  $push: {
                    totalTestedHam: hamTestRes.total,
                    trueNegative: hamTestRes.total - hamTestRes.errors,
                    falsePositive: hamTestRes.errors,
                    loggedAt: new Date(),
                  },
                }).then(() => {
                  const falsePositiveRate = (hamTestRes.errors * 100) / hamTestRes.total;
                  if (callback) callback(`Ham data tested... ${hamTestRes.errors} false-positive errors (${falsePositiveRate} %)`);
                }); // }).then(() => { falsePositiveRate
              }); // .then((hamTestRes) => { Network.updateOne
            }); // .then(() => { testNetwork (x2)
          }); // end of "weights.save().then((weightsDoc) => {"
        }; // end of "trainingCallback()" function
        // *** asyncTraining callback definition ***
        Network.updateOne({ _id: config.docID }, {
          $set: { status: 'processing' },
        }).then(() => {
          network.trainAsync(datasets.jointTrainingData, trainingOptions).then((res) => {
            Network.updateOne({ _id: docID }, {
              $set: { status: 'processed' },
            }).then(() => { if (callback) resolve(callback('DONE')); });
          }); // }).then(() => { network.trainAsync
        // }).then(() => { if (callback) callback('DONE'); });
        }); // end of network.trainAsync().then({
      }); // .then((dataset) => { function trainingCallback()
    }); // *****
  }); // end of "new Promise()"
} // end of "run()" function

module.exports = {
  run,
  getConfig,
};
