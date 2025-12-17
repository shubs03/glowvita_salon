# Review Approval Workflow

## Overview
This document describes the new review approval workflow where reviews submitted by users must be approved by the product owner (vendor or supplier) before appearing in the user's "My Reviews" section.

## Workflow

### 1. User Submits Review
1. User writes and submits a review for a product
2. Review is saved to the database with `isApproved: false` by default
3. User receives confirmation that the review is pending approval

### 2. Review Notification (Future Enhancement)
- System notifies the product owner (vendor/supplier) of the new pending review
- Notification appears in their CRM dashboard

### 3. Owner Reviews and Approves
1. Vendor/Supplier logs into their CRM dashboard
2. Navigates to the Reviews section
3. Sees pending reviews for their products
4. Can approve or reject each review
5. Upon approval, `isApproved` is set to `true` and `approvedAt` is set

### 4. Review Appears in User Profile
1. Once approved, the review appears in the user's "My Reviews" section
2. User can see their approved reviews in their profile

## Technical Implementation

### Database Changes
- Reviews collection already has `isApproved` (Boolean) and `approvedAt` (Date) fields
- No schema changes required

### API Endpoints Modified

#### `/api/products/reviews/[productId]` (POST)
- Creates reviews with `isApproved: false` by default
- Returns message informing user that review is pending approval

#### `/api/client/reviews` (GET)
- Only returns reviews where `isApproved: true`
- Ensures users only see approved reviews in their profile

#### `/api/crm/reviews` (GET)
- Returns reviews for products owned by the authenticated vendor/supplier
- Supports filtering by approval status (`pending` or `approved`)
- Works for both vendors and suppliers

#### `/api/crm/reviews/[reviewId]` (PATCH)
- Allows vendors/suppliers to approve/reject reviews for their products
- Validates that the requesting user owns the product being reviewed

### Frontend Changes

#### Product Detail Page
- Updated success message to inform users that reviews are pending approval

#### Profile Reviews Page
- Updated empty state message to explain the approval process

## Roles and Permissions

### Regular Users (Clients)
- Can submit reviews for products
- Can only see their own reviews that have been approved
- Cannot approve/reject reviews

### Vendors
- Can see and manage reviews for their products
- Can see and manage reviews for their salon services
- Can see and manage reviews for their doctors
- Can approve/reject reviews

### Suppliers
- Can see and manage reviews for their products only
- Can approve/reject reviews

### Admins
- Can see all reviews across the platform
- Can moderate reviews if needed

## Future Enhancements
1. Email/SMS notifications to vendors/suppliers when new reviews are submitted
2. Email/SMS notifications to users when their reviews are approved/rejected
3. Bulk approval/rejection of reviews
4. Review reporting and moderation features