const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1- create transporter (service that will send the email, "gmail","yahoo","Mailgun","Sendgrid")
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    console.log("process.env.SMTP_FROM_EMAIL", process.env.SMTP_FROM_EMAIL);
    // 2- Define email options (like from,to,subject,email content)

    const emailOptions = {
        from: process.env.SMTP_FROM_EMAIL,
        to: options.email,
        subject: options.subject,
        text: options.message
    };
    // 3- Actually send the email

    await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;