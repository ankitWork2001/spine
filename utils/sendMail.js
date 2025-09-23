// import nodemailer from "nodemailer";

// const sendEmail = async (to, subject, otp) => {
//   console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
//   try {
//     const transporter = nodemailer.createTransport({
//       host: "smtp-relay.brevo.com",
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
      
//     });

//     const htmlContent = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; background-color: #f9f9f9;">
//         <h2>Hello from <span style="color:#007BFF;">Winz</span> 👋</h2>
//         <p>Use the following OTP to proceed:</p>
//         <h1 style="color:#007BFF;">${otp}</h1>
//         <p>This OTP will expire in 10 minutes.</p>
//       </div>
//     `;

//     const mailOptions = {
//       from: `"Winz" <${process.env.SENDER_EMAIL}>`,
//       to,
//       subject,
//       text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
//       html: htmlContent,
//       replyTo: "support@winz.com",
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent:", info.response);
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
//     throw new Error("Failed to send email");
//   }
// };

// export default sendEmail;


import SibApiV3Sdk from "sib-api-v3-sdk";


const sendEmail = async (to, subject, otp) => {
  // if (!process.env.BREVO_API_KEY) {
  //   throw new Error("BREVO_API_KEY is not set in environment variables");
  // }

  try {
    // Setup Brevo client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    // Email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; background-color: #f9f9f9;">
        <h2>Hello from <span style="color:#007BFF;">Winz</span> 👋</h2>
        <p>Use the following OTP to proceed:</p>
        <h1 style="color:#007BFF;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    `;

    // Mail options
    const sendSmtpEmail = {
      sender: { email: process.env.SENDER_EMAIL, name: "Winz" },
      to: [{ email: to }],
      subject,
      textContent: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      htmlContent,
    };

    const response = await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send email via Brevo API");
  }
};

export default sendEmail;



// import nodemailer from "nodemailer";

// const sendEmail = async (to, subject, otp) => {

//   console.log("EMAIL_USER:", process.env.EMAIL_USER);
//   console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
//   console.log("EMAIL_PASS exists?", !!process.env.EMAIL_PASS);

//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const htmlContent = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; background-color: #f9f9f9;">
//         <h2 style="color: #333;">Hello from <span style="color:#007BFF;">Winz</span> 👋</h2>
//         <p style="font-size: 16px;">Use the following OTP to proceed:</p>
//         <h1 style="color: #007BFF; font-size: 32px;">${otp}</h1>
//         <p style="font-size: 14px; color: #555;">This OTP will expire in 10 minutes.</p>
//         <hr style="margin: 20px 0;">
//         <p style="font-size: 14px;">If you did not request this, please ignore this email.</p>
//         <p style="font-size: 14px;">– The Winz Team</p>
//       </div>
//     `;

//     const mailOptions = {
//       from: `"Winz" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
//       html: htmlContent,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent:", info.response);
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
//     throw new Error("Failed to send email");
//   }
// };

// export default sendEmail;
