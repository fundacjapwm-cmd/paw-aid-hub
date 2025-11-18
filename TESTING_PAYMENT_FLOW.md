# Testing PayU Payment Flow - Complete Guide

This guide will help you test the complete payment flow from adding items to cart through PayU payment and back to success/failure pages.

## Prerequisites

### 1. PayU Sandbox Account Setup
Before testing, you need PayU sandbox credentials:

1. **Register for PayU Sandbox Account:**
   - Go to: https://developers.payu.com/
   - Register for a sandbox account
   - You will receive:
     - `POS_ID` (Merchant POS ID)
     - `CLIENT_ID` (OAuth Client ID)
     - `CLIENT_SECRET` (OAuth Client Secret)
     - `MD5_KEY` (Second key for signature verification)

2. **Add Credentials to Lovable:**
   - These should already be added as secrets in your project
   - If not, you can update them in the Cloud dashboard

### 2. Resend Email Account
1. Sign up at https://resend.com
2. Verify your domain or use the test domain
3. Create an API key
4. Add `RESEND_API_KEY` secret to your project

## Testing Flow

### Step 1: Add Items to Cart

**From Homepage (Index):**
1. Navigate to the homepage (`/`)
2. You should see animal wishlist cards
3. Click "Dodaj" (Add) button on any product
4. A toast notification should appear confirming the item was added
5. The cart icon in the navigation should update with the item count

**From Animal Profile Page:**
1. Navigate to an animal profile (e.g., `/zwierze/1`)
2. Click "Dodaj" on individual wishlist items
3. OR click "Kup wszystko dla [Animal Name]" to add all items
4. Cart should update in the navigation

### Step 2: View Cart

1. Click the shopping cart icon in the navigation
2. A drawer should slide in from the right showing:
   - All items in cart
   - Product names and prices
   - Quantity controls (+/-)
   - Animal names for each item
   - Total amount
   - "Przejdź do płatności" (Go to Checkout) button

3. Test cart operations:
   - Increase/decrease quantities
   - Remove items
   - Clear cart

### Step 3: Checkout Process

1. Click "Przejdź do płatności" in cart drawer
2. You should be redirected to `/checkout`
3. The checkout page should show:
   - Order summary with all items
   - Your name (pre-filled from profile)
   - Your email (pre-filled from user account)
   - Total amount
   - "Zapłać [amount] zł" button

4. Verify your details and click the payment button

**What happens:**
- An edge function `create-payu-order` is called
- Order is created in the database
- Order items are saved
- PayU OAuth token is obtained
- PayU order is created
- You are redirected to PayU payment page

### Step 4: PayU Payment Page

You will be redirected to PayU's sandbox payment page. Here you can:

**Option A: Complete Payment**
1. Use PayU sandbox test card:
   - Card number: `4444 3333 2222 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
2. Complete the payment
3. PayU will redirect you to the success page

**Option B: Cancel Payment**
1. Click "Anuluj" (Cancel) on PayU page
2. PayU will redirect you to the failure page

### Step 5: Payment Success Flow

**After successful payment:**

1. **Redirect to Success Page** (`/payment-success`)
   - Shows green checkmark
   - Displays "Płatność zakończona sukcesem!"
   - Shows order details with order ID
   - Lists all purchased products
   - Shows total amount
   - Payment status badge

2. **Webhook Notification** (automatic):
   - PayU sends notification to `payu-webhook` edge function
   - Webhook verifies signature
   - Updates order status to 'completed'
   - Triggers email confirmation

3. **Email Confirmation** (automatic):
   - `send-order-confirmation` edge function is called
   - Beautiful HTML receipt email is sent
   - Email includes:
     - Order confirmation number
     - Full item list with prices
     - Total amount
     - Date and time
     - Thank you message

4. **User Actions Available:**
   - "Zobacz historię darowizn" → Go to profile
   - "Wróć do strony głównej" → Go to homepage

### Step 6: Payment Failure Flow

**After cancelled/failed payment:**

1. **Redirect to Failure Page** (`/payment-failure`)
   - Shows red X icon
   - Displays "Płatność nieudana"
   - Explains what happened
   - Shows possible reasons

2. **Automatic Actions:**
   - Order status updated to 'cancelled'
   - Payment status set to 'failed'

3. **User Actions Available:**
   - "Spróbuj ponownie" → Return to checkout
   - "Wróć do strony głównej" → Go to homepage

## Monitoring and Debugging

### Check Edge Function Logs

You can view logs in the Cloud dashboard to debug issues:

1. Open Cloud dashboard (click the Cloud tab in Lovable)
2. Go to Edge Functions section
3. Select the function you want to debug:
   - `create-payu-order` - Order creation logs
   - `payu-webhook` - Payment notification logs
   - `send-order-confirmation` - Email sending logs

### Database Verification

Check the database to verify orders were created:

1. **Orders table:**
   - Should have new record with status 'pending' or 'completed'
   - Check `payment_status` field
   - Verify `total_amount` matches cart total

2. **Order Items table:**
   - Should have records for each cart item
   - Check quantities and prices

3. **View in Cloud Dashboard:**
   - Go to Cloud → Database → Tables
   - Select 'orders' or 'order_items' table

## Common Issues and Solutions

### Issue: "Unauthorized" error during checkout
**Solution:** Make sure user is logged in (`/auth`)

### Issue: PayU authentication failed
**Solution:** Verify PayU credentials are correct in secrets

### Issue: Email not received
**Solution:** 
- Check Resend dashboard for send status
- Verify email domain is verified in Resend
- Check spam folder

### Issue: Webhook not updating order status
**Solution:**
- Verify `payu-webhook` is not verifying JWT (should be public)
- Check webhook URL is correct in PayU dashboard
- Review webhook logs for errors

### Issue: Redirect URLs not working
**Solution:**
- Edge function automatically detects origin from request headers
- Make sure you're testing from the actual preview URL
- Check PayU dashboard for allowed redirect URLs

## Testing Checklist

- [ ] Add items to cart from homepage
- [ ] Add items from animal profile page
- [ ] View cart drawer with all items
- [ ] Update quantities in cart
- [ ] Remove items from cart
- [ ] Navigate to checkout page
- [ ] Verify pre-filled user details
- [ ] Complete checkout process
- [ ] Redirected to PayU payment page
- [ ] Complete payment with test card
- [ ] Redirected to success page
- [ ] Order details displayed correctly
- [ ] Receive confirmation email
- [ ] Check order in database
- [ ] Test payment cancellation
- [ ] Redirected to failure page
- [ ] Verify error handling

## Production Considerations

Before going live with real payments:

1. **Switch to Production Credentials:**
   - Replace sandbox credentials with production ones
   - Update PayU POS_ID, CLIENT_ID, CLIENT_SECRET
   - Use production PayU URLs

2. **Update PayU Endpoints:**
   - Change from `https://secure.payu.com` (sandbox)
   - To production endpoint (provided by PayU)

3. **Verify Webhook URL:**
   - Ensure webhook URL is accessible publicly
   - Configure in PayU production dashboard

4. **Email Settings:**
   - Use your actual domain in Resend
   - Update "from" address in email function
   - Test all email scenarios

5. **Security:**
   - All secrets are encrypted in Lovable Cloud
   - Never expose API keys in frontend code
   - Webhook signature verification is enabled

## Support

If you encounter issues:
1. Check the edge function logs
2. Review database records
3. Verify all secrets are configured
4. Test with PayU sandbox first
5. Contact PayU support for payment-specific issues
