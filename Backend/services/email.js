const nodemailer = require('nodemailer');


async function createTransporter() {
  const gmailUser = process.env.GOOGLE_GMAIL_USER || process.env.EMAIL_USER;
  const gmailPass = process.env.GOOGLE_GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

  // 1) Gmail
  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: gmailUser, pass: gmailPass }
    });
  }

  // 2) Generic SMTP
  if (process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
  }

  // 3) Ethereal fallback
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });

  transporter.__isEthereal = true;
  return transporter;
}


async function sendContactEmails({ name, email, subject, message, inquiryType = 'general', createdAt = new Date() }) {
  const transporter = await createTransporter();

  const from = process.env.EMAIL_FROM || process.env.GOOGLE_GMAIL_USER || process.env.EMAIL_USER || 'no-reply@edulearn.local';
  const adminTo = process.env.CONTACT_ADMIN_EMAIL || 'admin@edulearn.local';

  const adminMail = {
    from,
    to: adminTo,
    subject: `New Contact: ${subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${(message || '').replace(/\n/g, '<br/>')}</p>
      <p style="color:#888"><em>Submitted: ${new Date(createdAt).toLocaleString()}</em></p>
    `
  };

  const userMail = {
    from,
    to: email,
    subject: 'We received your message – EduLearn Support',
    html: `
      <h3>Hi ${name || 'there'},</h3>
      <p>Thanks for contacting EduLearn. We’ve received your message and will get back to you within 24 hours.</p>
      <p><strong>Your subject:</strong> ${subject}</p>
      <p><strong>Your message:</strong></p>
      <p>${(message || '').replace(/\n/g, '<br/>')}</p>
      <p>Regards,<br/>EduLearn Team</p>
    `
  };

  const adminInfo = await transporter.sendMail(adminMail);
  const userInfo = await transporter.sendMail(userMail);

  const meta = {};
  if (transporter.__isEthereal) {
    meta.adminPreview = nodemailer.getTestMessageUrl(adminInfo);
    meta.userPreview = nodemailer.getTestMessageUrl(userInfo);
    console.log('[Email][Ethereal] Admin preview URL:', meta.adminPreview);
    console.log('[Email][Ethereal] User preview URL:', meta.userPreview);
  }

  return { ok: true, adminMessageId: adminInfo.messageId, userMessageId: userInfo.messageId, ...meta };
}

module.exports = { sendContactEmails };


