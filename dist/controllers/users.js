'use strict';
// *** RUN THE SERVER with auto compilation from TS file to JS with "watch mode":
// tsc -w
// nodemon
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.deleteAllUsers = exports.deleteUser = exports.updatePassword = exports.updateUser = exports.postUser = exports.loginUser = exports.getUsers = void 0;
// FILE SYSTEM and PATH
const fs = __importStar(require('fs'));
// import path from "path"; // provides a way of working with directories and file paths
// bcryptjs for password encrypting
// npm install --save bcryptjs
const bcryptjs_1 = __importDefault(require('bcryptjs'));
// npm install --save jsonwebtoken
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const user_1 = __importDefault(require('../models/user'));
// GET ALL USERS ****************************************
const getUsers = async (req, res, next) => {
  // const totalUsers = await User.find().countDocuments();
  user_1.default
    .find()
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
exports.getUsers = getUsers;
// LOGIN ****************************************
// TOKEN will be created here.
const loginUser = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await user_1.default.findOne({ email: email });
    if (!user) {
      // 404: Not found
      return res.status(404).json({ message: 'Email não cadastrado!' });
    }
    // isPassEqual will be TRUE or FALSE:
    const isPassEqual = await bcryptjs_1.default.compare(
      password,
      user.password
    );
    if (!isPassEqual) {
      // 401: Unauthorized
      return res.status(401).json({ message: 'A senha não confere!' });
    }
    // LOGIN WITH TOKEN:
    const token = jsonwebtoken_1.default.sign(
      {
        userId: user._id.toString(),
      },
      // Secret word could be anything, but should be big and difficult.
      // ! means this variable exists for sure, it will NEVER be null / undefined:
      process.env.TOKEN_JWT,
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
exports.loginUser = loginUser;
// CREATE USER ****************************************
const postUser = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const telephone = req.body.telephone;
  const password = req.body.password;
  const date = new Date();
  // CHECKING if email already registered:
  try {
    const user = await user_1.default.findOne({ email: email });
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
  const hashedPassword = await bcryptjs_1.default.hash(password, 12);
  // Creating and saving the user on MongoDB:
  const user = new user_1.default({
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
exports.postUser = postUser;
// UPDATE USER ****************************************
const updateUser = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const telephone = req.body.telephone;
  const userId = req.params.id;
  // id comes from: router.put("/:id", usersController.updateUser);
  // CHECKING if any alteration was made:
  try {
    const user = await user_1.default.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: 'Usuário com essa ID não encontrado!' });
    }
    // CHECKING if new email is already registered:
    if (email !== user.email) {
      try {
        const user = await user_1.default.findOne({ email: email });
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
exports.updateUser = updateUser;
// UPDATE PASSWORD ****************************************
const updatePassword = async (req, res, next) => {
  const passwordCur = req.body.password;
  const passwordNew = req.body.passwordNew;
  const userId = req.params.id;
  try {
    const user = await user_1.default.findById(userId);
    if (!user) {
      // 404: Not Found
      return res
        .status(404)
        .json({ message: 'Usuário com essa ID não encontrado!' });
    }
    const isPasswordEqual = await bcryptjs_1.default.compare(
      passwordCur,
      user.password
    );
    if (!isPasswordEqual) {
      // 403: FORBIDDEN
      return res.status(403).json({ message: 'A senha não confere!' });
    }
    // Encrypting the new password with bcryptjs:
    const newHashedPassword = await bcryptjs_1.default.hash(passwordNew, 12);
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
exports.updatePassword = updatePassword;
// DELETE USER (Production) ****************************************
// DELETE USER (Administration) ****************************************
// Function only for the purpose of ADM! In production, no data should be erased!
// PRODUCTION-DELETION: deleted: true
const deleteUser = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const userToDelete = await user_1.default.findByIdAndDelete(userId);
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
exports.deleteUser = deleteUser;
// DELETE ALL USER (Administration) ****************************************
const deleteAllUsers = async (req, res, next) => {
  const totalUsers = await user_1.default.find().countDocuments();
  if (totalUsers < 1) {
    // 400: Bad Request
    return res.status(400).json({ message: 'There are no users available!' });
  }
  const admPassword = req.params.admPassword;
  if (admPassword === 'adm.123') {
    user_1.default
      .deleteMany()
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
exports.deleteAllUsers = deleteAllUsers;
