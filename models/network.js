const mongoose = require('mongoose');
// neural network schema definition
const NetworkSchema = new mongoose.Schema(
  {
    status: { type: String, required: false, default: 'unprocessed' },
    description: { type: String, required: false },
    loadFromJSON: { type: String, required: false },
    // general configs... // networkOptions
    activation: { type: String, required: false, default: 'sigmoid' },
    hiddenLayers: { type: [Number], required: false, default: [24] },
    // networkLearningRate: { type: Number, required: false, default: 0.3 }, // can be useless
    // trainingOptions
    iterations: { type: Number, required: false, default: 20000 },
    errorThresh: { type: Number, required: false, default: 0.005 },
    learningRate: { type: Number, required: false, default: 0.3 },
    momentum: { type: Number, required: false, default: 0.3 }, // , default: ??? 0.3 },
    callbackPeriod: { type: Number, required: false, default: 100 },
    sTrS: { type: Number, required: false, default: 1 },
    sTrE: { type: Number, required: false, default: 1000 },
    sTeS: { type: Number, required: false, default: 1001 },
    sTeE: { type: Number, required: false, default: 1813 },
    hTrS: { type: Number, required: false, default: 1 },
    hTrE: { type: Number, required: false, default: 1000 },
    hTeS: { type: Number, required: false, default: 1001 },
    hTeE: { type: Number, required: false, default: 1813 },
    // async training result
    trainingIterations: { type: [Number], required: false },
    trainingErrors: { type: [Number], required: false },
    // test results (multiply by 100 if i want to display in %)
    totalTestedSpam: { type: [Number], required: false },
    truePositive: { type: [Number], required: false }, // spamQualifiedAsSpam TPrate=TP/SPAM
    falseNegative: { type: [Number], required: false }, // spamQualifiedAsHam FNrate=FN/SPAM
    totalTestedHam: { type: [Number], required: false },
    trueNegative: { type: [Number], required: false }, // hamQualifiedAsHam TNrate=TN/HAM
    falsePositive: { type: [Number], required: false }, // hamQualifiedAsSpam FPrate=FP/HAM
    jsonStringID: { type: [String], required: false },
    // networkJSON: { type: [String] }, // saving json after each x number of iterations
    loggedAt: { type: [Date], required: false }, // log the time after each x number of iterations
  },
  { versionKey: false },
);

/**
 * Finding one non processed network in db
 * @param {err, doc} callback
 */
// NetworkSchema.statics.getUnprocessedDocID = function f() {
//   // this will not work properly in arrow function
//   const thisModel = this;
//   return new Promise((resolve, reject) => {
//     thisModel.findOne({ status: 'unprocessed' }, (err, doc) => {
//       if (err) reject(err);
//       if (doc) {
//         // doc.status = ds;
//         resolve(doc.id);
//       }
//       if (!doc) resolve(null);
//     });
//   });
// };

NetworkSchema.methods.setProcessingStatus = function f1() {
  const thisDocument = this;
  return new Promise((resolve, reject) => {
    if (thisDocument.status === 'unprocessed') {
      thisDocument.status = 'processing';
      thisDocument.save();
      resolve(thisDocument);
    } else if (thisDocument.status !== 'unprocessed') {
      resolve(null);
      // reject(new Error('Document status is not \'unprocessed\'!'));
    }
  });
};

// Sets the createdAt parameter equal to the current time
// NetworkSchema.pre('save', (next) => {
//   const now = new Date();
//   // nust log only at iterations
//   // if (!this.loggedAt) {
//   // this.loggedAt = now;
//   // }
//   this.loggedAt.push(now);
//   next();
// });

// // Get a book by ID NEEEEWWW!!!
// module.exports.get = (id, cb) => {
//   BookSchema.findById(id, (err, book) => {
//     if (err) return cb(err);
//     return cb(null, book);
//   });
// };

// Exports the BookSchema for use elsewhere.
const Network = mongoose.model('network', NetworkSchema);
module.exports = Network;

// THIS DON'T WORK
// if (module.parent) {
//   module.exports = { networkModel };
// }
