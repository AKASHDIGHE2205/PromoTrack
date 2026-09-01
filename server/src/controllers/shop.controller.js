import { pool } from "../config/db.js";

export const getShops = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const offset = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    const searchClause = search
      ? `WHERE
          shop_name LIKE ?
          OR owner_name LIKE ?
          OR address LIKE ?
          OR mobile LIKE ?`
      : "";

    const searchParams = search ? Array(4).fill(`%${search}%`) : [];

    const [rows] = await pool.query(
      `SELECT
        shop_id,
        shop_name,
        owner_name,
        address,
        latitude,
        longitude,
        mobile,
        status,
        c_at

       FROM mst_shops

       ${searchClause}

       LIMIT ? OFFSET ?`,
      [...searchParams, limit, offset],
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM mst_shops
       ${searchClause}`,
      searchParams,
    );

    const total = countRows[0].total;

    return res.status(200).json({
      success: true,
      shops: rows,
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });

  } catch (error) {
    console.error("Get Shops Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching shops.",
    });
  }
};

export const getActiveShops = async (req, res) => {
  try {
    // Get Active shops
    const [rows] = await pool.query(
      `SELECT
        shop_id,
        shop_name,
        owner_name,
        address,
        latitude,
        longitude,
        mobile,
        status,
        c_at
       FROM mst_shops
       WHERE status ='A'`,
    );

    return res.status(200).json({
      success: true,
      shops: rows,
    });

  } catch (error) {
    console.error("Get Shops Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching shops.",
    });
  }
};

export const getShopById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT
        shop_id,
        shop_name,
        owner_name,
        address,
        latitude,
        longitude,
        mobile,
        status

       FROM mst_shops

       WHERE shop_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Shop not found.",
      });
    }

    return res.status(200).json({
      success: true,
      shop: rows[0],
    });

  } catch (error) {
    console.error("Get Shop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching shop.",
    });
  }
};

export const addShop = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      shop_name,
      owner_name,
      address,
      latitude,
      longitude,
      mobile,
      status,
    } = req.body;

    if (!shop_name || !owner_name || !address || longitude === null || longitude === "" || !mobile) {
      return res.status(400).json({
        success: false,
        message:
          "Shop name, owner name, address and mobile are required.",
      });
    }

    await connection.beginTransaction();

    const [existingShops] = await connection.query(
      `SELECT shop_id
       FROM mst_shops
       WHERE mobile = ?
       LIMIT 1`,
      [mobile],
    );

    if (existingShops.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "Mobile number already exists.",
      });
    }

    const [maxShopRows] = await connection.query(
      `SELECT COALESCE(MAX(shop_id), 0) + 1 AS next_shop_id
       FROM mst_shops
       FOR UPDATE`,
    );

    const shop_id = maxShopRows[0].next_shop_id;

    const createdBy = req.user.user_id;

    const shopStatus = status || "A";

    await connection.query(
      `INSERT INTO mst_shops (
        shop_id,
        shop_name,
        owner_name,
        address,
        latitude,
        longitude,
        mobile,
        status,
        c_by,
        c_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        shop_id,
        shop_name,
        owner_name,
        address,
        latitude,
        longitude,
        mobile,
        shopStatus,
        createdBy,
      ],
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Shop created successfully.",
      shop: {
        shop_id,
        shop_name,
        owner_name,
        address,
        latitude,
        longitude,
        mobile,
        status: shopStatus,
      },
    });
  } catch (error) {

    await connection.rollback();

    console.error("Add Shop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating shop.",
    });
  } finally {
    connection.release();
  }
};

export const updateShop = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    const {
      shop_name,
      owner_name,
      address,
      latitude,
      longitude,
      mobile,
      status,
    } = req.body;

    if (!shop_name || !owner_name || !address || !mobile) {
      return res.status(400).json({
        success: false,
        message:
          "Shop name, owner name, address and mobile are required.",
      });
    }

    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      `SELECT shop_id, status
       FROM mst_shops
       WHERE shop_id = ?
       LIMIT 1`,
      [id],
    );

    if (existingRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Shop not found.",
      });
    }

    const [dupes] = await connection.query(
      `SELECT shop_id
       FROM mst_shops
       WHERE mobile = ?
         AND shop_id != ?
       LIMIT 1`,
      [mobile, id],
    );

    if (dupes.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "Mobile number already used by another shop.",
      });
    }

    const updatedBy = req.user.user_id;
    const shopStatus = status !== undefined && status !== null && status !== "" ? status : existingRows[0].status;

    await connection.query(
      `UPDATE mst_shops
       SET
         shop_name = ?,
         owner_name = ?,
         address = ?,
         latitude = ?,
         longitude = ?,
         mobile = ?,
         status = ?,
         u_by = ?,
         u_at = NOW()
       WHERE shop_id = ?`,
      [
        shop_name,
        owner_name,
        address,
        latitude,
        longitude,
        mobile,
        shopStatus,
        updatedBy,
        id,
      ],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Shop updated successfully.",
    });
  } catch (error) {

    await connection.rollback();

    console.error("Update Shop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating shop.",
    });
  } finally {
    connection.release();
  }
};

export const toggleShopStatus = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      `SELECT shop_id, status
       FROM mst_shops
       WHERE shop_id = ?
       LIMIT 1`,
      [id],
    );

    if (existingRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Shop not found.",
      });
    }

    const newStatus = existingRows[0].status === "A" ? "I" : "A";
    const updatedBy = req.user.user_id;

    await connection.query(
      `UPDATE mst_shops
       SET status = ?, u_by = ?, u_at = NOW()
       WHERE shop_id = ?`,
      [newStatus, updatedBy, id],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Shop ${newStatus === "A" ? "activated" : "deactivated"} successfully.`,
      status: newStatus,
    });
  } catch (error) {

    await connection.rollback();

    console.error("Toggle Shop Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating shop status.",
    });
  } finally {
    connection.release();
  }
};