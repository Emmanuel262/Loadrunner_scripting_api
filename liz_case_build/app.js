import path from "path";
import { dirname } from "path";
import express from "express";
import cookieParser from "cookie-parser"; // Security
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import xss from "xss-clean"; // Security
import cors from "cors"; // Security
import hpp from "hpp";
import helmet from "helmet"; // Security
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import engines from "consolidate";
import morgan from "morgan";
import methodOverride from "method-override";

// GET, PUT, PATCH, POST, DELETE,
// CRUD -> Create - POST, Read - GET, Update - PATCH, PUT, Delete - DELETE

// Import routes
import homeRoutes from "./routes/homeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

import { checkAuthentication, checkuser } from "./middleware/check-user.js";

dotenv.config();
const app = express();
const __dirname = path.resolve();
app.enable("trust proxy");
app.use(cors());
app.options("*", cors());
app.use(helmet());
app.use(methodOverride("_method"));

app.use(morgan());

// Connect to database
const DB_URI = process.env.MONGODB_URI;

// Middleware set up
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 1000000,
  })
);
// Set up public folder access
app.use(express.static(path.join(__dirname, "publics")));
// app.use(express.static('public'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Set up view engine
app.set("view engine", "ejs");
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header({ "Access-Control-Allow-Headers": "*" });
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-type, Accept, Authorization, x-access-token"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, GET, DELETE");
    return res.status(200).json({});
  }

  next();
});

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requetss from this IP, please try again in an hour!",
});
app.get("*", (req, res, next) => {
  res.set(
    "Content-Security-Policy",
    "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'"
  );
  next();
});
app.use("/api/v1", limiter);
app.use(mongoSanitize());
app.use(xss());

// app.get("*", checkAuthentication);
app.get("*", checkuser);

// Set up routes
app.use("/products", searchRoutes);
app.use("/api/v1/", homeRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/products", productRoutes);

app.use("/", homeRoutes);

// Errror response
app.use((req, res, next) => {
  const error = new Error(`Can't find ${req.originalUrl} on this server!`);
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message,
      error: error,
    },
  });
});

const PORT = process.env.PORT || 3000;

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("DB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

export default app;
