/**
 * auth.ts
 * Authentication procedures for Cognito
 */


import session from "express-session";
import { v4 as uuidv4 } from "uuid";
import assert from "assert";
import express from "express";
import { createUser, getUserByUsername } from "./repositories/userRepo.js";


export async function serializeUser(decodedData: any) {
  if (decodedData?.email) {
    return await getUserByUsername(decodedData.email).then(async (user) => {
      console.log("serializeUser: ", user);
      if (user) {
        return user;
      } else {
        console.log("serializeUser: Creating new user for email", decodedData.email);
        return await createUser(decodedData.email);
      }
    });
  } else {
    console.warn("serializeUser: No email found in decoded data");
    return null;
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
