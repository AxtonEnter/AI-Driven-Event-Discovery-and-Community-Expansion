/**
 * server.ts
 * Server Configuration and API
 */

import express from "express";
import { ApolloServer } from "@apollo/server";
import { createServer } from "http";
import cors from "cors";
import json from "body-parser";
import path from "path";
import morgan from "morgan"; //Log provider
import bodyParser from "body-parser"; //JSON request body parser
import process from "process";
import compression from "compression";
import { schema } from "./schema.js";
import { setupDevAuth, setupSessions } from "./auth.js";
import fs from "fs"
import https from "https"
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloContext } from "./context.js";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

const allowed_origins = [process.env.REACT_APP_ORIGIN, "https://studio.apollographql.com"];

/**
 * set up Cross-Origin Request allowances
 */
const CORS_CONFIG = {
  origin: process.env.REACT_APP_ORIGIN,
  credentials: true,
};

// Load SSL certificates
// const credentials = {
//   key: fs.readFileSync("./cert/private-key.pem"),
//   cert: fs.readFileSync("./cert/certificate.pem"),
// };


const __dirname = path.resolve(path.dirname(''))

/**
 * Initialize the server runner
 */
async function startServer() {
  //if (!process.env.NODE_ENV) process.loadEnvFile(__dirname + "/.env");

  //Init with Node Express
  const app = express();

  //Configure CORS
  app.use(cors());

  //Active File compression 
  app.use(compression());

  //Combined logging
  app.use(morgan("combined"));

  //JSON request body parsing
  app.use(bodyParser.json({ limit: "50mb" }));

  //Prepare client session handler
  setupSessions(app);


  // environment setup
  /**
   * mode: DEVELOPMENT
   * Use local dev login view instead of SAML
   * !! INSECURE !!
   */
  if (process.env.NODE_ENV === "development") {
    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');


    setupDevAuth(app);
  }

  /**
   * mode: PRODUCTION
   * Use production SAML settings. Full security
   */
  else if (process.env.NODE_ENV === "production") {
    throw Error("Unimplemented");
  }

  else {
    process.exit(-1);
  }

  app.use("/app", express.static(path.join(__dirname, "client/npx browserslist@latest --update-db\n")));

  //serves built react app files under root/app
  app.use("/app/", express.static(path.join(__dirname, '/client/dist')));

  app.use('/assets', express.static(path.join(__dirname, '/client/dist/assets')))

  //verifies user logged in under all front-end urls and if not send to login
  app.all("/app/hello", (req, res, next) => {
    console.log("Hello World!")
    //Redirect to login

  });


  //it might seem like you should be able to redirect straight to /app/ from / but for some reason it infitely refreshes
  // and this solves the issue
  app.get("/app/home", function (req, res) {
    res.redirect("/app/")
  })


  //redirects first landing make.rit.edu/ -> make.rit.edu/home
  app.get("/", function (req, res) {
    res.redirect("/app/home");
  });


  app.get("/app/", function (req, res) {
    res.header
    res.sendFile(path.join(__dirname, "/client/dist", "index.html"));
  });


  const server = new ApolloServer({
    schema,
    plugins: [],
  });


  await server.start();
  //Enable GraphQL
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(CORS_CONFIG),
    express.json(),
    expressMiddleware(server,
      {
        context: async ({ req }) => ({ token: req.headers.token }),
      }),
  );

  const httpServer = createServer(app);

  const PORT = process.env.PORT || 3000;

  console.log("dir: " + path.join(__dirname, '/client/dist'));

  httpServer.listen({ port: PORT }, (): void =>
    console.log(
      `🚀 GraphQL-Server is running on https://localhost:${PORT}/graphql`
    )
  );
}


startServer();