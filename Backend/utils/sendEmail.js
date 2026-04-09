import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,     // your email
        pass: process.env.EMAIL_PASS,     // app password
      },
    });

    const mailOptions = {
      from: `"Virtual Studio" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);
    return true;

  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};

export default sendEmail;