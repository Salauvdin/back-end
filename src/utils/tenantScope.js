const TENANT_COLUMN_CANDIDATES = ["tenantid", "tenantId", "tenant_id", "TenantId"];

const ForbiddenTenantError = class extends Error {
  constructor(message = "Tenant mismatch") {
    super(message);
    this.name = "ForbiddenTenantError";
    this.statusCode = 403;
    this.code = "TENANT_MISMATCH";
  }
};

const ensureTenantId = (tenantId) => {
  // If tenantId is missing, default to 0 (super admin tenant)
  if (tenantId === undefined || tenantId === null || tenantId === "") {
    return 0;
  }

  return tenantId;
};

const isSuperAdminTenant = (tenantId) => Number(tenantId) === 0 || tenantId === "*";

const pickTenantColumn = (columns) => {
  for (const candidate of TENANT_COLUMN_CANDIDATES) {
    if (columns.includes(candidate)) {
      return candidate;
    }
  }

  return null;
};

const requireTenantColumn = (schema) => {
  if (!schema?.tenantId) {
    throw new Error(`Table ${schema?.tableName || "unknown"} is missing a tenantid column`);
  }

  return schema.tenantId;
};

const tenantWhere = (schema, alias = null) => {
  const column = requireTenantColumn(schema);
  return `${alias ? `${alias}.` : ""}${column} = ?`;
};

const appendTenantFilter = (query, params, schema, tenantId, alias = null) => {
  const separator = /\bWHERE\b/i.test(query) ? " AND " : " WHERE ";
  return {
    query: `${query}${separator}${tenantWhere(schema, alias)}`,
    params: [...params, ensureTenantId(tenantId)]
  };
};

const isTenantMismatch = (error) => error?.code === "TENANT_MISMATCH";

module.exports = {
  ForbiddenTenantError,
  appendTenantFilter,
  ensureTenantId,
  isSuperAdminTenant,
  isTenantMismatch,
  pickTenantColumn,
  requireTenantColumn,
  tenantWhere
};
