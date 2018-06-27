const port = 8080;
const hostname = 'localhost';
const verbose = true;
const server = require('./server');
const network = require('./controllers/network');
const cluster = require('cluster'); // for parallel computation
const cpus = require('os').cpus(); // number of cores
// const numCPUs = require('os').cpus().length; // number of cores
// const fs = require('fs');
const mongoose = require('mongoose'); // for database connection
const DBConfig = require('./config/default'); // loading the db location from the JSON files
// db connection
mongoose.connect(DBConfig.DBHost, DBConfig.DBOptions);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
// HANDLER CAN BE EXPORTED IN MOM (msh orient midlw)
function timelog() {
  const date = new Date();
  return date.toLocaleTimeString();
}
let verboseToggle = true;
function messageHandler(msg) {
  if (verboseToggle === true) {
    let fullMsg = `\n\tWorker ${msg.id} (${timelog()})\n(PID: ${msg.pid}; Using RAM: ${msg.memory / 1000000} MB)\n`;
    if (msg.config) {
      fullMsg += 'used configuration: networkOptions:{ ';
      fullMsg += `activation: ${msg.config.networkOptions.activation}, `;
      fullMsg += `hiddenLayers: ${msg.config.networkOptions.hiddenLayers}}, `;
      fullMsg += `trainingOptions: { iterations: ${msg.config.trainingOptions.iterations}, `;
      fullMsg += `errorThresh: ${msg.config.trainingOptions.errorThresh}, `;
      fullMsg += `learningRate: ${msg.config.trainingOptions.learningRate}, `;
      fullMsg += `momentum: ${msg.config.trainingOptions.momentum}}\n`;
    }
    // fullMsg += `busy? ${msg.busy}\n`;
    if (msg.status) fullMsg += `status: ${msg.status}\n`;
    if (msg.status.iterations) fullMsg += `iterations: ${msg.status.iterations}\n`;
    if (msg.status.error) fullMsg += `training error: ${msg.status.error}\n`;
    fullMsg += '\n';
    // fullMsg += `error? ${msg.error}\n`;
    console.log(fullMsg);
  // fs.appendFileSync('log.txt', fullMsg);
  }
  if ((verbose === false) && (msg.status === 'listening on port 8080')) verboseToggle = false;
}

if (cluster.isMaster) {
  cpus.forEach(cluster.fork);
  // for (let i = numCPUs - 2; i > 0; --i) cluster.fork();
  const configs = [];
  setInterval(() => {
    network.getConfig((config) => {
      if (config) configs.push(config);
    }); // end of "network.getConfig((config) => {"
  }, 500); // * THE MASTER WATCH FOR NEW NETWORKS EACH 500 MS
  cluster.on('fork', (worker) => {
    worker.send({
      id: worker.id,
      pid: process.pid,
      memory: process.memoryUsage().rss,
      status: 'forked',
    }); // end of "worker.send({"
  }); // end of "cluster.on('fork', (worker) => {"
  // RECIEVING MESSAGE FROM WORKER
  cluster.on('message', (worker, msg) => {
    messageHandler(msg);
    if ((msg.config === null) && (msg.busy === false)) {
      // * WORKER DOESNT HAVE ANY CONFIG AND WORKER IS AVAILABLE !!
      const config = configs.pop();
      if (config) { // if configs array is empty -> no config
        worker.send({
          id: worker.id,
          pid: process.pid,
          memory: process.memoryUsage().rss,
          status: 'new config recieved...',
          config,
        }); // end of "worker.send({"
      } // end of "if (config) {"
    } // end of "if (msg.config === null) {"
    // *** TESTING ERRORS ***
    if (msg.error) {
      worker.send({
        id: worker.id,
        pid: process.pid,
        memory: process.memoryUsage().rss,
        status: 'HUSTON WE HAVE BIG PROBLEMS',
        config: msg.config,
      });
    } // *** END TEST ***
  }); // end of "cluster.on('message', (worker, msg) => {"
} else if (cluster.isWorker) { //* end of if (cluster.isMaster) { *
  let busy = false;
  // RECIEVING MESSAGE FROM MASTER
  process.on('message', (msg) => {
    messageHandler(msg);
    if (msg.config) {
      // *** TESTING ERRORS ***
      if (busy) {
        process.send({
          id: cluster.worker.id,
          pid: process.pid,
          memory: process.memoryUsage().rss,
          status: 'ERROR, worker is busy. Config recieved',
          config: msg.config,
          busy: false,
          error: 'ERROR, worker is busy. Config recieved',
        }); // end of "process.send({"
      }
      // *** END TEST ***

      const { config } = msg;
      config.trainingOptions.timeout = Infinity; // It's a fix of problem with 'null' timeout

      network.run(config, (status) => {
        busy = true;
        // SENDING MESSAGE TO MASTER
        process.send({
          id: cluster.worker.id,
          pid: process.pid,
          memory: process.memoryUsage().rss,
          status,
          config,
          busy: true,
        }); // end of "process.send({"
      }).then(() => { // end of "network.run()"
        busy = false;
        // SENDING MESSAGE TO MASTER
        process.send({
          id: cluster.worker.id,
          pid: process.pid,
          memory: process.memoryUsage().rss,
          status: 'done... standing by...',
          config: null,
          busy: false,
        }); // end of "process.send({"
      }); // .then(() => { process.send
    } // end of "if (msg.config)"

    if (msg.config === null) {
      // *** TESTING ERRORS ***
      if (busy) {
        process.send({
          id: cluster.worker.id,
          pid: process.pid,
          memory: process.memoryUsage().rss,
          status: 'ERROR, worker is busy. NO CONFIG',
          config: msg.config,
          busy: true,
          error: 'ERROR, worker is busy. NO CONFIG',
        }); // end of "process.send({"
      } // end of if (busy) {
      // *** END TEST ***
      if (!busy) {
        process.send({
          id: cluster.worker.id,
          pid: process.pid,
          memory: process.memoryUsage().rss,
          status: 'worker is standing by...',
          config: null,
          busy: false,
        }); // end of "process.send({"
      } // end of "if (!busy) {"
    } // end of "if (msg.config === null) {"
  }); // end of "process.on('message', (msg) => {"
  // SENDING MESSAGE TO MASTER
  server.run(port, hostname, (status) => {
    setInterval(() => {
      if (!busy) {
        process.send({
          id: cluster.worker.id,
          pid: process.pid,
          memory: process.memoryUsage().rss,
          status,
          config: null,
          busy: false,
        }); // end of "process.send({"
      } // * IF WORKER IS NOT BUSY
    }, 5000); // * IT NOTIFIES THE MASTER ABOUT THAT
  }); // end of "server.run(port, (status) => {"
} //* end of "if (cluster.isWorker) {" *
