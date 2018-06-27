const mongoose = require('mongoose');

const WeightsSchema = new mongoose.Schema(
  {
    weights: { type: String }, // saving json after each x number of iterations
    networkID: { type: String }, // log the time after each x number of iterations
  },
  { versionKey: false },
);

// Exports the BookSchema for use elsewhere.
const Weights = mongoose.model('weights', WeightsSchema);
module.exports = Weights;
