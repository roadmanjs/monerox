import * as path from "path";

import { errorHandler, errorNotFoundHandler } from "./middlewares/errorHandler";
import express, { json } from "express";

import cors from "cors";
// Routes
import { index } from "./routes/index";
import logger from "morgan";
import { walletRouter } from "./controllers/wallet";

// Create Express server
export const app = express();

app.use(json());
app.use(cors());

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");

app.use(logger("dev"));

app.use(express.static(path.join(__dirname, "../public")));
app.use("/", index);

app.use("/wallet", walletRouter());

app.use(errorNotFoundHandler);
app.use(errorHandler);
