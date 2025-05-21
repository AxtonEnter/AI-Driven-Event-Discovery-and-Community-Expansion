"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSessions = setupSessions;
exports.setupDevAuth = setupDevAuth;
const fs_1 = __importDefault(require("fs"));
const passport_local_1 = require("passport-local");
const express_session_1 = __importDefault(require("express-session"));
const uuid_1 = require("uuid");
const assert_1 = __importDefault(require("assert"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const passport_1 = __importDefault(require("passport"));
function mapToDevUser(userID, password) {
    var obj = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, "/data/devUsers.json"), 'utf8'));
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
function setupSessions(app) {
    const secret = process.env.SESSION_SECRET;
    (0, assert_1.default)(secret, "SESSION_SECRET env value is null");
    app.use((0, express_session_1.default)({
        genid: (req) => (0, uuid_1.v4)(),
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
function setupDevAuth(app) {
    const reactAppUrl = process.env.REACT_APP_URL;
    (0, assert_1.default)(reactAppUrl, "REACT_APP_URL env value is null");
    const authStrategy = new passport_local_1.Strategy(async function (username, password, done) {
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
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use(express_1.default.json());
    app.get('/login', function (req, res, next) {
        res.render('login');
    });
    app.post('/login/password', passport_1.default.authenticate('local', {
        successRedirect: reactAppUrl,
        failureRedirect: '/login'
    }));
    app.post("/logout", (req, res) => {
        passport_1.default.session().destroy;
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