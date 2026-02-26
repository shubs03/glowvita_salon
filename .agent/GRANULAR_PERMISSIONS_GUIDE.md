# Granular Permissions Implementation Guide

**Last Updated:** 2026-02-17

This document provides a comprehensive mapping of all granular permissions implemented across the admin application. Staff members are now restricted based on specific permission strings assigned to their accounts, not just their role.

---

## Permission Enforcement Mechanism

### How It Works

All protected API routes use the `authMiddlewareAdmin` middleware with three arguments:

```javascript
export const GET = authMiddlewareAdmin(
  async (req) => { /* handler logic */ },
  ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], // Allowed roles
  "module:action" // Required permission
);
```

### Permission Check Logic

1. **Role Check First**: User must have one of the allowed roles
2. **Permission Check Second**: User's `permissions` array must include the required permission string
3. **Access Denied**: If either check fails, returns 403 Forbidden

---

## Complete Permission Mapping

### 1. Vendor Management (`vendors:*`)

| HTTP Method | Endpoint | Required Permission | Description |
|-------------|----------|---------------------|-------------|
| GET | `/api/admin/vendor` | `vendors:view` | View all vendors |
| POST | `/api/admin/vendor` | `vendors:edit` | Create new vendor |
| PUT | `/api/admin/vendor` | `vendors:edit` | Update vendor details |
| DELETE | `/api/admin/vendor` | `vendors:delete` | Delete vendor |
| PATCH | `/api/admin/vendor` | `vendors:edit` | Approve/reject vendor or documents |

**File:** `apps/admin/src/app/api/admin/vendor/route.js`

---

### 2. Supplier Management (`suppliers:*`)

| HTTP Method | Endpoint | Required Permission | Description |
|-------------|----------|---------------------|-------------|
| GET | `/api/admin/suppliers` | `suppliers:view` | View all suppliers |
| POST | `/api/admin/suppliers` | N/A (Public) | Create new supplier |
| PUT | `/api/admin/suppliers` | `suppliers:edit` | Update supplier details |
| DELETE | `/api/admin/suppliers` | `suppliers:delete` | Delete supplier |
| PATCH | `/api/admin/suppliers` | `suppliers:edit` | Approve/reject supplier or documents |

**File:** `apps/admin/src/app/api/admin/suppliers/route.js`

---

### 3. Doctor Management (`doctors:*`)

| HTTP Method | Endpoint | Required Permission | Description |
|-------------|----------|---------------------|-------------|
| GET | `/api/admin/doctors` | `doctors:view` | View all doctors |
| POST | `/api/admin/doctors` | `doctors:edit` | Create new doctor |
| PUT | `/api/admin/doctors` | `doctors:edit` | Update doctor details |
| DELETE | `/api/admin/doctors` | `doctors:delete` | Delete doctor |

**File:** `apps/admin/src/app/api/admin/doctors/route.js`

---

### 4. Services Management (`services:*`)

| HTTP Method | Endpoint | Required Permission | Description |
|-------------|----------|---------------------|-------------|
| GET | `/api/admin/services` | `services:view` | View all services |
| POST | `/api/admin/services` | `services:edit` | Create new service |
| PUT | `/api/admin/services` | `services:edit` | Update service details |
| DELETE | `/api/admin/services` | `services:delete` | Delete service |

**File:** `apps/admin/src/app/api/admin/services/route.js`

---

### 5. Service Approval (`vendor-approval:*`)

| HTTP Method | Endpoint | Required Permission | Description |
|-------------|----------|---------------------|-------------|
| GET | `/api/admin/services/service-approval` | `vendor-approval:view` | View services pending approval |
| PATCH | `/api/admin/services/service-approval` | `vendor-approval:edit` | Approve/reject services |
| PUT | `/api/admin/services/service-approval` | `vendor-approval:edit` | Toggle online booking |

**File:** `apps/admin/src/app/api/admin/services/service-approval/route.js`

---

### 6. Product Approval - Vendor Products (`product-approval:*`)

