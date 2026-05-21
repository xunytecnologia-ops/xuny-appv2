import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  emailId: String, // Link to a specific Gmail message ID
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none',
  },
  googleCalendarEventId: String,
}, { timestamps: true });

const Reminder = mongoose.model('Reminder', reminderSchema);
export default Reminder;
