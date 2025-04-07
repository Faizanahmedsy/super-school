import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as path from "path";

@Injectable()
export class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async sendMail(options: { email: string; subject: string; template: string; context: any; text: string; html: string }) {
        try {
            const attachments = options.context.attachment || [];

            // Map the attachments to Nodemailer-compatible format if necessary
            const formattedAttachments = attachments.map((attachment: string | { path: string }, index: number) => {
                return {
                    path: attachment, // If the attachment is a URL or file path
                };
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: options.email,
                subject: options.subject,
                template: options.template,
                context: options.context,
                text: options.text,
                html: options.html,
                attachments: formattedAttachments,
            };

            const info = await this.transporter.sendMail(mailOptions);

            return info;
        } catch (error) {
            console.error("Error in sendMail:", error);
            throw error;
        }
    }
}
