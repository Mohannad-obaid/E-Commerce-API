const path = require('path');

const express = require('express');
const dotenv = require('dotenv');

dotenv.config({ path: 'config.env' });
const port = process.env.PORT || 3030;
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const dbConnect = require('./config/db');
const ApiError = require('./utils/apiError');
const globalErrorHandler = require('./middlewares/errorMiddleware');

// Routes
const mountRoutes = require('./router');


const app = express();

// Connect to database
dbConnect();

// Enable cors 
app.use(cors());
app.options('*', cors());


// Compress all responses
app.use(compression());





//Middleware

app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log('Morgan enabled...');
}

// Routes
app.use(express.static('public'));

// Mount routes to app 
mountRoutes(app);


app.all('*', (req, res, next) => {
    // create error and pass to next middleware
    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // next(err.message);

    next(new ApiError(`Can't find this route :${req.originalUrl}`, 400))

})


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
        console.log('Server shutdown ...');
        process.exit(1);
    });
})