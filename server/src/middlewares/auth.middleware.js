import ApiError from "../utils/ApiError.js";
import { verifyToken } from "../utils/jwt.js";
import { pool } from "../config/db.js";

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw ApiError.unauthorized("Missing token!");
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw ApiError.unauthorized("Invalid or expired token");
    }

    const [rows] = await pool.query(
      "SELECT user_id, username, f_name, l_name, email, role, status FROM mst_users WHERE user_id = ?",
      [payload.user_id]
    );
    const user = rows[0];

    if (!user || user.status !== "A") {
      throw ApiError.unauthorized("User not found or inactive");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have access to this resource"));
    }
    next();
  };
}

export { authenticate, authorize };