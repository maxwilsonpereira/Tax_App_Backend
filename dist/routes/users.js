"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = require("../controllers/users");
const router = express_1.Router();
const isAuth_1 = require("../middleware/isAuth");
// PATH IS: /users (app.use("/users", usersRoutes);)
router.get('/', isAuth_1.isAuth, users_1.getUsers);
router.post('/login', users_1.loginUser);
router.post('/', users_1.postUser);
router.put('/:id', users_1.updateUser);
router.put('/password/:id', users_1.updatePassword);
router.delete('/:id', users_1.deleteUser);
router.delete('/adm/delete-all-users/:admPassword', users_1.deleteAllUsers);
exports.default = router;
