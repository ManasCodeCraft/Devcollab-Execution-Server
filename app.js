require("./src/utils/globalHandlers");
const config = require("./config/config");

// nodejs Modules
const cors = require("cors");
const express = require("express");

// Import routes and middlewares
const centralizedErrorHandler = require("./src/middlewares/centralizedErrorHandler");
const runNodejsRouter = require("./src/routers/runNodejsRouter");
const { initServer, setUpClientProjectRoutes } = require("./src/core/setUpRoutes");
const cookieParser = require("cookie-parser");
const localProjectRouter = require("./src/routers/localProjectRouter");

const app = express();

async function startServer() {
  await config.getMainServerConfig();

  const allowedOrigins = [
    config.mainServerConfig.frontendURL,
    config.mainServerConfig.baseURL,
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser())

  initServer(app);

  await setUpClientProjectRoutes()

  app.get("/", (req, res) => {
    res.send("Welcome to DevCollab Execution Server!");
  });

  app.use("/run-nodejs", runNodejsRouter);
  app.use("/on-local", localProjectRouter)

  app.use(centralizedErrorHandler);

  app.listen(config.port, () => {
    console.log("DevCollab Execution server started");
  });
}

startServer();
