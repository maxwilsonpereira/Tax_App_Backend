import { Router } from 'express';
import { sendEmail } from '../controllers/emails';

const router = Router();

// PATH IS: /emails --> app.use("/emails", usersRoutes);

router.post('/', sendEmail);

export default router;
