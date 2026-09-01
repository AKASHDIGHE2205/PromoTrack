import { pool } from "../config/db.js";

const toDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const now = new Date();
    const today = toDateStr(now);
    const monthStart = toDateStr(new Date(now.getFullYear(), now.getMonth(), 1));
    const historyFrom = toDateStr(addDays(now, -34));
    const trendFrom = toDateStr(addDays(now, -6));

    // ==========================================
    // ATTENDANCE HISTORY (last 35 days)
    // ==========================================

    const [attendanceRows] = await pool.query(
      `SELECT attendance_date, check_in
       FROM sp_attendance
       WHERE user_id = ?
         AND attendance_date >= ?
       ORDER BY attendance_date ASC`,
      [userId, historyFrom],
    );

    const presentDates = new Set(
      attendanceRows.map((r) => toDateStr(new Date(r.attendance_date))),
    );

    const todayMarked = presentDates.has(today);
    const todayRow = attendanceRows.find(
      (r) => toDateStr(new Date(r.attendance_date)) === today,
    );

    const daysPresentThisMonth = attendanceRows.filter(
      (r) => toDateStr(new Date(r.attendance_date)) >= monthStart,
    ).length;

    const daysElapsedThisMonth =
      Math.floor((now - new Date(now.getFullYear(), now.getMonth(), 1)) / 86400000) + 1;

    // Streak: consecutive present days walking back from today (or yesterday
    // if today isn't marked yet, so a pending check-in doesn't zero it out).
    let streak = 0;
    let cursor = todayMarked ? now : addDays(now, -1);
    while (presentDates.has(toDateStr(cursor))) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }

    const last7Days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = addDays(now, -i);
      const dateStr = toDateStr(d);
      last7Days.push({
        date: dateStr,
        day_label: DAY_LABELS[d.getDay()],
        present: presentDates.has(dateStr),
      });
    }

    // ==========================================
    // PROMOTIONS (scoped to logged-in promoter)
    // ==========================================

    const [dailyRows] = await pool.query(
      `SELECT
        h.promote_date,
        COUNT(DISTINCT h.promote_id) AS cnt,
        COALESCE(SUM(d.total_kg), 0) AS kg

       FROM promotion_hd h
       LEFT JOIN promotion_dt d ON d.promote_id = h.promote_id

       WHERE h.c_by = ?
         AND h.promote_date >= ?

       GROUP BY h.promote_date`,
      [userId, monthStart < trendFrom ? trendFrom : monthStart],
    );

    const dailyMap = new Map(
      dailyRows.map((r) => [
        toDateStr(new Date(r.promote_date)),
        { cnt: Number(r.cnt), kg: Number(r.kg) },
      ]),
    );

    const dailyTrend = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = addDays(now, -i);
      const dateStr = toDateStr(d);
      const entry = dailyMap.get(dateStr);
      dailyTrend.push({
        date: dateStr,
        day_label: DAY_LABELS[d.getDay()],
        count: entry?.cnt ?? 0,
      });
    }

    const [monthTotalsRows] = await pool.query(
      `SELECT
        COUNT(DISTINCT h.promote_id) AS total,
        COALESCE(SUM(d.total_kg), 0) AS total_kg,
        COUNT(DISTINCT h.shop_id) AS shops_covered

       FROM promotion_hd h
       LEFT JOIN promotion_dt d ON d.promote_id = h.promote_id

       WHERE h.c_by = ?
         AND h.promote_date BETWEEN ? AND ?`,
      [userId, monthStart, today],
    );

    const monthTotals = monthTotalsRows[0];

    const [recentRows] = await pool.query(
      `SELECT
        h.promote_id,
        h.shop_id,
        s.shop_name,
        h.promote_date,
        h.cust_mob,
        h.status,
        COUNT(d.promote_dt_id) AS item_count,
        COALESCE(SUM(d.total_kg), 0) AS total_kg

       FROM promotion_hd h
       JOIN mst_shops s ON s.shop_id = h.shop_id
       LEFT JOIN promotion_dt d ON d.promote_id = h.promote_id

       WHERE h.c_by = ?

       GROUP BY h.promote_id
       ORDER BY h.promote_date DESC, h.promote_id DESC
       LIMIT 5`,
      [userId],
    );

    // ==========================================
    // SALES PRODUCTS (top products promoted this month)
    // ==========================================

    const [topProductRows] = await pool.query(
      `SELECT
        d.item_id,
        i.item_name,
        i.brand_name,
        i.uom,
        SUM(d.qty) AS qty,
        SUM(d.total_kg) AS total_kg

       FROM promotion_dt d
       JOIN promotion_hd h ON h.promote_id = d.promote_id
       JOIN mst_products i ON i.item_id = d.item_id

       WHERE h.c_by = ?
         AND h.promote_date BETWEEN ? AND ?

       GROUP BY d.item_id
       ORDER BY total_kg DESC
       LIMIT 5`,
      [userId, monthStart, today],
    );

    const [distinctProductRows] = await pool.query(
      `SELECT COUNT(DISTINCT d.item_id) AS total

       FROM promotion_dt d
       JOIN promotion_hd h ON h.promote_id = d.promote_id

       WHERE h.c_by = ?
         AND h.promote_date BETWEEN ? AND ?`,
      [userId, monthStart, today],
    );

    return res.status(200).json({
      success: true,
      month_label: now.toLocaleString("en-IN", { month: "long", year: "numeric" }),
      today: {
        marked: todayMarked,
        check_in: todayRow?.check_in ?? null,
      },
      attendance: {
        days_present: daysPresentThisMonth,
        days_elapsed: daysElapsedThisMonth,
        streak,
        last_7_days: last7Days,
      },
      promotions: {
        total: Number(monthTotals.total) || 0,
        total_kg: Number(monthTotals.total_kg) || 0,
        shops_covered: Number(monthTotals.shops_covered) || 0,
        daily_trend: dailyTrend,
        recent: recentRows,
      },
      products: {
        total_distinct: Number(distinctProductRows[0].total) || 0,
        top: topProductRows,
      },
    });
  } catch (error) {
    console.error("Get Dashboard Summary Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard summary.",
    });
  }
};