const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER || 'intec.servicehub@ethereal.email',
    pass: process.env.SMTP_PASS || 'password123'
  }
});

let testAccount = null;

async function initTestAccount() {
  if (!process.env.SMTP_HOST && process.env.NODE_ENV !== 'production') {
    try {
      if (!testAccount) {
        testAccount = await nodemailer.createTestAccount();
        transporter.options.auth = {
          user: testAccount.user,
          pass: testAccount.pass
        };
        console.log('Ethereal Email initialized:', testAccount.user);
      }
    } catch (err) {
      console.error('Failed to create Ethereal test account', err);
    }
  } else if (!process.env.SMTP_HOST && process.env.NODE_ENV === 'production') {
    console.warn('WARNING: No SMTP_HOST defined in production. Emails will fail.');
  }
}

initTestAccount();

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Intec ServiceHub" <no-reply@intec.com>',
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
