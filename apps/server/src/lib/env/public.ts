const mailFrom = process.env.MAIL_FROM;
if (!mailFrom) {
  throw new Error("MAIL_FROM not defined");
}
export const MAIL_FROM = mailFrom;
