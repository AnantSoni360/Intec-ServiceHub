const nodemailer = require('nodemailer');

// Ethereal Email config for testing
// In production, replace with real SMTP credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'intec.servicehub@ethereal.email', // Replace with real generated ethereal account if needed, or we can auto-generate
    pass: 'password123'
  }
});

// We should auto-generate an ethereal account on startup for easier testing
let testAccount = null;

async function initTestAccount() {
  if (!testAccount && process.env.NODE_ENV !== 'production') {
    try {
      testAccount = await nodemailer.createTestAccount();
      transporter.options.auth = {
        user: testAccount.user,
        pass: testAccount.pass
      };
      console.log('Ethereal Email initialized:', testAccount.user);
    } catch (err) {
      console.error('Failed to create Ethereal test account', err);
    }
  }
}

initTestAccount();

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: '"Intec ServiceHub" <no-reply@intec.com>',
      to,
      subject,
      html
    });

    console.log('Message sent: %s', info.messageId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
  }
};

module.exports = { sendEmail };
