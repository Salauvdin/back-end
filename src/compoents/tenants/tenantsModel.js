const connection = require('../../Connection');

/**
 * Create Tenant
 */
async function createTenant(tenantData) {
    try {
        const { name, createdBy, updatedBy, logo } = tenantData;

        const result = await connection.dbconnection.query(
            `INSERT INTO tenants 
             (name, createdby, updatedby, logo, createdat, updatedat)
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [name, createdBy, updatedBy, logo || null]
        );

        // MySQL doesn't support RETURNING *, so fetch manually
        return await getTenant(result.insertId);

    } catch (err) {
        console.error('Error creating tenant:', err);
        throw err;
    }
}

/**
 * Get All Tenants
 */
async function getTenants() {
    try {
        const rows = await connection.dbconnection.query(
            `SELECT * FROM tenants ORDER BY createdat DESC, id DESC`
        );

        return rows;
    } catch (err) {
        console.error('Error fetching tenants:', err);
        throw err;
    }
}

/**
 * Get Tenant by ID
 */
async function getTenant(id) {
    try {
        const rows = await connection.dbconnection.query(
            `SELECT * FROM tenants WHERE id = ?`,
            [id]
        );

        return rows[0] || null;
    } catch (err) {
        console.error('Error fetching tenant:', err);
        throw err;
    }
}

/**
 * Update Tenant (Partial Update)
 */
async function updateTenant(id, tenantData) {
    try {
        const fields = [];
        const values = [];

        if (tenantData.name !== undefined) {
            fields.push(`name = ?`);
            values.push(tenantData.name);
        }

        if (tenantData.updatedBy !== undefined) {
            fields.push(`updatedby = ?`);
            values.push(tenantData.updatedBy);
        }

        if (tenantData.logo !== undefined) {
            fields.push(`logo = ?`);
            values.push(tenantData.logo);
        }

        // always update timestamp
        fields.push(`updatedat = NOW()`);

        if (fields.length === 1) {
            throw new Error('No valid fields provided for update');
        }

        const query = `
            UPDATE tenants
            SET ${fields.join(', ')}
            WHERE id = ?
        `;

        values.push(id);

        const result = await connection.dbconnection.query(query, values);

        if (result.affectedRows === 0) return null;

        return await getTenant(id);

    } catch (err) {
        console.error('Error updating tenant:', err);
        throw err;
    }
}

/**
 * Delete Tenant
 */
async function deleteTenant(id) {
    try {
        const existing = await getTenant(id);
        if (!existing) return null;

        await connection.dbconnection.query(
            `DELETE FROM tenants WHERE id = ?`,
            [id]
        );

        return existing;

    } catch (err) {
        console.error('Error deleting tenant:', err);
        throw err;
    }
}

module.exports = {
    createTenant,
    getTenants,
    getTenant,
    updateTenant,
    deleteTenant
};
