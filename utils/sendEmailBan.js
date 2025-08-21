import nodemailer from "nodemailer";

const sendEmailBan = async (to, userId) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #d9534f;">🚫 Account Banned</h2>
        <p>Dear User,</p>
        <p>Your account has been <b style="color: red;">banned</b> by the administrator.</p>
        <p><b>User ID:</b> ${userId}</p>
        <p><b>Email:</b> ${to}</p>
        <hr />
        <p>If you believe this is a mistake, please contact support.</p>
        <p>– The Winz Team</p>
      </div>
    `;

    const mailOptions = {
      from: `"Winz" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🚫 Your Winz Account Has Been Banned",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Ban email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending ban email:", error);
    throw new Error("Failed to send ban email");
  }
};

export default sendEmailBan;
