import express from "express";
import { ApolloServer } from "@apollo/server";
import { createServer } from "http";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import bodyParser from "body-parser";
import process from "process";
import compression from "compression";
import { schema } from "./schema.js";
import { setupDevAuth, setupSessions } from "./auth.js";
import { expressMiddleware } from "@as-integrations/express5";
const allowed_origins = [process.env.REACT_APP_ORIGIN, "https://studio.apollographql.com"];
const CORS_CONFIG = {
    origin: process.env.REACT_APP_ORIGIN,
    credentials: true,
};
const __dirname = path.resolve(path.dirname(''));
async function startServer() {
    const app = express();
    app.use(cors());
    app.use(compression());
    app.use(morgan("combined"));
    app.use(bodyParser.json({ limit: "50mb" }));
    setupSessions(app);
    if (process.env.NODE_ENV === "development") {
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'ejs');
        setupDevAuth(app);
    }
    else if (process.env.NODE_ENV === "production") {
        throw Error("Unimplemented");
    }
    else {
        process.exit(-1);
    }
    app.use("/app", express.static(path.join(__dirname, "client/npx browserslist@latest --update-db\n")));
    app.use("/app/", express.static(path.join(__dirname, '/client/dist')));
    app.use('/assets', express.static(path.join(__dirname, '/client/dist/assets')));
    app.all("/app/hello", (req, res, next) => {
        console.log("Hello World!");
    });
    app.get("/app/home", function (req, res) {
        res.redirect("/app/");
    });
    app.get("/", function (req, res) {
        res.redirect("/app/home");
    });
    app.get("/app/", function (req, res) {
        res.header;
        res.sendFile(path.join(__dirname, "/client/dist", "index.html"));
    });
    const server = new ApolloServer({
        schema,
        plugins: [],
    });
    await server.start();
    app.use("/graphql", cors(CORS_CONFIG), express.json(), expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.token }),
    }));
    const httpServer = createServer(app);
    const PORT = process.env.PORT || 3000;
    console.log("dir: " + path.join(__dirname, '/client/dist'));
    httpServer.listen({ port: PORT }, () => console.log(`🚀 GraphQL-Server is running on https://localhost:${PORT}/graphql`));
}
startServer();
//# sourceMappingURL=server.js.map