| HTTP Method | Endpoint | Required Permission | Description |
|-------------|----------|---------------------|-------------|
| GET | `/api/admin/product-approval/vendor` | `product-approval:view` | View vendor products pending approval |
| PATCH | `/api/admin/product-approval/vendor` | `product-approval:edit` | Approve/reject vendor products |

**File:** `apps/admin/src/app/api/admin/product-approval/vendor/route.js`

---

### 7. Product Approval - Supplier Products (`product-approval:*`)

| HTTP Method | Endpoint | Required Permission | Description |
|-------------|----------|---------------------|-------------|
| GET | `/api/admin/product-approval/supplier` | `product-approval:view` | View supplier products pending approval |
| PATCH | `/api/admin/product-approval/supplier` | `product-approval:edit` | Approve/reject supplier products |

**File:** `apps/admin/src/app/api/admin/product-approval/supplier/route.js`

---

### 8. Customer Management (`customers:*`)

| HTTP Method | Endpoint | Required Permission | Description |
|-------------|----------|---------------------|-------------|
| GET | `/api/admin/users` | `customers:view` | View all customers |

**File:** `apps/admin/src/app/api/admin/users/route.js`

---

### 9. Offers & Coupons Management (`offers-coupons:*`)

| HTTP Method | Endpoint | Required Permission | Description |
|-------------|----------|---------------------|-------------|
| GET | `/api/admin/offers` | `offers-coupons:view` | View all offers/coupons |
| POST | `/api/admin/offers` | `offers-coupons:edit` | Create new offer/coupon |
| PUT | `/api/admin/offers` | `offers-coupons:edit` | Update offer/coupon |
| DELETE | `/api/admin/offers` | `offers-coupons:delete` | Delete offer/coupon |

**File:** `apps/admin/src/app/api/admin/offers/route.js`

---

### 10. Admin Role Management (`admin-roles:*`)

| HTTP Method | Endpoint | Required Permission | Description |
|-------------|----------|---------------------|-------------|
| GET | `/api/admin` | `admin-roles:view` | View all admin users |
| POST | `/api/admin` | `admin-roles:edit` | Create new admin user |
| PUT | `/api/admin` | `admin-roles:edit` | Update admin user |
| DELETE | `/api/admin` | `admin-roles:delete` | Delete admin user |

**File:** `apps/admin/src/app/api/admin/route.js`

---

###  Subscription Plans Management (`subscription-plans:*`)

| HTTP Method | Endpoint | Required Permission | Description |
|-------------|----------|----------------------|-------------|
| GET | `/api/admin/subscription-plans` | N/A (Public) | View all subscription plans |
| POST | `/api/admin/subscription-plans` | `subscription-plans:edit` | Create new plan |
| PATCH | `/api/admin/subscription-plans` | `subscription-plans:edit` | Update plan |
| DELETE | `/api/admin/subscription-plans` | `subscription-plans:delete` | Delete plan |

**File:** `apps/admin/src/app/api/admin/subscription-plans/route.js`

---

## Permission Naming Convention

All permissions follow the format: `module:action`

### Modules:
- `vendors` - Vendor management
- `suppliers` - Supplier management
- `doctors` - Doctor management
- `services` - Service management
- `vendor-approval` - Vendor/service approval workflows
- `product-approval` - Product approval workflows
- `customers` - Customer management
- `offers-coupons` - Offers and coupons management
- `admin-roles` - Admin user management
- `subscription-plans` - Subscription plan management

### Actions:
- `view` - Read/list access
- `edit` - Create and update access
- `delete` - Delete/remove access

---

## Permission Assignment

### For Super Admin
Assign all permissions to the `permissions` array:
```json
{
  "permissions": [
    "vendors:view", "vendors:edit", "vendors:delete",
    "suppliers:view", "suppliers:edit", "suppliers:delete",
    "doctors:view", "doctors:edit", "doctors:delete",
    "services:view", "services:edit", "services:delete",
    "vendor-approval:view", "vendor-approval:edit",
    "product-approval:view", "product-approval:edit",
    "customers:view",
    "offers-coupons:view", "offers-coupons:edit", "offers-coupons:delete",
    "admin-roles:view", "admin-roles:edit", "admin-roles:delete",
    "subscription-plans:edit", "subscription-plans:delete"
  ]
}
```

