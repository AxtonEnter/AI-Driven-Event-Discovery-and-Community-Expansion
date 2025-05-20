/**
 * auth.ts
 * Authentication procedures for SAML2
 */

import fs from 'fs';
import { Strategy as LocalStrategy } from 'passport-local';
import session from "express-session";
import { v4 as uuidv4 } from "uuid";
import assert from "assert";
import express from "express";
import path from "path";
import passport from 'passport';


/**
 * DEV ONLY
 * Map devUsers file to users
 */
function mapToDevUser(userID: string, password: string) {
  var obj = JSON.parse(fs.readFileSync(path.join(__dirname, "/data/devUsers.json"), 'utf8'));
  const devUser = obj[userID];
  if (devUser === undefined || devUser["password"] !== password) {
    return undefined;
  }
  else {
    return {
      firstName: devUser.firstName,
      lastName: devUser.lastName,
      universityID: devUser.email,
      ritUsername: devUser.ritUsername
    };
  }
}

/**
 * Initialize client session
 * @param app NodeJS application context
 */
export function setupSessions(app: express.Application) {
  const secret = process.env.SESSION_SECRET;
  assert(secret, "SESSION_SECRET env value is null");

  app.use(
    session({
      genid: (req) => uuidv4(),
      secret: secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production" ? true : false, // this will make cookies send only over https
        httpOnly: true, // cookies are sent in requests, but not accessible to client-side JS
        maxAge: 7200000, // 40 minutes in milliseconds
        sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict" // allow cookies to send between local ports in development
      },
    })
  );
}

// Unsafe auth -- local development only
export function setupDevAuth(app: express.Application) {
  const reactAppUrl = process.env.REACT_APP_URL;

  assert(reactAppUrl, "REACT_APP_URL env value is null");

  const authStrategy = new LocalStrategy(
    async function (username: string, password: string, done: any) {
      try {
        const devUser = mapToDevUser(username, password);

        if (devUser === undefined) {
          console.log("failed")
          return done(null, false, { message: 'Incorrect username or password.' });
        }
        else {
          console.log("valid login");
          return done(null, devUser);
        }  
      }
      catch (err) {
        console.log(err)
        done(null, false, {message: 'some error'});
      }
    }
  );
  
  //Enable URL parsing for request handling
  app.use(express.urlencoded({ extended: false }));
  //Enable JSON body parsing for request handling
  app.use(express.json());

  //Render dev login page (if DEVELOPMENT mode)
  app.get('/login', function(req, res, next) {
    res.render('login');
  });

  //Handle dev login
  app.post('/login/password', passport.authenticate('local', {
    successRedirect: reactAppUrl,
    failureRedirect: '/login'
  }));
  
  //Handle logout and session destruction
  //TODO Figure out how to call for the destruction of Shibboleth Session
  app.post("/logout", (req, res) => {

    // for development purposes just nuking the session whenever it is requested
    passport.session().destroy

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          res.status(400).send("Logout failed");
        } else {
          res.clearCookie("connect.sid");

          res.redirect(process.env.REACT_APP_LOGGED_OUT_URL ?? "");
        }
      });
    } else {
      res.end();
    }
  });
}