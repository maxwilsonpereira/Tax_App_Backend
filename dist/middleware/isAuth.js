"use strict";
// FRONTEND: src\pages\AdminPage\index.js
// fetch(`${serverURL}/users`, {
//   headers: {
//     // "Bearer " is a convention of Authentication Token:
//     Authorization: "Bearer " + token,
//     "Content-Type": "Application/json",
//   },
// })
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
// LOGIN with TOKEN with:
// npm install --save jsonwebtoken
// Check the token at (must enter the secret word): https://jwt.io/
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = async (req, res, next) => {
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
        decodedToken = jsonwebtoken_1.default.verify(token, process.env.TOKEN_JWT);
    }
    catch (err) {
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
exports.isAuth = isAuth;
