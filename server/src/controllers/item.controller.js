import { pool } from "../config/db.js";

export const getItems = async (req, res) => {
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
          brand_name LIKE ?
          OR item_name LIKE ?
          OR uom LIKE ?`
      : "";

    const searchParams = search ? Array(3).fill(`%${search}%`) : [];

    // ----------------------------------
    // Get items
    // ----------------------------------
    const [rows] = await pool.query(
      `SELECT
        item_id,
        brand_name,
        brand_type,
        item_name,
        pack_size,
        uom,
        rate,
        status,
        c_at

       FROM mst_products

       ${searchClause}

       LIMIT ? OFFSET ?`,
      [...searchParams, limit, offset],
    );

    // ----------------------------------
    // Count total items
    // ----------------------------------
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM mst_products
       ${searchClause}`,
      searchParams,
    );

    const total = countRows[0].total;

    return res.status(200).json({
      success: true,
      items: rows,
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });

  } catch (error) {
    console.error("Get Items Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching items.",
    });
  }
};

export const getActiveItems = async (req, res) => {
  try {

    // Get items
    const [rows] = await pool.query(
      `SELECT
        item_id,
        brand_name,
        brand_type,
        item_name,
        pack_size,
        uom,
        rate,
        status,
        c_at

       FROM mst_products
       WHERE status = 'A'`,
    );

    return res.status(200).json({
      success: true,
      items: rows,
    });

  } catch (error) {
    console.error("Get Items Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching items.",
    });
  }
};

export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT
        item_id,
        brand_name,
        brand_type,
        item_name,
        pack_size,
        uom,
        rate,
        status

       FROM mst_products

       WHERE item_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      item: rows[0],
    });

  } catch (error) {
    console.error("Get Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching item.",
    });
  }
};

export const addItem = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      brand_name,
      brand_type,
      item_name,
      pack_size,
      uom,
      rate,
      status,
    } = req.body;


    if (!brand_name || !item_name || !brand_type) {
      return res.status(400).json({
        success: false,
        message:
          "Brand name, Product name, Brand Type are required.",
      });
    }

    await connection.beginTransaction();

    const [maxItemRows] = await connection.query(
      `SELECT COALESCE(MAX(item_id), 0) + 1 AS next_item_id
       FROM mst_products
       FOR UPDATE`,
    );

    const item_id = maxItemRows[0].next_item_id;

    const createdBy = req.user.user_id;

    const itemStatus = status || "A";

    await connection.query(
      `INSERT INTO mst_products (
        item_id,
        brand_name,
        brand_type,
        item_name,
        pack_size,
        uom,
        rate,
        status,
        c_by,
        c_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        item_id,
        brand_name,
        brand_type,
        item_name,
        pack_size,
        uom,
        rate,
        itemStatus,
        createdBy,
      ],
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Item created successfully.",
      item: {
        item_id,
        brand_name,
        item_name,
        pack_size,
        uom,
        rate,
        status: itemStatus,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Add Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating item.",
    });
  } finally {
    connection.release();
  }
};

export const updateItem = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    const {
      brand_name,
      brand_type,
      item_name,
      pack_size,
      uom,
      rate,
      status,
    } = req.body;

    if (!brand_name || !item_name || !brand_type) {
      return res.status(400).json({
        success: false,
        message:
          "Brand name, Brand Type, item name, pack size, UOM and rate are required.",
      });
    }

    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      `SELECT item_id, status
       FROM mst_products
       WHERE item_id = ?
       LIMIT 1`,
      [id],
    );

    if (existingRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    const updatedBy = req.user.user_id;

    const itemStatus = status !== undefined && status !== null && status !== "" ? status : existingRows[0].status;

    await connection.query(
      `UPDATE mst_products
       SET
         brand_name = ?,
         brand_type = ?,
         item_name = ?,
         pack_size = ?,
         uom = ?,
         rate = ?,
         status = ?,
         u_by = ?,
         u_at = NOW()
       WHERE item_id = ?`,
      [
        brand_name,
        brand_type,
        item_name,
        pack_size,
        uom,
        rate,
        itemStatus,
        updatedBy,
        id,
      ],
    );

    await connection.commit();
    return res.status(200).json({
      success: true,
      message: "Item updated successfully.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Update Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating item.",
    });
  } finally {
    connection.release();
  }
};

export const toggleItemStatus = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      `SELECT item_id, status
       FROM mst_products
       WHERE item_id = ?
       LIMIT 1`,
      [id],
    );

    if (existingRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    const newStatus = existingRows[0].status === "A" ? "I" : "A";
    const updatedBy = req.user.user_id;

    await connection.query(
      `UPDATE mst_products
       SET status = ?, u_by = ?, u_at = NOW()
       WHERE item_id = ?`,
      [newStatus, updatedBy, id],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Item ${newStatus === "A" ? "activated" : "deactivated"} successfully.`,
      status: newStatus,
    });
  } catch (error) {

    await connection.rollback();
    console.error("Toggle Item Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating item status.",
    });
  } finally {
    connection.release();
  }
};
