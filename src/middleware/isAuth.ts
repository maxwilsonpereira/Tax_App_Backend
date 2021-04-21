// FRONTEND: src\pages\AdminPage\index.js
// fetch(`${serverURL}/users`, {
//   headers: {
//     // "Bearer " is a convention of Authentication Token:
//     Authorization: "Bearer " + token,
//     "Content-Type": "Application/json",
//   },
// })

// AUTHENTICATION:
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/12097912

// This middleware will check if there is a valid Token:
// If NOT, it will return an error.
// If YES, it will go to next() middleware.

// Authorization MUST BE ENABLED TO USE AUTHENTICATION (app.ts):
// "Access-Control-Allow-Headers",
// "Content-Type, Authorization",

import { RequestHandler } from 'express';

// LOGIN with TOKEN with:
// npm install --save jsonwebtoken
// Check the token at (must enter the secret word): https://jwt.io/
import jwt from 'jsonwebtoken';

export const isAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    // 401: Unauthorized
    res.status(401).json({ message: 'Usuário não autenticado!' });
    throw new Error('Usuário não autenticado!');
  }

  // [0] = "Bearer ", [1] = TOKEN:
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    // ! means this variable exists for sure, it will NEVER be null / undefined:
    decodedToken = jwt.verify(token, process.env.TOKEN_JWT!);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    res.status(401).json({ message: 'Usuário não autenticado!' });
    throw new Error('Usuário não autenticado!');
  }
  // VALID TOKEN:
  // userId and email were stored in the token and can be accessed like this:
  console.log('VALID TOKEN!');
  next();
};
