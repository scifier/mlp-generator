const fs = require('fs');
const readline = require('readline');
const { getMin, getMax } = require('../db/statistics');

/**
 * Helper function that normalize a given number for neural network using
 * @param {} val Number for normalizing
 * @param {} min The minimum
 * @param {} max The maximum
 * @returns A normalized number (between 0 and 1)
 */
function normalize(val, min, max, activation) {
  // TODO: attempt to normalize on GPU
  // return (((val - min) / (max - min)));
  switch (activation) {
    case 'sigmoid':
      // input must be between 0 and 1
      // CORRECT!!
      return ((val - min) / (max - min));
    case 'tanh':
      // NOT SO GOOD (((val - min) / (max - min)) - 0.5);
      // input must be between -1 and 1
      // CORRECT!!
      return (((val - min) / (max - min)) - 0.5) * 2;
    case 'relu':
      // BAD:
      // return (((val - min) / (max - min)) - 0.5) * 2;
      // BAD:
      // return (((val - min) / (max - min)) - 0.5);
      // BAD:
      // return val;
      // GOOD:
      return ((val - min) / (max - min));
    case 'leaky-relu':
      // BAD:
      // return (((val - min) / (max - min)) - 0.5) * 2;
      // BAD:
      // return (((val - min) / (max - min)) - 0.5);
      // BAD:
      // return val;
      // GOOD:
      return ((val - min) / (max - min));
    default:
      // no normalization when unknown activation function provided
      return val;
  }
}

/**
 * Helper function that creates an array of normalized Number ([0..1]) from a string
 * @param {} str String with format '1.0,2,23.1,4,5'
 * @returns A promise that resolve the array of numbers
 */
function getNormalArray(str, activation) {
  return new Promise((resolve, reject) => {
    const arr = str.split(',').map(Number);
    for (let i = 0; i < 57; i++) {
    // for (let i = 0; i < arr.length; i++) {
      arr[i] = normalize(arr[i], getMin(i), getMax(i), activation);
    }
    resolve(arr);
    if (str === undefined || typeof str === 'undefined') {
      reject(new Error('Error in \'start\' or \'end\' arguments. Please, verify.'));
    }
  });
}

/**
 * Transforms an array of numbers into brain.js acceptable testing/training format
 * @param {} arr Array of Numbers to transform in brain.js acceptable format.
 * @param {} reason String that indicates the used format (must be 'training' or 'testing'}.
 * @returns A promise that resolve the transformed array
 */
function toBrainFormat(arr, reason) {
  return new Promise((resolve, reject) => {
    const entryObj = { input: [], output: [] };
    if (reason === 'training') {
      // creating the array of training data supported by 'brain.js'
      entryObj.input.push(...arr);
      entryObj.output.push(entryObj.input.pop());
      resolve(entryObj);
    } else if (reason === 'testing') {
      // creating the array of testing data without the output (last number)
      arr.pop();
      resolve(arr);
    } else reject(new Error('Error in \'reason\' argument. Must be \'training\' or \'testing\''));
  }); // end of "new Promise()"
} // end of "toBrainFormat()"

/**
 * Exported function that read *.data files and creates brain.js acceptable datasets
 * @param {} data Indicates the name of file (without ".data"). The file must be in "db" folder
 * @param {} start Number that indicates the first line for reading (must be >1 && <EOF)
 * @param {} end Number that indicates the last line for reading (must be >1 && <EOF)
 * @param {} reason String that indicates the used format (must be 'training' or 'testing'}.
 * @returns A promise that return the dataset when it will be resolved
 */
function connect(data, start, end, reason, activation, callback) {
  return new Promise((resolve, reject) => {
    /* TODO: must throw an error if arguments are wrong
     * need to support the callback functionality too
     * (maybe several arguments need to be objects)
     * need to transform the wrong arguments in acceptable (ex:. '5' -> 5)
     */

    // argument 'data' handling (and definitions)
    let path = '';
    let i = 0;
    if (data === 'spam') {
      path = './db/spam.data';
    } else if (data === 'ham') {
      path = './db/ham.data';
    } else reject(new Error('Error in \'data\' argument. Must be \'spam\' or \'ham\''));

    // reading file from 'path', line by line, using Readable Streams (fs and readline dependencies)
    if (callback) {
      callback(`Connecting to ${data} database... Lines from ${start} ` +
               `to ${end} converting to array for ${reason}`);
    }
    Promise.resolve([]).then((dataArray) => {
      const lineReader = readline.createInterface({
        input: fs.createReadStream(path),
      });
      lineReader.on('line', (line) => {
        i++;
        if ((i >= start) && (i <= end)) {
          getNormalArray(line, activation)
            .then(arr => toBrainFormat(arr, reason)
              .then(dataset => dataArray.push(dataset)));
        } // end of "if (start <= i <= end)"
      }); // end of "lineReader.on('line')" event
      lineReader.on('close', () => {
        if (callback) {
          callback(`Сonnection to ${data} database closed... ` +
                   `Lines from ${start} to ${end} was converted to array for ${reason}`);
        }
        resolve(dataArray);
      }); // end of "lineReader.on('close')" event
    }); // end of "Promise.resolve([])"
  }); // end of "new Promise()"
} // end of "connect()" function

if (module.parent) {
  module.exports = { connect };
} else {
  // test arguments
  const data = process.argv[2] || 'ham';
  const start = process.argv[3] || 1;
  const end = process.argv[4] || 1000;
  const reason = process.argv[5] || 'training';
  connect(data, start, end, reason).then(dataArray => console.log(dataArray));
} // exported functionality
