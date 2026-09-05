import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password required",
      });
    }

    // Find user
    const [rows] = await pool.query(
      `SELECT
                user_id,
                username,
                password,
                f_name,
                m_name,
                l_name,
                phone,
                email,
                role,
                status
             FROM mst_users
             WHERE email = ? OR phone = ?`,
      [email, email],
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User Not Found.",
      });
    }

    const user = rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid  Password.",
      });
    }

    // Check status
    if (user.status !== "A") {
      return res.status(403).json({
        success: false,
        message: "Your account has been temporarily deactivated.",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        email: user.email,
        firstName: user.f_name,
        middleName: user.m_name || null,
        lastName: user.l_name,
        status: user.status,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        user_id,
        f_name,
        m_name,
        l_name,
        phone AS mobile,
        email,
        role,
        status,
        c_at AS created_at
       FROM mst_users
       WHERE user_id = ?`,
      [req.user.user_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get My Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile.",
    });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { f_name, m_name, l_name, mobile } = req.body;

    if (!f_name || !l_name) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required.",
      });
    }

    await pool.query(
      `UPDATE mst_users
       SET f_name = ?, m_name = ?, l_name = ?, phone = ?, u_by = ?, u_at = NOW()
       WHERE user_id = ?`,
      [
        f_name,
        m_name || null,
        l_name,
        mobile || null,
        req.user.user_id,
        req.user.user_id,
      ],
    );

    const [rows] = await pool.query(
      `SELECT
        user_id,
        f_name,
        m_name,
        l_name,
        phone AS mobile,
        email,
        role,
        status,
        c_at AS created_at
       FROM mst_users
       WHERE user_id = ?`,
      [req.user.user_id],
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: rows[0],
    });
  } catch (error) {
    console.error("Update My Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating profile.",
    });
  }
};

export const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    const [rows] = await pool.query(
      `SELECT password FROM mst_users WHERE user_id = ?`,
      [req.user.user_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE mst_users SET password = ?, u_by = ?, u_at = NOW() WHERE user_id = ?`,
      [hashedPassword, req.user.user_id, req.user.user_id],
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change My Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while changing password.",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const offset = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    // ----------------------------------
    // Search condition
    // ----------------------------------
    const searchClause = search
      ? `WHERE
          u.f_name LIKE ?
          OR u.l_name LIKE ?
          OR u.email LIKE ?
          OR u.phone LIKE ?
          OR u.username LIKE ?
          OR b.account_no LIKE ?
          OR b.bank_name LIKE ?
          OR b.ifsc_code LIKE ?`
      : "";

    const searchParams = search ? Array(8).fill(`%${search}%`) : [];

    // ----------------------------------
    // Get users + bank + salary
    // ----------------------------------
    const [rows] = await pool.query(
      `SELECT
        u.user_id,
        u.username,
        u.f_name,
        u.m_name,
        u.l_name,
        u.phone,
        u.email,
        u.address,
        u.town,
        u.district,
        u.pin_code,
        u.distributor,
        u.asm,
        u.rsm,
        u.fwd,
        u.role,
        u.status,
        u.c_at,

        b.bank_id,
        b.account_no,
        b.bank_name,
        b.branch,
        b.ifsc_code,
        b.status AS bank_status,

        s.salary_id,
        s.wef,
        s.basic_salary,
        s.incentive,
        s.allowance,
        s.gratuity,
        s.variable,
        s.status AS salary_status

       FROM mst_users u

       LEFT JOIN bank_info b
         ON u.user_id = b.user_id

       LEFT JOIN salary_structure s
         ON s.salary_id = (
           SELECT ss.salary_id
           FROM salary_structure ss
           WHERE ss.user_id = u.user_id
           ORDER BY ss.wef DESC, ss.salary_id DESC
           LIMIT 1
         )

       ${searchClause}
       ORDER BY u.user_id ASC
       LIMIT ? OFFSET ?
       `,
      [...searchParams, limit, offset],
    );

    // ----------------------------------
    // Count total users
    // ----------------------------------
    const [countRows] = await pool.query(
      `SELECT COUNT(DISTINCT u.user_id) AS total
       FROM mst_users u

       LEFT JOIN bank_info b
         ON u.user_id = b.user_id

       ${searchClause}`,
      searchParams,
    );

    const total = countRows[0].total;

    return res.status(200).json({
      success: true,
      users: rows,
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error("Get Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching users.",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT
        u.user_id,
        u.username,
        u.f_name,
        u.m_name,
        u.l_name,
        u.phone,
        u.email,
        u.address,
        u.town,
        u.district,
        u.pin_code,
        u.distributor,
        u.asm,
        u.rsm,
        u.fwd,
        u.role,
        u.status,

        b.bank_id,
        b.account_no,
        b.bank_name,
        b.branch,
        b.ifsc_code,
        b.status AS bank_status,

        s.salary_id,
        s.wef,
        s.basic_salary,
        s.incentive,
        s.allowance,
        s.gratuity,
        s.variable,
        s.status AS salary_status

       FROM mst_users u

       LEFT JOIN bank_info b
         ON b.user_id = u.user_id

       LEFT JOIN salary_structure s
         ON s.salary_id = (
           SELECT ss.salary_id
           FROM salary_structure ss
           WHERE ss.user_id = u.user_id
           ORDER BY ss.wef DESC, ss.salary_id DESC
           LIMIT 1
         )

       WHERE u.user_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    console.error("Get User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching user.",
    });
  }
};

export const addUser = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { f_name, m_name, l_name, phone, email, address, town, district, pin_code, distributor, asm, rsm, fwd, status, role, accNo, bankName, branch, ifsc, wef, basic_salary, incentive, allowance, gratuity, variable, } = req.body;

    if (!f_name || !l_name || !phone || !email || !fwd) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, phone, email and Join date are required.",
      });
    }

    await connection.beginTransaction();

    const [existingUsers] = await connection.query(
      `SELECT user_id, email, phone
       FROM mst_users
       WHERE email = ? OR phone = ?
       LIMIT 1`,
      [email, phone],
    );

    if (existingUsers.length > 0) {
      await connection.rollback();

      const existingUser = existingUsers[0];

      if (existingUser.email === email) {
        return res.status(409).json({
          success: false,
          message: "Email already exists.",
        });
      }

      if (existingUser.phone === phone) {
        return res.status(409).json({
          success: false,
          message: "Phone number already exists.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Email or phone already exists.",
      });
    }

    const [maxUserRows] = await connection.query(
      `SELECT COALESCE(MAX(user_id), 0) + 1 AS next_user_id
       FROM mst_users
       FOR UPDATE`,
    );

    const user_id = maxUserRows[0].next_user_id;

    const hashedPassword = await bcrypt.hash("Malpani@1234", 10);
    const createdBy = req.user?.user_id || null;
    const userStatus = status || "A";
    const userRole = role || "SP";

    await connection.query(
      `INSERT INTO mst_users (
        user_id,
        username,
        password,
        f_name,
        m_name,
        l_name,
        phone,
        email,
        address,
        town,
        district,
        pin_code,
        distributor,
        asm,
        rsm,
        fwd,
        role,
        status,
        c_by,
        c_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user_id,
        email,
        hashedPassword,
        f_name,
        m_name || null,
        l_name,
        phone,
        email,
        address || null,
        town || null,
        district || null,
        pin_code || null,
        distributor || null,
        asm || null,
        rsm || null,
        fwd,
        userRole,
        userStatus,
        createdBy,
      ],
    );

    if (accNo || bankName || branch || ifsc) {
      if (!accNo || !bankName || !branch || !ifsc) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message:
            "Account number, bank name, branch and IFSC are required when bank details are provided.",
        });
      }

      const [maxBankRows] = await connection.query(
        `SELECT COALESCE(MAX(bank_id), 0) + 1 AS next_bank_id
         FROM bank_info
         FOR UPDATE`,
      );

      const bank_id = maxBankRows[0].next_bank_id;

      await connection.query(
        `INSERT INTO bank_info (
          bank_id,
          user_id,
          account_no,
          bank_name,
          branch,
          ifsc_code,
          status,
          c_by,
          c_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [bank_id, user_id, accNo, bankName, branch, ifsc, "A", createdBy],
      );
    }

    if (wef || basic_salary !== undefined || incentive !== undefined || allowance !== undefined || gratuity !== undefined ||
      variable !== undefined) {
      if (!wef || basic_salary === undefined || basic_salary === null) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "WEF date and basic salary are required when salary details are provided.",
        });
      }

      const [maxSalaryRows] = await connection.query(
        `SELECT COALESCE(MAX(salary_id), 0) + 1 AS next_salary_id
         FROM salary_structure
         FOR UPDATE`,
      );

      const salary_id = maxSalaryRows[0].next_salary_id;

      await connection.query(
        `INSERT INTO salary_structure (
          salary_id,
          user_id,
          wef,
          basic_salary,
          incentive,
          allowance,
          gratuity,
          variable,
          status,
          c_by,
          c_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          salary_id,
          user_id,
          wef,
          basic_salary,
          incentive ?? 0,
          allowance ?? 0,
          gratuity ?? 0,
          variable ?? 0,
          "A",
          createdBy,
        ],
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: {
        user_id,
        username: email,

        f_name,
        m_name: m_name || null,
        l_name,

        phone,
        email,

        address: address || null,
        town: town || null,
        district: district || null,
        pin_code: pin_code || null,

        distributor: distributor || null,
        asm: asm || null,
        rsm: rsm || null,

        fwd,

        role: userRole,
        status: userStatus,

        bank: accNo
          ? {
            account_no: accNo,
            bank_name: bankName,
            branch,
            ifsc_code: ifsc,
          }
          : null,

        salary: wef
          ? {
            wef,
            basic_salary,
            incentive: incentive ?? 0,
            allowance: allowance ?? 0,
            gratuity: gratuity ?? 0,
            variable: variable ?? 0,
          }
          : null,
      },
    });
  } catch (error) {

    await connection.rollback();

    console.error("Add User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating user.",
    });
  } finally {
    connection.release();
  }
};

const ALLOWED_ROLES = ["SP", "Admin", "User", "Manager", "Master"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const cleanValue = (value) => {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed === "" ? undefined : trimmed;
};

export const bulkAddUsers = async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No users provided for bulk upload.",
      });
    }

    const createdBy = req.user?.user_id || null;
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < users.length; i++) {
      const raw = users[i] || {};
      const rowNumber = raw.row ?? i + 2;

      const f_name = cleanValue(raw.f_name);
      const m_name = cleanValue(raw.m_name);
      const l_name = cleanValue(raw.l_name);
      const phone = cleanValue(raw.phone);
      const email = cleanValue(raw.email);
      const address = cleanValue(raw.address);
      const town = cleanValue(raw.town);
      const district = cleanValue(raw.district);
      const pin_code = cleanValue(raw.pin_code);
      const distributor = cleanValue(raw.distributor);
      const asm = cleanValue(raw.asm);
      const rsm = cleanValue(raw.rsm);
      const fwd = cleanValue(raw.fwd);
      const role = cleanValue(raw.role);
      const accNo = cleanValue(raw.accNo);
      const bankName = cleanValue(raw.bankName);
      const branch = cleanValue(raw.branch);
      const ifsc = cleanValue(raw.ifsc);
      const wef = cleanValue(raw.wef);
      const basic_salary = cleanValue(raw.basic_salary);
      const incentive = cleanValue(raw.incentive);
      const allowance = cleanValue(raw.allowance);
      const gratuity = cleanValue(raw.gratuity);
      const variable = cleanValue(raw.variable);

      const name = `${f_name || ""} ${l_name || ""}`.trim();
      const connection = await pool.getConnection();

      try {
        if (!f_name || !l_name || !phone || !email || !fwd) {
          throw new Error("First name, last name, phone, email and joining date are required.");
        }

        if (!DATE_RE.test(fwd)) {
          throw new Error("Joining date must be in YYYY-MM-DD format.");
        }

        if (role && !ALLOWED_ROLES.includes(role)) {
          throw new Error(`Role must be one of: ${ALLOWED_ROLES.join(", ")}.`);
        }

        await connection.beginTransaction();

        const [existingUsers] = await connection.query(
          `SELECT user_id, email, phone
           FROM mst_users
           WHERE email = ? OR phone = ?
           LIMIT 1`,
          [email, phone],
        );

        if (existingUsers.length > 0) {
          const existingUser = existingUsers[0];

          if (existingUser.email === email) {
            throw new Error("Email already exists.");
          }

          if (existingUser.phone === phone) {
            throw new Error("Phone number already exists.");
          }

          throw new Error("Email or phone already exists.");
        }

        const [maxUserRows] = await connection.query(
          `SELECT COALESCE(MAX(user_id), 0) + 1 AS next_user_id
           FROM mst_users
           FOR UPDATE`,
        );

        const user_id = maxUserRows[0].next_user_id;

        const hashedPassword = await bcrypt.hash("Malpani@1234", 10);
        const userStatus = "A";
        const userRole = role || "SP";

        await connection.query(
          `INSERT INTO mst_users (
            user_id,
            username,
            password,
            f_name,
            m_name,
            l_name,
            phone,
            email,
            address,
            town,
            district,
            pin_code,
            distributor,
            asm,
            rsm,
            fwd,
            role,
            status,
            c_by,
            c_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            user_id,
            email,
            hashedPassword,
            f_name,
            m_name || null,
            l_name,
            phone,
            email,
            address || null,
            town || null,
            district || null,
            pin_code || null,
            distributor || null,
            asm || null,
            rsm || null,
            fwd,
            userRole,
            userStatus,
            createdBy,
          ],
        );

        if (accNo || bankName || branch || ifsc) {
          if (!accNo || !bankName || !branch || !ifsc) {
            throw new Error("Account number, bank name, branch and IFSC are required when bank details are provided.");
          }

          const [maxBankRows] = await connection.query(
            `SELECT COALESCE(MAX(bank_id), 0) + 1 AS next_bank_id
             FROM bank_info
             FOR UPDATE`,
          );

          const bank_id = maxBankRows[0].next_bank_id;

          await connection.query(
            `INSERT INTO bank_info (
              bank_id,
              user_id,
              account_no,
              bank_name,
              branch,
              ifsc_code,
              status,
              c_by,
              c_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [bank_id, user_id, accNo, bankName, branch, ifsc, "A", createdBy],
          );
        }

        if (wef || basic_salary !== undefined) {
          if (!wef || basic_salary === undefined) {
            throw new Error("WEF date and basic salary are required when salary details are provided.");
          }

          if (!DATE_RE.test(wef)) {
            throw new Error("WEF date must be in YYYY-MM-DD format.");
          }

          const [maxSalaryRows] = await connection.query(
            `SELECT COALESCE(MAX(salary_id), 0) + 1 AS next_salary_id
             FROM salary_structure
             FOR UPDATE`,
          );

          const salary_id = maxSalaryRows[0].next_salary_id;

          await connection.query(
            `INSERT INTO salary_structure (
              salary_id,
              user_id,
              wef,
              basic_salary,
              incentive,
              allowance,
              gratuity,
              variable,
              status,
              c_by,
              c_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              salary_id,
              user_id,
              wef,
              basic_salary,
              incentive ?? 0,
              allowance ?? 0,
              gratuity ?? 0,
              variable ?? 0,
              "A",
              createdBy,
            ],
          );
        }

        await connection.commit();

        successCount++;
        results.push({
          row: rowNumber,
          success: true,
          message: "User created successfully.",
          name,
          email,
        });
      } catch (err) {
        await connection.rollback().catch(() => { });

        errorCount++;
        results.push({
          row: rowNumber,
          success: false,
          message: err.message || "Failed to create user.",
          name,
          email: email || raw.email || "",
        });
      } finally {
        connection.release();
      }
    }

    return res.status(200).json({
      success: true,
      message: `Bulk upload complete. ${successCount} of ${users.length} user(s) created successfully${errorCount ? `, ${errorCount} failed` : ""}.`,
      total: users.length,
      successCount,
      errorCount,
      results,
    });
  } catch (error) {
    console.error("Bulk Add Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during bulk upload.",
    });
  }
};

