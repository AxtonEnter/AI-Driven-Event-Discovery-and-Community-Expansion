import fs from 'fs';
import { Strategy as LocalStrategy } from 'passport-local';
import session from "express-session";
import { v4 as uuidv4 } from "uuid";
import assert from "assert";
import express from "express";
import path from "path";
import passport from 'passport';
function mapToDevUser(userID, password) {
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
export function setupSessions(app) {
    const secret = process.env.SESSION_SECRET;
    assert(secret, "SESSION_SECRET env value is null");
    app.use(session({
        genid: (req) => uuidv4(),
        secret: secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: true,
            maxAge: 7200000,
            sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict"
        },
    }));
}
export function setupDevAuth(app) {
    const reactAppUrl = process.env.REACT_APP_URL;
    assert(reactAppUrl, "REACT_APP_URL env value is null");
    const authStrategy = new LocalStrategy(async function (username, password, done) {
        try {
            const devUser = mapToDevUser(username, password);
            if (devUser === undefined) {
                console.log("failed");
                return done(null, false, { message: 'Incorrect username or password.' });
            }
            else {
                console.log("valid login");
                return done(null, devUser);
            }
        }
        catch (err) {
            console.log(err);
            done(null, false, { message: 'some error' });
        }
    });
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.get('/login', function (req, res, next) {
        res.render('login');
    });
    app.post('/login/password', passport.authenticate('local', {
        successRedirect: reactAppUrl,
        failureRedirect: '/login'
    }));
    app.post("/logout", (req, res) => {
        passport.session().destroy;
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    res.status(400).send("Logout failed");
                }
                else {
                    res.clearCookie("connect.sid");
                    res.redirect(process.env.REACT_APP_LOGGED_OUT_URL ?? "");
                }
            });
        }
        else {
            res.end();
        }
    });
}
//# sourceMappingURL=auth.js.map