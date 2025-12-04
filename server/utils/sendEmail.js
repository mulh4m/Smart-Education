require("dotenv").config();
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const sendMail = async (options) => {
  try {
    // Use environment variables directly
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const { email, subject, template, data } = options;

    // Fix the template path
    const emailTemplate = path.join(__dirname, "../emails", `${template}.ejs`);

    // Check if template file exists
    const fs = require("fs");
    if (!fs.existsSync(emailTemplate)) {
      throw new Error(`Email template not found: ${emailTemplate}`);
    }

    const html = await ejs.renderFile(emailTemplate, data);

    // Use the provided email
    const recipientEmails = Array.isArray(email) ? email : [email];

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: recipientEmails.join(", "),
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);

    return result;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

module.exports = { sendMail };
