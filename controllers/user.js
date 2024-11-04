const User = require('../models/user');

exports.read = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }

    user.hashed_password = undefined;
    user.salt = undefined;

    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    return res.status(500).json({
      error: 'An error occurred while retrieving the user.',
    });
  }
};

exports.update = (req, res) => {
    console.log('UPDATE USER - req.user ', req.user);
    console.log('UPDATE DATA - req.body ', req.body);
};