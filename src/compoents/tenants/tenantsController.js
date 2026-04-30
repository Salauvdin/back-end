const tenantsService = require('../tenants/tenantsService');

const getUserId = (req) => req.user?.id || req.user?.userId || req.user?.registerId;

async function createTenant(req, res) {
    try {
        const userId = getUserId(req);
        const tenant = await tenantsService.createTenant(req.body, userId);
        res.status(201).json(tenant);
    } catch (error) {
        if (error.message === 'Tenant name is required' || error.message === 'User id is required') {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: error.message });
    }
}

async function getTenants(req, res) {
    try {
        const tenants = await tenantsService.getTenants();
        res.status(200).json({
            message: 'Tenants retrieved successfully',
            value: tenants
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getTenant(req, res) {
    try {
        const tenant = await tenantsService.getTenant(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.status(200).json(tenant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateTenant(req, res) {
    try {
        const userId = getUserId(req);
        const tenant = await tenantsService.updateTenant(req.params.id, req.body, userId);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.status(200).json(tenant);
    } catch (error) {
        if (error.message === 'No valid fields provided for update' || error.message === 'User id is required') {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: error.message });
    }
}

async function deleteTenant(req, res) {
    try {
        const tenant = await tenantsService.deleteTenant(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.status(200).json(tenant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createTenant,
    getTenants,
    getTenant,
    updateTenant,
    deleteTenant
};
