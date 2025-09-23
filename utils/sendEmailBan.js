// import nodemailer from "nodemailer";

// const sendEmailBan = async (to, userId) => {
//  try {
//      const transporter = nodemailer.createTransport({
//        host: "smtp-relay.brevo.com",
//        port: 587,
//        secure: false,
//        auth: {
//          user: process.env.EMAIL_USER,
//          pass: process.env.EMAIL_PASS,
//        },
//      });

//     const htmlContent = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; background-color: #f9f9f9;">
//         <h2 style="color: #d9534f;">🚫 Account Banned</h2>
//         <p>Dear User,</p>
//         <p>Your account has been <b style="color: red;">banned</b> by the administrator.</p>
//         <p><b>User ID:</b> ${userId}</p>
//         <p><b>Email:</b> ${to}</p>
//         <hr />
//         <p>If you believe this is a mistake, please contact support.</p>
//         <p>– The Winz Team</p>
//       </div>
//     `;

//     const mailOptions = {
//       from: `"Winz" <${process.env.SENDER_EMAIL}>`,
//       to,
//       subject: "🚫 Your Winz Account Has Been Banned",
//       html: htmlContent,
//       replyTo: "support@winz.com",
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Ban email sent:", info.response);
//   } catch (error) {
//     console.error("❌ Error sending ban email:", error);
//     throw new Error("Failed to send ban email");
//   }
// };

// export default sendEmailBan;

import SibApiV3Sdk from "sib-api-v3-sdk";

const sendEmailBan = async (to, userId) => {
  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

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

    const sendSmtpEmail = {
      sender: { email: process.env.SENDER_EMAIL, name: "Winz" },
      to: [{ email: to }],
      subject: "🚫 Your Winz Account Has Been Banned",
      htmlContent,
    };

    const response = await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Ban email sent via API:", response);
  } catch (error) {
    console.error("❌ Error sending ban email via API:", error);
    throw new Error("Failed to send ban email");
  }
};

export default sendEmailBan;

