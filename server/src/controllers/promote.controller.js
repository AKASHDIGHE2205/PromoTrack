import { pool } from "../config/db.js";

const toDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const defaultFromDate = () => {
  const now = new Date();
  return toDateStr(new Date(now.getFullYear(), now.getMonth(), 1));
};

const defaultToDate = () => toDateStr(new Date());

export const getPromotes = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const offset = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    const fromDate = req.query.from_date || defaultFromDate();
    const toDate = req.query.to_date || defaultToDate();

    // c_by (created by) distinguishes user-wise entries
    const createdBy = req.user.user_id;

    // ----------------------------------
    // Search condition
    // ----------------------------------
    const searchClause = search
      ? `AND (
          s.shop_name LIKE ?
          OR h.cust_mob LIKE ?
        )`
      : "";

    const searchParams = search ? Array(2).fill(`%${search}%`) : [];

    const baseParams = [createdBy, fromDate, toDate, ...searchParams];

    // ----------------------------------
    // Get promotions (only for logged in user)
    // ----------------------------------
    const [rows] = await pool.query(
      `SELECT
        h.promote_id,
        h.shop_id,
        s.shop_name,
        h.promote_date,
        h.cust_mob,
        h.status,
        h.c_at,
        COUNT(d.promote_dt_id) AS item_count,
        COALESCE(SUM(d.total_kg), 0) AS total_kg

       FROM promotion_hd h
       JOIN mst_shops s ON s.shop_id = h.shop_id
       LEFT JOIN promotion_dt d ON d.promote_id = h.promote_id

       WHERE h.c_by = ?
         AND h.promote_date BETWEEN ? AND ?
         ${searchClause}

       GROUP BY h.promote_id
       ORDER BY h.promote_date DESC, h.promote_id DESC
       LIMIT ? OFFSET ?`,
      [...baseParams, limit, offset],
    );

    // ----------------------------------
    // Count total promotions
    // ----------------------------------
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM promotion_hd h
       JOIN mst_shops s ON s.shop_id = h.shop_id
       WHERE h.c_by = ?
         AND h.promote_date BETWEEN ? AND ?
         ${searchClause}`,
      baseParams,
    );

    const total = countRows[0].total;

    return res.status(200).json({
      success: true,
      promotes: rows,
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      from_date: fromDate,
      to_date: toDate,
    });

  } catch (error) {
    console.error("Get Promotes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching promotions.",
    });
  }
};

export const getPromoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const createdBy = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT
        h.promote_id,
        h.shop_id,
        s.shop_name,
        h.promote_date,
        h.cust_mob,
        h.status

       FROM promotion_hd h
       JOIN mst_shops s ON s.shop_id = h.shop_id

       WHERE h.promote_id = ?
         AND h.c_by = ?`,
      [id, createdBy],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found.",
      });
    }

    const [items] = await pool.query(
      `SELECT
        d.promote_dt_id,
        d.item_id,
        i.item_name,
        i.brand_name,
        i.uom,
        d.qty,
        d.total_kg

       FROM promotion_dt d
       JOIN mst_products i ON i.item_id = d.item_id

       WHERE d.promote_id = ?`,
      [id],
    );

    return res.status(200).json({
      success: true,
      promote: {
        ...rows[0],
        items,
      },
    });

  } catch (error) {
    console.error("Get Promote Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching promotion.",
    });
  }
};

