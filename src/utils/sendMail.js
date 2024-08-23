import nodemailer from 'nodemailer';
import { SMTP } from '../constants/index.js';
import { env } from '../utils/env.js';

const transporter = nodemailer.createTransport({
  host: SMTP.SMTP_HOST,
  port: Number(SMTP.SMTP_PORT),
  secure: false,
  auth: {
    user: SMTP.SMTP_USER,
    pass: SMTP.SMTP_PASSWORD,
  },
});

export function sendEmail(options) {
  return transporter.sendMail(options);
}
