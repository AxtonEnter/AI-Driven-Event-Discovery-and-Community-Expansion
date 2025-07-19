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
import { setupSessions } from "./auth.js";
import fs from "fs"
import https from "https"
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloContext } from "./context.js";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Request, Response, NextFunction } from "express";
import axios from "axios";
import qs from "querystring";
import cookieParser from "cookie-parser";

const allowed_origins = [process.env.REACT_APP_ORIGIN, "https://studio.apollographql.com"];

/**
 * set up Cross-Origin Request allowances
 */
const CORS_CONFIG = {
  origin: process.env.REACT_APP_ORIGIN,
  //credentials: true,
};

// Load SSL certificates
// const credentials = {
//   key: fs.readFileSync("./cert/private-key.pem"),
//   cert: fs.readFileSync("./cert/certificate.pem"),
// };


const __dirname = path.resolve(path.dirname(''))



// AWS Cognito config (set these in your environment)
const COGNITO_REGION = process.env.COGNITO_REGION;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN; // e.g. https://your-domain.auth.us-east-1.amazoncognito.com

// JWKS client for Cognito
const jwks = jwksClient({
  jwksUri: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});

function getKey(header: jwt.JwtHeader, callback: (err: Error | null, key?: string) => void) {
  jwks.getSigningKey(header.kid, function (err: Error | null, key: any) {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}

// Middleware to require Cognito login
async function requireCognitoLogin(req: any, res: any, next: any) {
  console.log("req: ", req);
  console.log("req.cookies: ", req.cookies);


  const token = req.cookies?.id_token;

  if (token) {
    console.log(`Verifying JWT token ${token}...`);
    try {
      return jwt.verify(token, getKey, {
        audience: COGNITO_CLIENT_ID,
        issuer: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
        algorithms: ["RS256"],
      }, (err, decoded) => {
        if (err) {
          console.error("JWT verification error:", err);
          return res.status(401).send("Unauthorized");
        }
        req.user = decoded;
        console.log("JWT verified successfully:", req.user);
        return next();
      });

    } catch (err) {
      console.log("JWT verification error:", err);
    }
  }

  const code = req.query.code;
  if (code) {
    try {
      const tokenResponse = await axios.post(
        `${COGNITO_DOMAIN}/oauth2/token`,
        qs.stringify({
          grant_type: "authorization_code",
          client_id: COGNITO_CLIENT_ID,
          code,
          redirect_uri: process.env.REACT_APP_URL ?? `${req.protocol}://${req.get("host")}/app/`,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const idToken = tokenResponse.data.id_token;
      res.cookie("id_token", idToken, {
        path: "/",
        httpOnly: false, // if you need to access it via JS
        secure: true,   // set to true only if using HTTPS
        sameSite: "None", // or "None" if cross-site
      });
      console.log(`Token exchange successful, redirecting...`);
      return res.redirect(req.originalUrl.split("?")[0]); // Strip code param
    } catch (err: any) {
      console.log("Token exchange error:", err.response?.data || err.message);
    }

  }

  const redirectUri = encodeURIComponent(process.env.REACT_APP_URL ?? `${req.protocol}://${req.get("host")}/app/`);
  return res.redirect(`${COGNITO_DOMAIN}/login?client_id=${COGNITO_CLIENT_ID}&response_type=code&scope=openid+profile+email&redirect_uri=${redirectUri}`);
}


/**
 * Initialize the server runner
 */
async function startServer() {
  //if (!process.env.NODE_ENV) process.loadEnvFile(__dirname + "/.env");

  //Init with Node Express
  const app = express();

  //Configure CORS
  app.use(cors());

  //Parse cookies
  app.use(cookieParser());

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
    //setupDevAuth(app);
    app.use(["/app", "/assets"], requireCognitoLogin);
  }
  /**
   * mode: PRODUCTION
   * Require AWS Cognito authentication for all /app routes
   */
  else if (process.env.NODE_ENV === "production") {
    // Require Cognito login for all /app and /assets routes
    app.use(["/app", "/assets"], requireCognitoLogin);
  }
  else {
    process.exit(-1);
  }

  //serves built react app files under root/app
  app.use("/app/", express.static(path.join(__dirname, '/client/dist')));
  app.use('/assets', express.static(path.join(__dirname, '/client/dist/assets')))

  //verifies user logged in under all front-end urls and if not send to login
  app.all("/app/hello", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log("Hello World!")
    //Redirect to login
  });

  //it might seem like you should be able to redirect straight to /app/ from / but for some reason it infitely refreshes
  // and this solves the issue
  app.get("/app/home", function (req: express.Request, res: express.Response) {
    res.redirect("/app/")
  })

  //redirects first landing make.rit.edu/ -> make.rit.edu/home
  app.get("/", function (req: express.Request, res: express.Response) {
    res.redirect("/app/home");
  });

  app.get("/app/", function (req: express.Request, res: express.Response) {
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

  httpServer.listen({ port: PORT }, (): void => {
    console.log(
      `🚀 GraphQL-Server is running on ${process.env.REACT_APP_GRAPHQL_URL}`
    )
    console.log(process.env)
  }
  );
}


startServer();