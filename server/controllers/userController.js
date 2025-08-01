import { v4 as uuid } from 'uuid';
import user from '../models/user.js';

export const loginUser = async (req, res) => {
  const { nickname } = req.body;

  try {
    let currentUser = await user.findOne({nickname});
    if (!currentUser) {
      currentUser = await user.create({ nickname });
    }
    res.json(currentUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Entrance error' });
  }
};
