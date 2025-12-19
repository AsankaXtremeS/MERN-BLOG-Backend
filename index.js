const express = require('express');
const cors = require('cors');
const { connect } = require('mongoose');
require('dotenv').config();



const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { notFound , errorHandler} = require('./middleware/errorMiddleware');

const app = express();

app.use(express.json({ extended: true })); //use express json middleware
app.use(express.urlencoded({ extended: true })); //use express urlencoded middleware
app.use(cors({ credentials: true, origin: "http://localhost:3000" })); //use cors middleware

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(notFound);
app.use(errorHandler);

//Connect to MongoDB and start the server

connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });