const jwt = require('jsonwebtoken');
const User = require('../models/user');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return res.status(400).json({ error: 'Email is taken' });
    }

    // Create JWT token for account activation
    const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });

    // Set up email data
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Account activation link',
      html: `
        <p>Hello ${name}, Please use the following link to activate your NUConnect Account: </p>
        <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
        <hr />
        <p>This email may contain sensitive information. Do not share it.</p>
        <p>${process.env.CLIENT_URL}</p>
      `,
    };

    // Send activation email
    await sgMail.send(emailData);
    res.json({
      message: `Email has been sent to ${email}. Follow the instructions to activate your account.`,
    });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({
      error: 'An error occurred during signup. Please try again later.',
    });
  }
};

exports.accountActivation = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Something went wrong. Try again.' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION);
    const { name, email, password } = decoded;

    // Create new user and save to the database
    const user = new User({ name, email, password });
    await user.save();

    res.json({
      message: 'Signup success. Please sign in',
    });
  } catch (err) {
    console.error('Account Activation Error:', err);
    res.status(401).json({
      error: err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError' 
        ? 'Expired or invalid link. Please sign up again.'
        : 'An error occurred during account activation. Please try again.',
    });
  }
};

exports.signin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if user exists
      const user = await User.findOne({ email }).exec();
      if (!user) {
        return res.status(400).json({
          error: 'User with that email does not exist. Please signup.',
        });
      }
  
      // Authenticate user
      if (!user.authenticate(password)) {
        return res.status(400).json({
          error: 'Email and password do not match.',
        });
      }
  
      // Generate token and send to client
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const { _id, name, role } = user;
  
      return res.json({
        token,
        user: { _id, name, email, role },
      });
    } catch (err) {
      console.error('Signin Error:', err);
      return res.status(500).json({
        error: 'An error occurred during sign-in. Please try again later.',
      });
    }
  };
