const nodemailer = require('nodemailer');
const { MailtrapTransport } = require('mailtrap');

const getMailerTransport = () => {
  const mailtrapToken = process.env.MAILTRAP_TOKEN;
  if (mailtrapToken) {
    return nodemailer.createTransport(
      MailtrapTransport({
        token: mailtrapToken,
      })
    );
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

const sendPasswordResetOtpEmail = async (email, otpCode) => {
  const transport = getMailerTransport();
  if (!transport) {
    throw new Error('Mail transport is not configured on the server');
  }

  const sender = process.env.MAILTRAP_SENDER_ADDRESS
    ? {
        address: process.env.MAILTRAP_SENDER_ADDRESS,
        name: process.env.MAILTRAP_SENDER_NAME || 'File Uploader',
      }
    : process.env.SMTP_FROM || process.env.SMTP_USER;

  await transport.sendMail({
    from: sender,
    to: email,
    subject: 'Your File Uploader password reset code',
    text: `Your OTP code is ${otpCode}. It expires in 10 minutes.`,
    html: `<p>Your OTP code is <strong>${otpCode}</strong>.</p><p>It expires in 10 minutes.</p>`,
    category: 'Password Reset OTP',
  });
};

module.exports = {
  sendPasswordResetOtpEmail,
};
