import express from 'express';
import { listEmails, getEmail, sendEmail, deleteEmail, modifyEmail } from '../controllers/gmailController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', listEmails);
router.get('/:id', getEmail);
router.post('/send', sendEmail);
router.delete('/:id', deleteEmail);
router.patch('/:id', modifyEmail);

export default router;
