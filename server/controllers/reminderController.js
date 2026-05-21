import Reminder from '../models/Reminder.js';

export const listReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id }).sort({ dueDate: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createReminder = async (req, res) => {
  try {
    const reminder = new Reminder({
      ...req.body,
      userId: req.user._id,
    });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
