const fs = require("fs");
const path = require("path");
const envFilePath = path.resolve(__dirname, "../", ".env.local");

// Check if the .env file already exists
if (fs.existsSync(envFilePath)) {
  console.log(".env already exists. Skipping generation.");
  process.exit(0);
}

// Create .env file with key-value pairs
const envData = `
NEXT_PUBLIC_API_URL=http://localhost:4000
`;

fs.writeFileSync(envFilePath, envData);

console.log(".env file generated successfully.");