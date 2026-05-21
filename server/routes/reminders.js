import express from 'express';
import { listReminders, createReminder, updateReminder, deleteReminder } from '../controllers/reminderController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', listReminders);
router.post('/', createReminder);
router.patch('/:id', updateReminder);
router.delete('/:id', deleteReminder);

export default router;
