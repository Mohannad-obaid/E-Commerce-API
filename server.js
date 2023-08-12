const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const swaggerUi = require('swagger-ui-express');
const passport = require('passport');
const session = require('express-session');

dotenv.config({ path: "config.env" });
const port = process.env.PORT || 8080;
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const swaggerDocument = require('./swagger.json');
const dbConnect = require("./config/db");
const ApiError = require("./utils/apiError");
const globalErrorHandler = require("./middlewares/errorMiddleware");
const { webhookCheckout } = require("./services/orderServices");
// Routes
const mountRoutes = require("./router");
const OAuthRoutes = require("./router/OAuthRoutes");

const app = express();

// Set security HTTP headers
app.use(helmet());

// Connect to database
dbConnect();

// Enable cors
app.use(cors());
app.options("*", cors());

// Compress all responses
app.use(compression());

// Checkout webhook
app.post(
    "/webhook-checkout",
    express.raw({ type: "application/json" }),
    webhookCheckout
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against XSS
app.use(xss());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//app.use(express.static(path.join(__dirname, 'uploads')));

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
    console.log("Morgan enabled...");
}

// Limit request from same API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 105, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: "Too many requests from this IP, please try again in an hour!",
});

// Apply the rate limiting middleware to all requests
app.use("/api", limiter);


// Prevent parameter pollution
app.use(
    hpp({
        whitelist: ["sold", "price", "ratingsAverage", "ratingsQuantity"],
    })
);


// Routes
app.use(express.static("public"));

// session middleware
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// OAuth 2.0 routes
OAuthRoutes(app);


// Mount routes to app
mountRoutes(app);






// Swagger UI setup for API documentation 

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Checkout webhook
app.post(
    "/webhook-checkout",
    express.raw({ type: "application/json" }),
    webhookCheckout
);

//app.listen(4242, () => console.log('Running on port 4242'));

app.all("*", (req, res, next) => {
    // create error and pass to next middleware
    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // next(err.message);

    next(new ApiError(`Can't find this route :${req.originalUrl}`, 400));
});

//Erorr Handler
app.use(globalErrorHandler);

// Listen to port
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Handle  rejection outside express

process.on("unhandledRejection", (err) => {
    console.log(`UnhandledRejection Error : ${err.name} ${err.message}`);
    server.close(() => {
        console.log("Server shutdown ...");
        process.exit(1);
    });
});
