import nodemailer from 'nodemailer';
import { envVars } from '../../config/env';
import AppError from '../ErrorHelpers/AppError';
import path from 'node:path';
import ejs from 'ejs';
import SMTPTransport from 'nodemailer/lib/smtp-transport'; 


const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
    secure: true,
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASS,
    },
} as SMTPTransport.Options); 

interface EmailData {
    to: string;
    subject: string;
    template: string;
    data: Record<string, any>;
    attachment?: {
        filename: string;
        content: any;
        contentType?: string;
    }[]
}

export const sendEmail = async ({ to, subject, template, data,  attachment }: EmailData) => {
    try {
       
        const templatePath = path.resolve(process.cwd(), `src/app/templates/${template}.ejs`);

        
        const html = await ejs.renderFile(templatePath, data);
      
        const info = await transporter.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to: to,
            subject: subject,
            html: html,
          
            attachments: attachment?.map((item) => ({
                    filename: item.filename,
                    content: item.content,
                    contentType: item.contentType,
            }))
        });

        return info; 

    } catch (error) {
        console.log("Error sending email", error);
        throw new AppError(500, "Error sending email");
    }
}