export const updateUser = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    const { f_name, m_name, l_name, phone, email, address, town, district, pin_code, distributor, asm, rsm, fwd, status, role, accNo, bankName, branch, ifsc, wef, basic_salary, incentive, allowance, gratuity, variable, } = req.body;

    if (!f_name || !l_name || !phone || !email || !fwd) {
      return res.status(400).json({
        success: false,
        message:
          "First name, last name, phone, email and FWD date are required.",
      });
    }
    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      `SELECT
        user_id,
        status,
        role
       FROM mst_users
       WHERE user_id = ?
       LIMIT 1`,
      [id],
    );

    if (existingRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const [dupes] = await connection.query(
      `SELECT
        user_id,
        email,
        phone
       FROM mst_users
       WHERE (email = ? OR phone = ?)
         AND user_id != ?
       LIMIT 1`,
      [email, phone, id],
    );

    if (dupes.length > 0) {
      await connection.rollback();

      const duplicateUser = dupes[0];

      if (duplicateUser.email === email) {
        return res.status(409).json({
          success: false,
          message: "Email already used by another user.",
        });
      }

      if (duplicateUser.phone === phone) {
        return res.status(409).json({
          success: false,
          message: "Phone number already used by another user.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Email or phone already used by another user.",
      });
    }

    const updatedBy = req.user?.user_id || null;

    const userStatus = status !== undefined && status !== null && status !== "" ? status : existingRows[0].status;
    const userRole = role !== undefined && role !== null && role !== "" ? role : existingRows[0].role;

    await connection.query(
      `UPDATE mst_users
       SET
         f_name = ?,
         m_name = ?,
         l_name = ?,
         phone = ?,
         email = ?,
         address = ?,
         town = ?,
         district = ?,
         pin_code = ?,
         distributor = ?,
         asm = ?,
         rsm = ?,
         fwd = ?,
         role = ?,
         status = ?,
         u_by = ?,
         u_at = NOW()
       WHERE user_id = ?`,
      [
        f_name,
        m_name || null,
        l_name,
        phone,
        email,
        address || null,
        town || null,
        district || null,
        pin_code || null,
        distributor || null,
        asm || null,
        rsm || null,
        fwd,
        userRole,
        userStatus,
        updatedBy,
        id,
      ],
    );

    if (accNo || bankName || branch || ifsc) {

      if (!accNo || !bankName || !branch || !ifsc) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message:
            "Account number, bank name, branch and IFSC are required when bank details are provided.",
        });
      }

      const [existingBank] = await connection.query(
        `SELECT bank_id
         FROM bank_info
         WHERE user_id = ?
         LIMIT 1`,
        [id],
      );

      if (existingBank.length > 0) {
        const bankId = existingBank[0].bank_id;

        await connection.query(
          `UPDATE bank_info
           SET
             account_no = ?,
             bank_name = ?,
             branch = ?,
             ifsc_code = ?,
             status = ?,
             u_by = ?,
             u_at = NOW()
           WHERE bank_id = ?`,
          [accNo, bankName, branch, ifsc, "A", updatedBy, bankId],
        );
      }

      else {
        const [maxBankRows] = await connection.query(
          `SELECT COALESCE(MAX(bank_id), 0) + 1 AS next_bank_id
           FROM bank_info
           FOR UPDATE`,
        );

        const bankId = maxBankRows[0].next_bank_id;

        await connection.query(
          `INSERT INTO bank_info (
            bank_id,
            user_id,
            account_no,
            bank_name,
            branch,
            ifsc_code,
            status,
            c_by,
            c_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [bankId, id, accNo, bankName, branch, ifsc, "A", updatedBy],
        );
      }
    }

    if (wef || basic_salary !== undefined || incentive !== undefined || allowance !== undefined || gratuity !== undefined ||
      variable !== undefined) {

      if (!wef || basic_salary === undefined || basic_salary === null) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "WEF date and basic salary are required when salary details are provided.",
        });
      }

      const [existingSalary] = await connection.query(
        `SELECT salary_id
         FROM salary_structure
         WHERE user_id = ?
           AND wef = ?
         LIMIT 1`,
        [id, wef],
      );

      if (existingSalary.length > 0) {
        const salaryId = existingSalary[0].salary_id;

        await connection.query(
          `UPDATE salary_structure
           SET
             basic_salary = ?,
             incentive = ?,
             allowance = ?,
             gratuity = ?,
             variable = ?,
             status = ?,
             u_by = ?,
             u_at = NOW()
           WHERE salary_id = ?`,
          [
            basic_salary,
            incentive ?? 0,
            allowance ?? 0,
            gratuity ?? 0,
            variable ?? 0,
            "A",
            updatedBy,
            salaryId,
          ],
        );
      }

      else {
        const [maxSalaryRows] = await connection.query(
          `SELECT COALESCE(MAX(salary_id), 0) + 1 AS next_salary_id
           FROM salary_structure
           FOR UPDATE`,
        );

        const salaryId = maxSalaryRows[0].next_salary_id;

        await connection.query(
          `INSERT INTO salary_structure (
            salary_id,
            user_id,
            wef,
            basic_salary,
            incentive,
            allowance,
            gratuity,
            variable,
            status,
            c_by,
            c_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            salaryId,
            id,
            wef,
            basic_salary,
            incentive ?? 0,
            allowance ?? 0,
            gratuity ?? 0,
            variable ?? 0,
            "A",
            updatedBy,
          ],
        );
      }
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
    });
  } catch (error) {

    await connection.rollback();

    console.error("Update User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating user.",
    });
  } finally {
    connection.release();
  }
};

