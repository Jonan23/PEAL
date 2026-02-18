import { config } from "../config/env.js";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailService {
  send(options: EmailOptions): Promise<boolean>;
}

export class ConsoleEmailService implements EmailService {
  async send(options: EmailOptions): Promise<boolean> {
    console.log("=== EMAIL ===");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.html}`);
    console.log("============");
    return true;
  }
}

export class ResendEmailService implements EmailService {
  private apiKey: string;
  private from: string;

  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || "";
    this.from = process.env.EMAIL_FROM || "noreply@peal.app";
  }

  async send(options: EmailOptions): Promise<boolean> {
    if (!this.apiKey) {
      console.warn("Resend API key not configured, logging email instead");
      return new ConsoleEmailService().send(options);
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.from,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Resend error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Email send error:", error);
      return false;
    }
  }
}

export function getEmailService(): EmailService {
  const provider = process.env.EMAIL_PROVIDER || "console";

  switch (provider) {
    case "resend":
      return new ResendEmailService();
    default:
      return new ConsoleEmailService();
  }
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
): Promise<boolean> {
  const emailService = getEmailService();

  return emailService.send({
    to: email,
    subject: "Welcome to PEAL - Pride, Empowerment And Love",
    html: `
      <h1>Welcome to PEAL, ${name}!</h1>
      <p>Thank you for joining our community of empowerment and support.</p>
      <p>At PEAL, we believe in the power of women supporting women. You're now part of a community that celebrates Pride, Empowerment, And Love.</p>
      <p>Get started by:</p>
      <ul>
        <li>Creating your profile</li>
        <li>Sharing your story</li>
        <li>Connecting with mentors</li>
        <li>Exploring funding opportunities</li>
      </ul>
      <p>If you have any questions, don't hesitate to reach out.</p>
      <p>With love and empowerment,</p>
      <p>The PEAL Team</p>
    `,
    text: `Welcome to PEAL, ${name}! Thank you for joining our community...`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
): Promise<boolean> {
  const emailService = getEmailService();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  return emailService.send({
    to: email,
    subject: "Reset your PEAL password",
    html: `
      <h1>Reset Your Password</h1>
      <p>You requested a password reset. Click the button below to create a new password:</p>
      <a href="${resetUrl}" style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    text: `Reset your password at: ${resetUrl}`,
  });
}

export async function sendDonationNotification(
  recipientEmail: string,
  recipientName: string,
  donorName: string,
  amount: number,
  requestTitle: string,
): Promise<boolean> {
  const emailService = getEmailService();

  return emailService.send({
    to: recipientEmail,
    subject: `You received a donation of $${amount}!`,
    html: `
      <h1>New Donation!</h1>
      <p>Hi ${recipientName},</p>
      <p>Great news! ${donorName} donated $${amount} to your funding request "${requestTitle}".</p>
      <p>Keep up the amazing work!</p>
      <p>With love,</p>
      <p>The PEAL Team</p>
    `,
    text: `You received a donation of $${amount} from ${donorName}!`,
  });
}
