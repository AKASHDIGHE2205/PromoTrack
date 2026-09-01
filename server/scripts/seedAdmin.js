import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool } from "../src/config/db";

async function run() {
  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const email = process.env.SEED_ADMIN_EMAIL || "admin@salespromoter.local";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

  const [existing] = await pool.query(
    "SELECT user_id FROM mst_users WHERE username = ? OR email = ?",
    [username, email]
  );

  if (existing[0]) {
    console.log("Admin user already exists, skipping.");
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO mst_users
      (username, password, f_name, l_name, phone, email, role, fwd, status, c_at, u_at)
     VALUES (?, ?, 'System', 'Admin', '9999999999', ?, 'ADMIN', CURDATE(), 'A', NOW(), NOW())`,
    [username, hash, email]
  );

  console.log(`Admin user created: username=${username} password=${password}`);
  console.log("Please log in and change this password immediately.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
