import env from "@/lib/env";
import nodemailer, { Transporter } from "nodemailer";

const transporter: Transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: env.emailCredentials.user,
        pass: env.emailCredentials.pass,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

interface SendVerificationCodeParams {
    email: string;
    verificationCode: string;
    type: "registration" | "forgotPassword";
}

const createMailOptions = ({
    email,
    verificationCode,
    type,
}: SendVerificationCodeParams): nodemailer.SendMailOptions => {
    const commonOptions = {
        from: env.emailCredentials.user,
        to: email,
    };

    const createTemplate = () => `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .email-header {
                    background-color: #D9001B;
                    color: white;
                    text-align: center;
                    padding: 20px;
                }
                .email-header img {
                    max-width: 150px;
                    margin-bottom: 10px;
                }
                .email-body {
                    padding: 30px;
                    background-color: #ffffff;
                }
                .verification-code {
                    background-color: #f9f9f9;
                    border: 2px solid #D9001B;
                    color: #000000;
                    text-align: center;
                    padding: 20px;
                    font-size: 28px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    margin: 25px 0;
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .email-footer {
                    background-color: #000000;
                    color: #ffffff;
                    text-align: center;
                    padding: 15px;
                    font-size: 12px;
                }
                .social-links {
                    margin: 20px 0;
                }
                .social-links a {
                    color: #ffffff;
                    text-decoration: none;
                    margin: 0 10px;
                    display: inline-block;
                }
                .social-links img {
                    width: 24px;
                    height: 24px;
                    vertical-align: middle;
                }
                .email-footer a {
                    color: #D9001B;
                    text-decoration: none;
                }
                .disclaimer {
                    color: #666;
                    font-size: 10px;
                    margin-top: 15px;
                }
                .contact-info {
                    margin-top: 15px;
                    color: #ffffff;
                }

 
  .white-text {
    color: white;
  }

            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>${type === 'registration' ? 'Account Verification' : 'Password Reset'}</h1>
                </div>
                <div class="email-body">
                    <h2 style="color: #D9001B;">
                        ${type === 'registration' ? 'Verification Required' : 'Password Reset Requested'}
                    </h2>
                    <p>Dear User,</p>
                    <p>${type === 'registration'
            ? 'To ensure the security of your Classify-X account, please use the following verification code:'
            : 'You requested to reset your password. Please use the following verification code to reset it:'}</p>
                    
                    <div class="verification-code">
                        ${verificationCode}
                    </div>
                    
                    <p>This code will expire in ${type === 'registration' ? '15' : '5'} minutes. 
                    If you did not initiate this request, please contact our support team immediately.</p>
                </div>
                   <div class="email-footer">
                    <div class="social-links">
                        <a href="https://www.facebook.com/profile.php?id=61565936520622" target="_blank">
                            <img src="https://cdn4.iconfinder.com/data/icons/social-media-icons-the-circle-set/48/facebook_circle-512.png" alt="Facebook">
                        </a>
                        <a href="https://x.com/ZeroOneCreation" target="_blank">
                            <img src="https://cdn4.iconfinder.com/data/icons/social-media-icons-the-circle-set/48/twitter_circle-512.png" alt="X (Twitter)">
                        </a>
                        <a href="https://www.instagram.com/zeroonecreation/" target="_blank">
                            <img src="https://cdn4.iconfinder.com/data/icons/social-media-icons-the-circle-set/48/instagram_circle-512.png" alt="Instagram">
                        </a>
                        <a href="https://www.linkedin.com/company/zero-one-creation/" target="_blank">
                            <img src="https://cdn4.iconfinder.com/data/icons/social-media-icons-the-circle-set/48/linkedin_circle-512.png" alt="LinkedIn">
                        </a>
                        <a href="https://www.youtube.com/channel/UC4UMAteWA9MC_8A-lPj07Ug" target="_blank">
                            <img src="https://cdn4.iconfinder.com/data/icons/social-media-icons-the-circle-set/48/youtube_circle-512.png" alt="YouTube">
                        </a>
                    </div>
                    <div class="contact-info">
                        <p>Contact Us: contact@admin.zeroonecreation.com</p>
                        <p>Website: www.zeroonecreation.com</p>
                    </div>

                   <p class="white-text">© ${new Date().getFullYear()} Classify-X. All Rights Reserved.</p>
<p>For <span class="white-text">assistance</span>, visit <a href="www.zeroonecreation.com/contact">Classify-X Support</a></p>
                    
                    <div class="disclaimer">
                        This is an automated message. Please do not reply to this email.
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return {
        ...commonOptions,
        subject: type === 'registration' ? '🔑 Your Verification Code' : '🔑 Reset Your Password',
        html: createTemplate(),
    };
};

const sendVerificationCode = async ({
    email,
    verificationCode,
    type,
}: SendVerificationCodeParams): Promise<void> => {
    if (!isValidEmail(email)) {
        throw new Error("Invalid email address");
    }

    const mailOptions = createMailOptions({ email, verificationCode, type });

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(
            `Verification code email sent to ${email}: ${info.response}`,
        );
    } catch (error) {
        console.error("Error sending email: ", error);
        throw error;
    }
};

// Simple email validation
const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export { sendVerificationCode };