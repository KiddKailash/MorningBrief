import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  createNewsletterHTML,
  formatContentForEmail,
} from "../branding/emailTemplate";
import { brand } from "../branding/brand";

// Load environment variables from .env file
dotenv.config();

export const sendNewsletter = async (
  newsletterContent: string
): Promise<void> => {
  // Create branded subject line
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const subject = `${brand.name} - ${today} | ${brand.tagline}`;
  const previewText = `${brand.subtitle} - ${today}'s edition`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env["GMAIL_ADDRESS"],
      pass: process.env["GMAIL_APP_PASS"],
    },
  });

  // Get subscriber list from environment variable (comma-separated emails)
  const subscribers =
    process.env["SUBSCRIBERS_EMAIL"]?.split(",").map((email) => email.trim()) ||
    [];

  if (subscribers.length === 0) {
    console.error(
      "No subscribers found. Please set SUBSCRIBERS_EMAIL environment variable."
    );
    return;
  }

  // Convert plain text content to HTML and apply branding
  const formattedContent = formatContentForEmail(newsletterContent);

  // Create branded HTML email
  const htmlContent = createNewsletterHTML({
    subject,
    content: formattedContent,
    previewText,
  });

  const mailOptions = {
    from: `"${brand.name}" <${process.env["GMAIL_ADDRESS"]}>`,
    to: subscribers,
    subject: subject,
    html: htmlContent,
    // Also include plain text version
    text: newsletterContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Newsletter sent successfully to ${subscribers.length} subscriber(s)`
    );
    console.log("Message ID:", info.messageId);
    console.log("Recipients:", subscribers.join(", "));
  } catch (error) {
    console.error("Error sending newsletter:", error);
    throw error;
  }
};
