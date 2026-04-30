const tenantsModel = require('../tenants/tenantsModel');

async function createTenant(tenantData, userId) {
    if (!tenantData?.name) {
        throw new Error('Tenant name is required');
    }

    if (!userId) {
        throw new Error('User id is required');
    }

    return await tenantsModel.createTenant({
        ...tenantData,
        createdBy: tenantData.createdBy ?? userId,
        updatedBy: tenantData.updatedBy ?? userId
    });
}

async function getTenants() {
    return await tenantsModel.getTenants();
}

async function getTenant(id) {
    return await tenantsModel.getTenant(id);
}

async function updateTenant(id, tenantData, userId) {
    if (!userId) {
        throw new Error('User id is required');
    }

    return await tenantsModel.updateTenant(id, {
        ...tenantData,
        updatedBy: tenantData.updatedBy ?? userId
    });
}

async function deleteTenant(id) {
    return await tenantsModel.deleteTenant(id);
}

module.exports = {
    createTenant,
    getTenants,
    getTenant,
    updateTenant,
    deleteTenant
};
