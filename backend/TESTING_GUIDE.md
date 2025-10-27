# Testing Guide - Payment & Return/Replacement Features

## Prerequisites
1. Restart the backend server after the code changes
2. Clear browser cache or use incognito mode to ensure fresh data
3. Have at least one test user account and one admin account

## Test 1: Payment Status for Online Payments

### Steps:
1. Login as a regular user
2. Add products to cart
3. Go to checkout
4. Select payment method: **PayPal** or **Stripe**
5. Fill in card details (test card: 4111111111111111, any future date, any 3-digit CVV)
6. Complete the order
7. Go to "My Orders"

### Expected Result:
- Order should show: **✓ Payment Successful** with payment date
- In order details page, payment status should be green with "✓ Payment Successful"

## Test 2: Payment Status for Cash on Delivery

### Steps:
1. Create a new order with payment method: **Cash on Delivery (COD)**
2. Go to "My Orders"

### Expected Result:
- Payment status should show: **Pending** (yellow/warning color)

### Then:
3. Login as admin
4. Go to Orders list
5. Find the COD order
6. Change status from "Pending" → "Shipped" (enter courier details)
7. Change status from "Shipped" → "Delivered"
8. Logout and login back as the user
9. Check "My Orders" again

### Expected Result:
- Payment status should now show: **✓ Payment Successful** with payment date

## Test 3: Return Request

### Steps:
1. As a user, find an order with status "Delivered"
2. Click on the order to view details
3. Scroll down to see "Order Actions" section
4. Click **"Request Return"** button
5. Enter a reason (e.g., "Product is damaged")
6. Submit the request

### Expected Result:
- Success message: "Return request submitted successfully"
- Return button should be replaced with return status info showing "Pending"

### Admin Side:
7. Login as admin
8. Go to Orders list
9. Find the order with return request (should have a 🔄 icon)
10. Click the return icon to open the modal
11. Review the reason
12. Try each action: Approve, Reject, or Mark Completed
13. Add admin notes (e.g., "Approved - please ship the item back")

### Expected Result:
- Status should update
- User should see the admin notes when viewing their order

## Test 4: Replacement Request

### Steps:
1. Same as Return Request but click **"Request Replacement"** instead
2. Enter reason (e.g., "Wrong size received")
3. Submit

### Expected Result:
- Similar flow as return request
- Admin sees 🔁 icon for replacement requests

## Test 5: Search & Filter Orders (Admin)

### Steps:
1. Login as admin
2. Go to Orders list
3. Test search by:
   - User email
   - User name
   - Order status (e.g., type "delivered")
   - Payment method (e.g., type "PayPal")
4. Test filters:
   - Status dropdown
   - Paid/Unpaid dropdown
   - Date range filters

### Expected Result:
- All filters should work correctly
- Search should find orders matching the criteria

## Common Issues & Solutions

### Issue 1: "Failed to submit return request"
**Solution:** 
- Make sure the backend server is restarted
- Check that the order status is "Delivered"
- Verify you're logged in with the correct user who owns the order

### Issue 2: Payment status still shows "Pending" for online payments
**Solution:**
- Clear browser cache
- Check browser console for errors
- Verify the payment method is exactly "PayPal" or "Stripe" (case-sensitive)

### Issue 3: Return/Replacement buttons not showing
**Solution:**
- Order must have status "Delivered"
- Check if request was already submitted (can only request once)

### Issue 4: 404 Error on return/replacement submission
**Solution:**
- Restart backend server to load new routes
- Check that you're using the latest code

## API Endpoints to Test Manually (Optional)

### Create Order (with online payment):
```bash
POST http://localhost:5000/api/orders
Headers: Authorization: Bearer YOUR_TOKEN
Body:
{
  "orderItems": [...],
  "shippingAddress": {...},
  "paymentMethod": "PayPal",
  "itemsPrice": 100,
  "shippingPrice": 10,
  "totalPrice": 110
}
```

### Request Return:
```bash
POST http://localhost:5000/api/orders/ORDER_ID/return
Headers: Authorization: Bearer YOUR_TOKEN
Body:
{
  "reason": "Product is damaged"
}
```

### Update Return Status (Admin):
```bash
PUT http://localhost:5000/api/orders/ORDER_ID/return-status
Headers: Authorization: Bearer ADMIN_TOKEN
Body:
{
  "status": "Approved",
  "adminNotes": "Please ship back the item"
}
```

## Notes
- All changes require backend server restart
- Frontend changes may require clearing cache
- Test with both user and admin accounts
- Check both list view and detail view for consistency