export const toggleUserStatus = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();


    // CHECK USER EXISTS


    const [existingRows] = await connection.query(
      `SELECT user_id, status
       FROM mst_users
       WHERE user_id = ?
       LIMIT 1`,
      [id],
    );

    if (existingRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }


    // FLIP STATUS


    const newStatus = existingRows[0].status === "A" ? "I" : "A";

    const updatedBy = req.user?.user_id || null;


    // UPDATE USER, BANK & SALARY STATUS


    await connection.query(
      `UPDATE mst_users
       SET status = ?, u_by = ?, u_at = NOW()
       WHERE user_id = ?`,
      [newStatus, updatedBy, id],
    );

    await connection.query(
      `UPDATE bank_info
       SET status = ?, u_by = ?, u_at = NOW()
       WHERE user_id = ?`,
      [newStatus, updatedBy, id],
    );

    await connection.query(
      `UPDATE salary_structure
       SET status = ?, u_by = ?, u_at = NOW()
       WHERE user_id = ?`,
      [newStatus, updatedBy, id],
    );


    // COMMIT TRANSACTION


    await connection.commit();


    // RESPONSE


    return res.status(200).json({
      success: true,
      message: `User ${newStatus === "A" ? "activated" : "deactivated"} successfully.`,
      status: newStatus,
    });
  } catch (error) {

    // ROLLBACK


    await connection.rollback();

    console.error("Toggle User Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating user status.",
    });
  } finally {

    // RELEASE CONNECTION


    connection.release();
  }
};
