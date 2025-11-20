require("dotenv").config({ path: "../.env" });

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const session = require("express-session");
const helmet = require("helmet");

const indexRouter = require("./routes/index");

const app = express();

/* -----------------------------
   CONFIG CORS
----------------------------- */
const allowedOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://frontend:8080",
  "http://localhost:8082",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
    "refreshtoken",
  ],
  exposedHeaders: ["set-cookie"],
  maxAge: 86400,
};

app.use(cors(corsOptions));

/* -----------------------------
   STATIC FILES
----------------------------- */
app.use("/photos", express.static(path.join(__dirname, "photos")));
app.use(express.static(path.join(__dirname, "../frontend/dist")));

/* -----------------------------
   VIEW ENGINE
----------------------------- */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

/* -----------------------------
   PARSERS (une seule fois)
----------------------------- */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* -----------------------------
   SECURITY
----------------------------- */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/* -----------------------------
   SESSIONS
----------------------------- */
app.use(
  session({
    secret: "axelfernandez",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

/* -----------------------------
   MIDDLEWARES
----------------------------- */
app.use(logger("dev"));
app.use(cookieParser());

/* -----------------------------
   ROUTES
----------------------------- */
app.use("/", indexRouter);

/* -----------------------------
   404 HANDLER
----------------------------- */
app.use(function (req, res, next) {
  next(createError(404));
});

/* -----------------------------
   ERROR HANDLER
----------------------------- */
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