export const addPromote = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      promote_date,
      shop_id,
      cust_mob,
      status,
      entries,
    } = req.body;

    if (!promote_date || !shop_id || !cust_mob) {
      return res.status(400).json({
        success: false,
        message: "Promote date, shop and customer mobile are required.",
      });
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item entry is required.",
      });
    }

    for (const entry of entries) {
      if (!entry.item_id || !entry.qty || !entry.total_kg) {
        return res.status(400).json({
          success: false,
          message: "Each item entry requires item, quantity and total kg.",
        });
      }
    }

    await connection.beginTransaction();

    const createdBy = req.user.user_id;
    const promoteStatus = status || "A";

    const [maxHdRows] = await connection.query(
      `SELECT COALESCE(MAX(promote_id), 0) + 1 AS next_promote_id
       FROM promotion_hd
       FOR UPDATE`,
    );

    const promote_id = maxHdRows[0].next_promote_id;

    await connection.query(
      `INSERT INTO promotion_hd (
        promote_id,
        shop_id,
        promote_date,
        cust_mob,
        status,
        c_by,
        c_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        promote_id,
        shop_id,
        promote_date,
        cust_mob,
        promoteStatus,
        createdBy,
      ],
    );

    const [maxDtRows] = await connection.query(
      `SELECT COALESCE(MAX(promote_dt_id), 0) AS max_promote_dt_id
       FROM promotion_dt
       FOR UPDATE`,
    );

    let nextDtId = maxDtRows[0].max_promote_dt_id + 1;

    const detailValues = entries.map((entry) => [
      nextDtId++,
      promote_id,
      entry.item_id,
      entry.qty,
      entry.total_kg,
      createdBy,
      createdBy,
    ]);

    await connection.query(
      `INSERT INTO promotion_dt (
        promote_dt_id,
        promote_id,
        item_id,
        qty,
        total_kg,
        c_by,
        u_by
      )
      VALUES ?`,
      [detailValues],
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Promotion created successfully.",
      promote: {
        promote_id,
        shop_id,
        promote_date,
        cust_mob,
        status: promoteStatus,
      },
    });
  } catch (error) {

    await connection.rollback();

    console.error("Add Promote Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating promotion.",
    });
  } finally {
    connection.release();
  }
};

export const updatePromote = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    const {
      promote_date,
      shop_id,
      cust_mob,
      status,
      entries,
    } = req.body;

    if (!promote_date || !shop_id || !cust_mob) {
      return res.status(400).json({
        success: false,
        message: "Promote date, shop and customer mobile are required.",
      });
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item entry is required.",
      });
    }

    for (const entry of entries) {
      if (!entry.item_id || !entry.qty || !entry.total_kg) {
        return res.status(400).json({
          success: false,
          message: "Each item entry requires item, quantity and total kg.",
        });
      }
    }

    await connection.beginTransaction();
    const createdBy = req.user.user_id;

    const [existingRows] = await connection.query(
      `SELECT promote_id, status
       FROM promotion_hd
       WHERE promote_id = ?
         AND c_by = ?
       LIMIT 1`,
      [id, createdBy],
    );

    if (existingRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Promotion not found.",
      });
    }

    const promoteStatus =status !== undefined && status !== null && status !== ""? status: existingRows[0].status;

    await connection.query(
      `UPDATE promotion_hd
       SET
         shop_id = ?,
         promote_date = ?,
         cust_mob = ?,
         status = ?,
         u_by = ?,
         u_at = NOW()
       WHERE promote_id = ?`,
      [
        shop_id,
        promote_date,
        cust_mob,
        promoteStatus,
        createdBy,
        id,
      ],
    );

    await connection.query(
      `DELETE FROM promotion_dt WHERE promote_id = ?`,
      [id],
    );

    const [maxDtRows] = await connection.query(
      `SELECT COALESCE(MAX(promote_dt_id), 0) AS max_promote_dt_id
       FROM promotion_dt
       FOR UPDATE`,
    );

    let nextDtId = maxDtRows[0].max_promote_dt_id + 1;

    const detailValues = entries.map((entry) => [
      nextDtId++,
      id,
      entry.item_id,
      entry.qty,
      entry.total_kg,
      createdBy,
      createdBy,
    ]);

    await connection.query(
      `INSERT INTO promotion_dt (
        promote_dt_id,
        promote_id,
        item_id,
        qty,
        total_kg,
        c_by,
        u_by
      )
      VALUES ?`,
      [detailValues],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Promotion updated successfully.",
    });
  } catch (error) {

    await connection.rollback();
    console.error("Update Promote Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating promotion.",
    });
  } finally {
    connection.release();
  }
};

export const togglePromoteStatus = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const createdBy = req.user.user_id;

    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      `SELECT promote_id, status
       FROM promotion_hd
       WHERE promote_id = ?
         AND c_by = ?
       LIMIT 1`,
      [id, createdBy],
    );

    if (existingRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Promotion not found.",
      });
    }

    const newStatus = existingRows[0].status === "A" ? "I" : "A";

    await connection.query(
      `UPDATE promotion_hd
       SET status = ?, u_by = ?, u_at = NOW()
       WHERE promote_id = ?`,
      [newStatus, createdBy, id],
    );
    await connection.commit();
    return res.status(200).json({
      success: true,
      message: `Promotion ${newStatus === "A" ? "activated" : "deactivated"} successfully.`,
      status: newStatus,
    });
  } catch (error) {

    await connection.rollback();

    console.error("Toggle Promote Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating promotion status.",
    });
  } finally {
    connection.release();
  }
};
