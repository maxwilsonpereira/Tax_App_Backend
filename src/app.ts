// *** RUN THE SERVER with auto compilation from TS file to JS with "watch mode"
// TERMINAL 1: tsc -w / TERMINAL 2: nodemon

import express, { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
// https://www.npmjs.com/package/cors
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs'; // file system (read, create, uodate, delete, rename files)
import path from 'path'; // provides a way of working with directories and file paths
import userRouter from './routes/users';

const app = express();
app.use(json());
dotenv.config();

// saving login infos with morgan
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  // flags: "a" means that NEW data will be added
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));
app.use(helmet()); // middleware that will add security headers

// options for cors midddleware
const options: cors.CorsOptions = {
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
    // "Access-Control-Allow-Origin",
    // "ssid",
    // Authorization MUST BE ENABLED TO USE AUTHENTICATION:
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  ],
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: '*', // DEV MODE
  //   origin: API_URL, // PRODUCTION MODE
  preflightContinue: false,
};
app.use(cors(options));
// app.options("*", cors(options)); // enable pre-flight

app.use('/users', userRouter);

// ERROR HANDLER MIDDLEWARE will be fired if ANY ERROR occurs
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({ message: err.message });
  console.log(err.message);
});

// ENVIROMENT VARIABLES
// DEV MODE with nodemon: nodemon.json file
// PRODUCTION MODE: .env file
// console.log(process.env.MONGO_USER);
// connection string: https://www.mongodb.com/cloud/atlas
const URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-lywhn.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(process.env.PORT || 8080);
    console.log('API simulator running at port 8080');
  })
  .catch((err) => console.log(err));
