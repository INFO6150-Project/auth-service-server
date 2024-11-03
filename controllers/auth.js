const User = require('../models/user');


exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user with the provided email already exists
        const existingUser = await User.findOne({ email }).exec();
        if (existingUser) {
            return res.status(400).json({
                error: 'Email is taken'
            });
        }

        // Create new user instance
        let newUser = new User({ name, email, password });

        // Save new user
        await newUser.save();
        res.json({
            message: 'Signup Success! Please signin.'
        });
    } catch (err) {
        console.log('Signup Error: ', err);
        return res.status(400).json({
            error: 'An error occurred during signup.'
        });
    }
};
