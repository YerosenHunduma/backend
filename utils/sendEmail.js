import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.TP_SMTP_HOST,
    port: process.env.TP_SMTP_PORT,
    auth: {
      user: process.env.TP_SMTP_EMAIL,
      pass: process.env.TP_SMTP_PASSWORD,
    },
  });
  console.log(options);
  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transport.sendMail(message);
};

export default sendEmail;
