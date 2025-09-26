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
