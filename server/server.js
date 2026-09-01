import "dotenv/config";
import app from "./src/app.js";
import { testConnection } from "./src/config/db.js";

const PORT = process.env.PORT || 2000;

async function start() {
  try {
    await testConnection();
    console.log("Database connected.");
  } catch (err) {
    console.error("Failed to connect to database:", err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();