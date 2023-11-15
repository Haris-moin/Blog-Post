import express, { Express } from "express";
import mongoose from "mongoose";
import cluster from "cluster";
import cors from "cors";
const { mongooseConfig, port } = require("./config/index");
const logger = require("./log/index");

const app: Express = express();

let workers = [];
/**
 * Setup number of worker processes to share port which will be defined while setting up server
 */
const setupWorkerProcesses = () => {
  // to read number of cores on system
  let numCores = require("os").cpus().length;
  logger.log("info", `Master cluster setting up  ${numCores} workers`);

  // iterate on number of cores need to be utilized by an application
  for (let i = 0; i < numCores; i++) {
    // creating workers and pushing reference in an array
    workers.push(cluster.fork());

    // to receive messages from worker process
    workers[i].on("message", function (message) {
      logger.log("debug", ` ${message} `);
    });
  }

  // process is clustered on a core and process id is assigned
  cluster.on("online", function (worker) {
    logger.log("info", `Worker ${worker.process.pid} is listening`);
  });

  // if any of the worker process dies then start a new one by simply forking another one
  cluster.on("exit", function (worker, code, signal) {
    logger.log(
      "debug",
      `Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`
    );

    logger.log("info", "Starting a new worker");
    cluster.fork();
    workers.push(cluster.fork());
    // to receive messages from worker process
    workers[workers.length - 1].on("message", function (message) {
      console.log(message);
    });
  });
};

const setUpExpress = () => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // Define API routes
  require("./routes/index")(app);
  // Connect to MongoDB and start the server
  mongoose
    .connect(mongooseConfig.url)
    .then((result) => {
      app.listen(port, () => {
        logger.log("debug", `Server is running on port ${port}`);
      });
    })
    .catch((err) => console.log(err));
};

const setupServer = (isClusterRequired: boolean) => {
  // if it is a master process then call setting up worker process
  if (isClusterRequired && cluster.isPrimary) {
    setupWorkerProcesses();
  } else {
    // to setup server configurations and share port address for incoming requests
    setUpExpress();
  }
};

setupServer(true);
