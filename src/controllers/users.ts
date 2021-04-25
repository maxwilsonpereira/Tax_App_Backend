// *** RUN THE SERVER with auto compilation from TS file to JS with "watch mode":
// tsc -w
// nodemon

// OBS: throw new Error AND return: THE EXECUTION STOPS at this point!
// Using RETURN is more safe and more clear!
// ***** THROW NEW ERROR will take the code to the correspondent catch()!
// Example: throw new Error('A senha não confere!');

// So, it's good to use it! You can use one of them or both.
// ONE WAY TO WRITE:
// import { Request, Response, NextFunction } from "express";
// export const getUsers: RequestHandler = (req, res, next) => {}
// BETTER WAY TO WRITE:
import { RequestHandler } from 'express';
// FILE SYSTEM and PATH
import * as fs from 'fs';
// import path from "path"; // provides a way of working with directories and file paths
// bcryptjs for password encrypting
// npm install --save bcryptjs
import bcrypt from 'bcryptjs';
// npm install --save jsonwebtoken
import jwt from 'jsonwebtoken';

import User from '../models/user';

// GET ALL USERS ****************************************
export const getUsers: RequestHandler = async (req, res, next) => {
  // const totalUsers = await User.find().countDocuments();
  User.find()
    .then((users) => {
      const totalUsers = users.length;
      return res.status(200).json({
        message: 'Users fetched successfully',
        users: users,
        totalItems: totalUsers || 'No user available!',
      });
    })
    .catch((err) => {
      // 500: Internal server error
      return res.status(500).json({ message: 'Internal server error!' });
    });
};

// LOGIN ****************************************
// TOKEN will be created here.
export const loginUser: RequestHandler = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      // 404: Not found
      return res.status(404).json({ message: 'Email não cadastrado!' });
    }
    // isPassEqual will be TRUE or FALSE:
    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      // 401: Unauthorized
      return res.status(401).json({ message: 'A senha não confere!' });
    }

    // LOGIN WITH TOKEN:
    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      // Secret word could be anything, but should be big and difficult.
      // ! means this variable exists for sure, it will NEVER be null / undefined:
      process.env.TOKEN_JWT!,
      // Expire date/time:
      { expiresIn: '120h' }
    );
    return res.status(200).json({
      token: token,
      id: user._id.toString(),
      name: user.name,
      // email: user.email,
      telephone: user.telephone,
    });
  } catch (err) {
    // 500: Internal server error
    return res.status(500).json({ message: 'Internal server error!' });
  }
};

// CREATE USER ****************************************
export const postUser: RequestHandler = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const telephone = req.body.telephone;
  const password = req.body.password;
  const date = new Date();

  // CHECKING if email already registered:
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      // SENDING ERR MESSAGE TO FRONTEND, file "src/components/Pages/Cadastro/Cadastro.js",
      // function cadastrarHandler()
      // 409: Conflict
      return res.status(409).json({ message: 'Email já cadastrado!' });
    }
  } catch (err) {
    // 500: Internal server error
    return res
      .status(500)
      .json({ message: 'Internal server error! (Code: E1)' });
  }
  // Encrypting password with bcryptjs:
  const hashedPassword = await bcrypt.hash(password, 12);
  // Creating and saving the user on MongoDB:
  const user = new User({
    name: name,
    email: email,
    telephone: telephone,
    password: hashedPassword,
    createdAt: date,
    deletedAt: '1900-01-01T00:00:00.000Z',
  });
  try {
    const newUser = await user.save();
    // WRITING / SAVING INFOS to a local file (on the backend root folder):
    // Getting the IP from the request:
    const ip = req.socket.remoteAddress;
    // \r - Carriage Return: return the cursor to the beginning of the same line.
    // \n - Line Feed: New line.
    // \r\n is often used in preference to \n as it displays properly on both unix and Windows.
    fs.writeFileSync(
      'LocalRegister.txt',
      'Date: ' +
        date +
        '\r\n' +
        'IP: ' +
        ip +
        '\r\n' +
        'Name: ' +
        name +
        '\r\n' +
        'Email: ' +
        email +
        '\r\n' +
        'Telephone: ' +
        telephone +
        '\r\n' +
        // "Password: " +
        // password +
        // "\r\n" +
        '\r\n',
      // flag: "a" means that NEW data will be added:
      // If doesn't work, try: flags: "a"
      { flag: 'a' }
    );
    return res
      .status(201) // 201: Created
      .json({ message: 'Usuário criado com sucesso!', newUser: newUser });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Internal server error! (Code: E2)' });
  }
};

