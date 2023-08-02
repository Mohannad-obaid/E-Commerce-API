const mongoose = require('mongoose');



const dbConnection = () => {
    mongoose.connect(process.env.DB_URL_CONNECT)
    .then(() => {
        console.log('MongoDB successfully connected 👌 ');
    }) 
  // .catch((err) => {
  //     console.log("Error connecting to MongoDB")
  //     console.log(err)
  //     process.exit(1);
  // });


};

mongoose.set('strictQuery', true)

module.exports = dbConnection;