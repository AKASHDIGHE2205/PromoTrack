import fs from "fs";
import { pool } from "../config/db.js";

const toDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const toDateTimeStr = (date) => {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${toDateStr(date)} ${hh}:${mm}:${ss}`;
};

const defaultFromDate = () => {
  const now = new Date();
  return toDateStr(new Date(now.getFullYear(), now.getMonth(), 1));
};

const defaultToDate = () => toDateStr(new Date());

export const getAttendanceReport = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const offset = (page - 1) * limit;

    const fromDate = req.query.from_date || defaultFromDate();
    const toDate = req.query.to_date || defaultToDate();
    const userId = req.query.user_id ? parseInt(req.query.user_id) : null;

    const userClause = userId ? "AND a.user_id = ?" : "";
    const userParams = userId ? [userId] : [];

    const baseParams = [fromDate, toDate, ...userParams];

    const [rows] = await pool.query(
      `SELECT
        a.attendance_id,
        a.user_id,
        u.f_name,
        u.l_name,
        a.attendance_date,
        a.check_in,
        a.selfie,
        a.location,
        a.pincode,
        a.district,
        a.state,
        a.latitude,
        a.longitude,
        a.status

       FROM sp_attendance a
       JOIN mst_users u ON u.user_id = a.user_id

       WHERE a.attendance_date BETWEEN ? AND ?
         ${userClause}

       ORDER BY a.attendance_date DESC, a.check_in DESC
       LIMIT ? OFFSET ?`,
      [...baseParams, limit, offset],
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM sp_attendance a
       WHERE a.attendance_date BETWEEN ? AND ?
         ${userClause}`,
      baseParams,
    );

    const total = countRows[0].total;

    return res.status(200).json({
      success: true,
      attendance: rows,
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      from_date: fromDate,
      to_date: toDate,
    });

  } catch (error) {
    console.error("Get Attendance Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching attendance report.",
    });
  }
};

export const getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const today = toDateStr(new Date());

    const [rows] = await pool.query(
      `SELECT
        attendance_id,
        attendance_date,
        check_in,
        selfie,
        location,
        pincode,
        district,
        state,
        latitude,
        longitude,
        status

       FROM sp_attendance

       WHERE user_id = ?
         AND attendance_date = ?
       LIMIT 1`,
      [userId, today],
    );

    return res.status(200).json({
      success: true,
      marked: rows.length > 0,
      attendance: rows[0] || null,
    });

  } catch (error) {
    console.error("Get Today Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching today's attendance.",
    });
  }
};

export const markAttendance = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { latitude, longitude, location, pincode, district, state, } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Selfie is required.",
      });
    }

    if (!latitude || !longitude) {
      fs.unlink(req.file.path, () => { });

      return res.status(400).json({
        success: false,
        message: "Location (latitude/longitude) is required.",
      });
    }

    const userId = req.user.user_id;
    const now = new Date();
    const attendanceDate = toDateStr(now);
    const checkIn = toDateTimeStr(now);
    // const selfiePath = `attendance/${attendanceDate}/${req.file.filename}`;
    const selfiePath = `attendance/${req.attendanceMonthFolder}/${req.file.filename}`;

    await connection.beginTransaction();

    await connection.query(
      `SELECT user_id FROM mst_users WHERE user_id = ? FOR UPDATE`,
      [userId],
    );

    const [maxRows] = await connection.query(
      `SELECT COALESCE(MAX(attendance_id), 0) + 1 AS next_attendance_id
       FROM sp_attendance`,
    );

    const attendance_id = maxRows[0].next_attendance_id;

    await connection.query(
      `INSERT INTO sp_attendance (
        attendance_id,
        user_id,
        attendance_date,
        check_in,
        selfie,
        location,
        pincode,
        district,
        state,
        latitude,
        longitude,
        status,
        c_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        attendance_id,
        userId,
        attendanceDate,
        checkIn,
        selfiePath,
        location || null,
        pincode || null,
        district || null,
        state || null,
        latitude,
        longitude,
        "A",
        userId,
      ],
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully.",
      attendance: {
        attendance_id,
        attendance_date: attendanceDate,
        check_in: checkIn,
        selfie: selfiePath,
        location: location || null,
        pincode: pincode || null,
        district: district || null,
        state: state || null,
        latitude,
        longitude,
        status: "A",
      },
    });
  } catch (error) {
    await connection.rollback();

    if (req.file) {
      fs.unlink(req.file.path, () => { });
    }

    console.error("Mark Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while marking attendance.",
    });
  } finally {
    connection.release();
  }
};