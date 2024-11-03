const jwt = require('jsonwebtoken');
const User = require('../models/user');
const sgMail  = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.signup = async (req, res) => {
  const {name, email, password} = req.body;

  const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
        return res.status(400).json({
                error: 'Email is taken'
            });
    }

    const token = jwt.sign({name, email, password}, process.env.JWT_ACCOUNT_ACTIVATION, {expiresIn: '10m'});

    const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Account activation link`,
        html: `
        <p>Hello ${name}, Please use the following link to activate your NUConnect Account: </p>
        <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
        <hr />
        <p>This email may contain sensitive information, DONT Share it</p>
        <p>${process.env.CLIENT_URL}</p>
        `
    }

    sgMail.send(emailData).then(sent => {
        // console.log('SIGNUP EMAIL SENT: ', sent);
        return res.json({
            message: `Email has been sent to ${email}. Follow the instruction to activate your account.`
        });
    })
    .catch(err => {
        // console.log('SIGNUP EMAIL SENT: ', err);
        return res.json({
            message: err.message
        });
    });
};
