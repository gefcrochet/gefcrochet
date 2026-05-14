import nodemailer from "nodemailer"

// Create a transporter. For development, if no SMTP is provided, 
// we will just log the email to the console.
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const isSmtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER)

  if (!isSmtpConfigured) {
    console.log("\n=============================================")
    console.log(`[EMAIL MOCK] To: ${to}`)
    console.log(`[EMAIL MOCK] Subject: ${subject}`)
    console.log(`[EMAIL MOCK] Body:\n${html}`)
    console.log("=============================================\n")
    return
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: `"GeF Crochet" <${process.env.SMTP_FROM || "no-reply@gefcrochet.it"}>`,
    to,
    subject,
    html,
  })
}
