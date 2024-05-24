const fs = require("fs");
const path = require("path");

const envFilePath = path.resolve(__dirname, "../", ".env");

const start = async () => {
  // Create .env file with key-value pairs
  if (!fs.existsSync(envFilePath)) {
    try {
      const envData = `
  PORT=4000
  DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
  MAIL_FROM=support@rizo.me
  MAIL_HOST=smtp.sendgrid.net
  MAIL_USER=apikey
  SENDGRID_API_KEY=
  APP_URL=http://localhost:3000
  ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
  THUMBNAIL_SIZE=200
  `;

      fs.writeFileSync(envFilePath, envData);
      console.log(".env file generated successfully.");
    } catch (err) {
      console.error(err);
    }
  } else {
    console.log(".env already exists. Skipping generation.");
  }
};

start();