### For Regional Admin
Assign selected permissions based on responsibility:
```json
{
  "permissions": [
    "vendors:view", "vendors:edit",
    "suppliers:view", "suppliers:edit",
    "doctors:view", "doctors:edit",
    "services:view", "services:edit",
    "vendor-approval:view", "vendor-approval:edit",
    "customers:view"
  ]
}
```

### For Staff (Restrictive Example)
Assign minimal permissions:
```json
{
  "permissions": [
    "vendors:view",
    "suppliers:view",
    "customers:view"
  ]
}
```

### For Staff (Approval Only Example)
Grant only approval permissions:
```json
{
  "permissions": [
    "vendor-approval:view",
    "vendor-approval:edit",
    "product-approval:view",
    "product-approval:edit"
  ]
}
```

---

## Testing Permissions

### Test Case 1: Staff with Delete Permission Only
**Assigned Permission:** `["suppliers:delete"]`

**Expected Behavior:**
- ✅ Can delete suppliers (DELETE `/api/admin/suppliers`)
- ❌ Cannot view suppliers (GET `/api/admin/suppliers`)
- ❌ Cannot edit suppliers (PUT `/api/admin/suppliers`)
- ❌ Cannot approve suppliers (PATCH `/api/admin/suppliers`)

### Test Case 2: Staff with Edit Permission Only
**Assigned Permission:** `["vendor-approval:edit"]`

**Expected Behavior:**
- ✅ Can approve/reject services (PATCH `/api/admin/services/service-approval`)
- ❌ Cannot view approval list (GET `/api/admin/services/service-approval`)

### Test Case 3: Staff with View Permission Only
**Assigned Permission:** `["vendors:view"]`

**Expected Behavior:**
- ✅ Can view vendors (GET `/api/admin/vendor`)
- ❌ Cannot create vendors (POST `/api/admin/vendor`)
- ❌ Cannot edit vendors (PUT `/api/admin/vendor`)
- ❌ Cannot delete vendors (DELETE `/api/admin/vendor`)

---

## Troubleshooting

### Issue: User has role but still gets 403 Forbidden

**Cause:** Missing permission in the `permissions` array

**Solution:** Add the required permission string to the user's `permissions` field in the database

```javascript
// Example: Grant vendor edit permission
await AdminUser.findByIdAndUpdate(userId, {
  $addToSet: { permissions: "vendors:edit" }
});
```

### Issue: User can access routes they shouldn't

**Cause:** Permission string is misspelled or too broad

**Solution:** Verify:
1. Permission string exactly matches the one in the route
2. User only has necessary permissions
3. No wildcard or overly permissive permissions

---

## Implementation Checklist

- [x] Vendor Management (`vendors:*`)
- [x] Supplier Management (`suppliers:*`)
- [x] Doctor Management (`doctors:*`)
- [x] Services Management (`services:*`)
- [x] Service Approval (`vendor-approval:*`)
- [x] Product Approval - Vendor (`product-approval:*`)
- [x] Product Approval - Supplier (`product-approval:*`)
- [x] Customer Management (`customers:*`)
- [x] Offers & Coupons (`offers-coupons:*`)
- [x] Admin Role Management (`admin-roles:*`)
- [x] Subscription Plans (`subscription-plans:*`)

---

## Future Enhancements

1. **Permission Groups**: Create predefined permission sets (e.g., "Approval Manager", "View Only")
2. **Dynamic Permission UI**: Allow Super Admins to manage permissions via the admin panel
3. **Audit Logging**: Track who accessed what using which permissions
4. **Permission Inheritance**: Allow permissions to inherit from roles
5. **Granular Product Permissions**: Separate permissions for vendor vs supplier products

---

## Support

For issues or questions regarding permissions:
- Review this guide carefully
- Check the middleware implementation in `apps/admin/src/middlewareAdmin.js`
- Verify permission strings in API route files
- Test with different permission combinations

