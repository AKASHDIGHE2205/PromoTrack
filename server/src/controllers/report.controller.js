import { pool } from "../config/db.js";

const toDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const defaultFromDate = () => {
  const now = new Date();
  return toDateStr(new Date(now.getFullYear(), 0, 1));
};

const defaultToDate = () => toDateStr(new Date());

export const getMonthlySalesReport = async (req, res) => {
  try {
    const fromDate = req.query.from_date || defaultFromDate();
    const toDate = req.query.to_date || defaultToDate();
    const userId = req.query.user_id ? parseInt(req.query.user_id) : null;
    const brandType = req.query.brand_type || null;

    const itemIds = (req.query.item_ids || "")
      .split(",")
      .map((id) => parseInt(id))
      .filter((id) => !Number.isNaN(id));

    // ----------------------------------
    // Filters
    // ----------------------------------
    const conditions = ["h.promote_date BETWEEN ? AND ?"];
    const params = [fromDate, toDate];

    if (userId) {
      conditions.push("h.c_by = ?");
      params.push(userId);
    }

    if (brandType) {
      conditions.push("i.brand_type = ?");
      params.push(brandType);
    }

    if (itemIds.length > 0) {
      conditions.push(`d.item_id IN (${itemIds.map(() => "?").join(",")})`);
      params.push(...itemIds);
    }

    const whereClause = conditions.join(" AND ");

    // ----------------------------------
    // Sales grouped by month + brand type
    // ----------------------------------
    const [rows] = await pool.query(
      `SELECT
        DATE_FORMAT(h.promote_date, '%Y-%m') AS month_key,
        DATE_FORMAT(h.promote_date, '%b %Y') AS month_label,
        i.brand_type,
        COALESCE(SUM(d.total_kg), 0) AS total_kg

       FROM promotion_hd h
       JOIN promotion_dt d ON d.promote_id = h.promote_id
       JOIN mst_products i ON i.item_id = d.item_id

       WHERE ${whereClause}

       GROUP BY month_key, month_label, i.brand_type
       ORDER BY month_key ASC`,
      params,
    );

    // ----------------------------------
    // Pivot into one row per month
    // ----------------------------------
    const monthMap = new Map();

    for (const row of rows) {
      if (!monthMap.has(row.month_key)) {
        monthMap.set(row.month_key, {
          month_key: row.month_key,
          month_label: row.month_label,
          premium_kg: 0,
          other_kg: 0,
          total_kg: 0,
        });
      }

      const entry = monthMap.get(row.month_key);
      const kg = Number(row.total_kg) || 0;

      if (row.brand_type === "P") entry.premium_kg += kg;
      else if (row.brand_type === "O") entry.other_kg += kg;

      entry.total_kg += kg;
    }

    const months = Array.from(monthMap.values()).sort((a, b) =>
      a.month_key.localeCompare(b.month_key),
    );

    const grandTotal = months.reduce(
      (acc, m) => ({
        premium_kg: acc.premium_kg + m.premium_kg,
        other_kg: acc.other_kg + m.other_kg,
        total_kg: acc.total_kg + m.total_kg,
      }),
      { premium_kg: 0, other_kg: 0, total_kg: 0 },
    );

    return res.status(200).json({
      success: true,
      months,
      grand_total: grandTotal,
      from_date: fromDate,
      to_date: toDate,
    });

  } catch (error) {
    console.error("Get Monthly Sales Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching monthly sales report.",
    });
  }
};