// UPDATE USER ****************************************
export const updateUser: RequestHandler = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const telephone = req.body.telephone;
  const userId = req.params.id;
  // id comes from: router.put("/:id", usersController.updateUser);

  // CHECKING if any alteration was made:
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: 'Usuário com essa ID não encontrado!' });
    }
    // CHECKING if new email is already registered:
    if (email !== user.email) {
      try {
        const user = await User.findOne({ email: email });
        if (user) {
          // SENDING ERR MESSAGE TO FRONTEND, file "src/components/Pages/Cadastro/Cadastro.js",
          // function cadastrarHandler()
          // 409: Conflict
          return res
            .status(409)
            .json({ message: 'Este email já se encontra cadastrado!' });
        }
      } catch (err) {
        // 500: Internal server error
        return res
          .status(500)
          .json({ message: 'Internal server error! (Code: E1)' });
      }
    }

    // Updating infos:
    user.name = name;
    user.email = email;
    user.telephone = telephone;
    try {
      // it will update the existing one, not create a new one:
      const userUpdated = await user.save();
      return res.status(201).json({
        message: 'Informações atualizadas!',
        userUpdated: userUpdated,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: 'Internal server error! (Code: E2)' });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Internal server error! (Code: E3)' });
  }
};

// UPDATE PASSWORD ****************************************
export const updatePassword: RequestHandler = async (req, res, next) => {
  const passwordCur = req.body.password;
  const passwordNew = req.body.passwordNew;
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      // 404: Not Found
      return res
        .status(404)
        .json({ message: 'Usuário com essa ID não encontrado!' });
    }

    const isPasswordEqual = await bcrypt.compare(passwordCur, user.password);
    if (!isPasswordEqual) {
      // 403: FORBIDDEN
      return res.status(403).json({ message: 'A senha não confere!' });
    }

    // Encrypting the new password with bcryptjs:
    const newHashedPassword = await bcrypt.hash(passwordNew, 12);
    // Updating the password:
    user.password = newHashedPassword;
    try {
      const userUpdated = await user.save();
      return res.status(200).json({
        message: 'Senha atualizada!',
        userUpdated: userUpdated,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: 'Internal server error! (Code: E2)' });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Internal server error! (Code: E1)' });
  }
};

// DELETE USER (Production) ****************************************

// DELETE USER (Administration) ****************************************
// Function only for the purpose of ADM! In production, no data should be erased!
// PRODUCTION-DELETION: deleted: true
export const deleteUser: RequestHandler = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const userToDelete = await User.findByIdAndDelete(userId);
    if (userToDelete) {
      return res
        .status(200)
        .json({ message: 'Usuário deletado!', user: userToDelete });
    } else {
      // 404: Not Found
      return res
        .status(404)
        .json({ message: 'Usuário com essa ID não encontrado!' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error!' });
  }
};

// DELETE ALL USER (Administration) ****************************************
export const deleteAllUsers: RequestHandler = async (req, res, next) => {
  const totalUsers = await User.find().countDocuments();
  if (totalUsers < 1) {
    // 400: Bad Request
    return res.status(400).json({ message: 'There are no users available!' });
  }
  const admPassword = req.params.admPassword;
  if (admPassword === 'adm.123') {
    User.deleteMany()
      .then(() => {
        return res.status(200).json({ message: 'All users deleted!' });
      })
      .catch((err) => {
        return res.status(500).json({ message: 'Internal server error!' });
      });
  } else {
    return res.status(500).json({ message: 'Wrong password!' });
  }
};
