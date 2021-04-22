import { Router } from 'express';
import {
  getUsers,
  postUser,
  loginUser,
  updateUser,
  updatePassword,
  deleteUser,
  deleteAllUsers,
} from '../controllers/users';

const router = Router();
import { isAuth } from '../middleware/isAuth';

// PATH IS: /users (app.use("/users", usersRoutes);)
// router.get('/', isAuth, getUsers);
router.get('/', getUsers);
router.post('/login', loginUser);
router.post('/', postUser);
router.put('/:id', updateUser);
router.put('/password/:id', updatePassword);
router.delete('/:id', deleteUser);
router.delete('/adm/delete-all-users/:admPassword', deleteAllUsers);

export default router;
