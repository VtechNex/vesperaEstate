import pool from "../db/pool.js";

/**
 * CREATE LEAD
 */
export const createLead = async (req, res) => {
  try {
    const user_id = req.user.id; // Get user ID from auth middleware
    const {
      fname,
      lname,
      designation,
      organization,
      email,
      mobile,
      tel1,
      tel2,
      website,
      address,
      notes,
      list_id
    } = req.body;

    if (!fname || !mobile || !list_id) {
      return res.status(400).json({
        success: false,
        message: "First name, mobile, and list_id are required"
      });
    }

    // ✅ CHECK IF USER OWNS THE LIST
    const listCheck = await pool.query(
      `SELECT id FROM lists WHERE id = $1 AND owner_id = $2`,
      [list_id, user_id]
    );

    if (listCheck.rowCount === 0) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to add leads to this list"
      });
    }

    const result = await pool.query(
      `INSERT INTO leads (fname, lname, designation, organization, email, mobile, tel1, tel2, website, address, notes, list_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, fname, lname, designation, organization, email, mobile, tel1, tel2, website, address, notes, list_id, created_at`,
      [fname, lname || null, designation || null, organization || null, email || null, mobile, tel1 || null, tel2 || null, website || null, address || null, notes || null, list_id]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lead creation failed" });
  }
};

/**
 * GET ALL LEADS (for a specific list)
 */
export const getLeadsByListId = async (req, res) => {
  try {
    const user_id = req.user.id; // Get user ID
    const { list_id } = req.params;

    // ✅ CHECK IF USER OWNS THE LIST
    const listCheck = await pool.query(
      `SELECT id FROM lists WHERE id = $1 AND owner_id = $2`,
      [list_id, user_id]
    );

    if (listCheck.rowCount === 0) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view leads from this list"
      });
    }

    const result = await pool.query(
      `SELECT id, fname, lname, designation, organization, email, mobile, tel1, tel2, website, address, notes, list_id, created_at
       FROM leads
       WHERE list_id = $1
       ORDER BY created_at DESC`,
      [list_id]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch leads" });
  }
};

/**
 * GET ALL LEADS (for all lists of user)
 */
export const getAllLeads = async (req, res) => {
  try {
    const user_id = req.user.id;

    console.log(`🔵 [BACKEND] Fetching leads for user ${user_id}`);

    const result = await pool.query(
      `SELECT ld.id, ld.fname, ld.lname, ld.designation, ld.organization, 
              ld.email, ld.mobile, ld.tel1, ld.tel2, ld.website, ld.address, 
              ld.notes, ld.list_id, ld.created_at, l.name as list_name
       FROM leads ld
       INNER JOIN lists l ON ld.list_id = l.id
       WHERE l.owner_id = $1
       ORDER BY ld.created_at DESC`,
      [user_id]
    );

    console.log(`✅ [BACKEND] Found ${result.rows.length} leads for user ${user_id}`);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch leads" });
  }
};

/**
 * GET LEAD BY ID
 */
export const getLeadById = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    // ✅ CHECK IF USER OWNS THE LEAD'S LIST
    const result = await pool.query(
      `SELECT ld.id, ld.fname, ld.lname, ld.designation, ld.organization, 
              ld.email, ld.mobile, ld.tel1, ld.tel2, ld.website, ld.address, 
              ld.notes, ld.list_id, ld.created_at, l.name as list_name
       FROM leads ld
       INNER JOIN lists l ON ld.list_id = l.id
       WHERE ld.id = $1 AND l.owner_id = $2`,
      [id, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch lead" });
  }
};

/**
 * UPDATE LEAD
 */
export const updateLead = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;
    const {
      fname,
      lname,
      designation,
      organization,
      email,
      mobile,
      tel1,
      tel2,
      website,
      address,
      notes
    } = req.body;

    // ✅ CHECK IF USER OWNS THE LEAD
    const ownershipCheck = await pool.query(
      `SELECT ld.id FROM leads ld
       INNER JOIN lists l ON ld.list_id = l.id
       WHERE ld.id = $1 AND l.owner_id = $2`,
      [id, user_id]
    );

    if (ownershipCheck.rowCount === 0) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this lead"
      });
    }

    const result = await pool.query(
      `UPDATE leads
       SET fname = COALESCE($1, fname),
           lname = COALESCE($2, lname),
           designation = COALESCE($3, designation),
           organization = COALESCE($4, organization),
           email = COALESCE($5, email),
           mobile = COALESCE($6, mobile),
           tel1 = COALESCE($7, tel1),
           tel2 = COALESCE($8, tel2),
           website = COALESCE($9, website),
           address = COALESCE($10, address),
           notes = COALESCE($11, notes)
       WHERE id = $12
       RETURNING id, fname, lname, designation, organization, email, mobile, tel1, tel2, website, address, notes, list_id, created_at`,
      [fname || null, lname || null, designation || null, organization || null, email || null, mobile || null, tel1 || null, tel2 || null, website || null, address || null, notes || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lead update failed" });
  }
};

/**
 * DELETE LEAD
 */
export const deleteLead = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    // ✅ CHECK IF USER OWNS THE LEAD
    const ownershipCheck = await pool.query(
      `SELECT ld.id FROM leads ld
       INNER JOIN lists l ON ld.list_id = l.id
       WHERE ld.id = $1 AND l.owner_id = $2`,
      [id, user_id]
    );

    if (ownershipCheck.rowCount === 0) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this lead"
      });
    }

    const result = await pool.query(
      `DELETE FROM leads WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.json({
      success: true,
      message: "Lead deleted successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lead deletion failed" });
  }
};

/**
 * SEARCH LEADS
 */
export const searchLeads = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { query } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Query must be at least 2 characters"
      });
    }

    const searchTerm = `%${query}%`;

    console.log(`🔍 [BACKEND] Searching leads for user ${user_id}, query: ${query}`);

    const result = await pool.query(
      `SELECT ld.id, ld.fname, ld.lname, ld.designation, ld.organization, 
              ld.email, ld.mobile, ld.tel1, ld.tel2, ld.website, ld.address, 
              ld.notes, ld.list_id, ld.created_at, l.name as list_name
       FROM leads ld
       INNER JOIN lists l ON ld.list_id = l.id
       WHERE l.owner_id = $1 AND (
         ld.fname ILIKE $2 OR 
         ld.lname ILIKE $2 OR 
         ld.email ILIKE $2 OR 
         ld.mobile ILIKE $2 OR 
         ld.organization ILIKE $2
       )
       ORDER BY ld.created_at DESC
       LIMIT 100`,
      [user_id, searchTerm]
    );

    console.log(`✅ [BACKEND] Found ${result.rows.length} search results`);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lead search failed" });
  }
};