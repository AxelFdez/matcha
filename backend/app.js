require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Configuration CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permettre les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONT_URL,
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://frontend:8080'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,                    // Permet l'envoi et la réception des cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400                        // Cache preflight pendant 24h
};

app.use(cors(corsOptions));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// Limiter les requêtes JSON et URL-encoded à 1 Mo
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Sécurisation des en-têtes HTTP
app.use(helmet());

app.use(session({
  secret: 'axelfernandez',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// //middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.use(express.static('../frontend/dist'));

module.exports = app;
