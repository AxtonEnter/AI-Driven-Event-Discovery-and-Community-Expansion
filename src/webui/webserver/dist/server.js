"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_2 = __importDefault(require("body-parser"));
const process_1 = __importDefault(require("process"));
const compression_1 = __importDefault(require("compression"));
const schema_1 = require("./schema");
const auth_1 = require("./auth");
const allowed_origins = [process_1.default.env.REACT_APP_ORIGIN, "https://studio.apollographql.com"];
const CORS_CONFIG = {
    origin: process_1.default.env.REACT_APP_ORIGIN,
    credentials: true,
};
async function startServer() {
    require("dotenv").config({ path: __dirname + "/./../.env" });
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)(CORS_CONFIG));
    app.use((0, compression_1.default)());
    app.use((0, morgan_1.default)("combined"));
    app.use(body_parser_2.default.json());
    (0, auth_1.setupSessions)(app);
    if (process_1.default.env.NODE_ENV === "development") {
        app.set('views', path_1.default.join(__dirname, 'views'));
        app.set('view engine', 'ejs');
        (0, auth_1.setupDevAuth)(app);
    }
    else if (process_1.default.env.NODE_ENV === "production") {
        throw Error("Unimplemented");
    }
    else {
        process_1.default.exit(-1);
    }
    app.use("/app", express_1.default.static(path_1.default.join(__dirname, "../../client/npx browserslist@latest --update-db\n")));
    app.use("/app/", express_1.default.static(path_1.default.join(__dirname, '../client/build')));
    app.all("/app/*", (req, res, next) => {
        console.log("Hello World!");
    });
    app.get("/app/home", function (req, res) {
        res.redirect("/app/");
    });
    app.get("/", function (req, res) {
        res.redirect("/app/home");
    });
    app.get("/app/*", function (req, res) {
        res.header;
        res.sendFile(path_1.default.join(__dirname, "../../client/build", "index.html"));
    });
    const server = new server_1.ApolloServer({
        schema: schema_1.schema,
        plugins: [],
    });
    await server.start();
    app.use("/graphql", (0, cors_1.default)(CORS_CONFIG), (0, body_parser_1.default)());
    const httpServer = (0, http_1.createServer)(app);
    const PORT = process_1.default.env.PORT || 3000;
    console.log(process_1.default.env.ID_FORMAT);
    httpServer.listen({ port: PORT }, () => console.log(`🚀 GraphQL-Server is running on https://localhost:${PORT}/graphql`));
}
startServer();
//# sourceMappingURL=server.js.map