# Blegab Luxury Wigs - Complete Buyer Journey Workflow

## Overview
This document outlines the complete workflow from store browsing to order fulfillment as implemented in the frontend.

---

## **STEP 1-6: INITIAL PURCHASE FLOW**

### Step 1: STORE/SHOP
- **File:** `shop.html`
- **Purpose:** Display all available wig products
- **Features:**
  - Product grid with images, names, prices
  - Filter and search functionality
  - Quick "Add to Cart" buttons
  - **Next:** Click product to view details or Add to Cart

### Step 2: PRODUCT VIEW
- **File:** `shop.html` (modal popup)
- **Purpose:** Show detailed product information
- **Features:**
  - Product images
  - Full description, reviews, ratings
  - Size, color, and style options
  - Stock availability
  - **Next:** Add to cart with selected options

### Step 3: ADD TO CART
- **File:** `assets/js/cart.js`
- **Purpose:** Add selected product to cart
- **Features:**
  - Store cart in localStorage via `BLEGAB_CART`
  - Update cart count in header
  - Show confirmation message
  - **Next:** User can continue shopping or go to cart

### Step 4: CART SUMMARY
- **File:** `cart.html`
- **Purpose:** Review cart contents and summary
- **Features:**
  - Display all cart items with quantities
  - Calculate subtotal
  - Show shipping (FREE)
  - Display total
  - Qty +/- controls and remove buttons
  - **Next:** Click "Proceed to Checkout" button

### Step 5: CHECKOUT OPTIONS
- **File:** `cart.html` (checkout modal)
- **Purpose:** Choose checkout method (guest or login)
- **Features:**
  - Option to checkout as guest
  - Option to create account (optional)
  - **Loader Active:** "Proceed to Checkout" button shows spinner when opening modal
  - **Next:** Choose checkout method

### Step 6: CUSTOMER INFO & SHIPPING ADDRESS
- **File:** `assets/js/checkout.js`
- **Purpose:** Collect shipping and personal information
- **Features:**
  - First name, last name, email, phone
  - Country, state, city dropdown
  - Street address and ZIP code
  - Form validation
  - **Loader Active:** "Continue to Stripe" button shows spinner when submitting
  - **Next:** Review order and select payment method

---

## **STEP 7-12: PAYMENT & ORDER PROCESSING**

### Step 7: SHIPPING CALCULATION
- **File:** `assets/js/checkout.js`
- **Purpose:** Automatically calculate shipping based on destination
- **Features:**
  - Shipping rules defined in checkout.js
  - FREE shipping to select countries
  - Variable shipping for others
  - Updates order total automatically

### Step 8: SHIPPING RULES
- **Currencies/Rules:**
  - ✓ Free shipping: Nigeria, USA, Canada, UK
  - £20-50: Other destinations
  - Calculated at checkout

### Step 9: ORDER SUMMARY
- **File:** `assets/js/checkout.js`
- **Purpose:** Final review before payment
- **Features:**
  - Itemized product list with prices
  - Subtotal calculation
  - Shipping cost
  - **Total amount to charge**

### Step 10: PAYMENT METHOD SELECTION
- **File:** `assets/js/checkout.js`
- **Options:**
  - Stripe card payment (primary)
  - Future: Google Pay, Apple Pay, Afterpay
- **Features:**
  - Secure payment badge
  - Trust indicators

### Step 11: STRIPE PAYMENT
- **Provider:** Stripe (external)
- **Features:**
  - Card number, expiry, CVC fields
  - Secure processing
  - Handles payment failures
  - **Next:** Payment success or error

### Step 12: PAYMENT RESULT
- **File:** `success.html`
- **Purpose:** Show payment confirmation
- **Features:**
  - Display order ID, amount, email, status
  - Wait for payment verification (with retries)
  - Automatic redirect to order-confirmation after 3 seconds
  - Save order data to sessionStorage

---

## **STEP 13-18: POST-PAYMENT & ADMIN FLOW**

### Step 13: ORDER CONFIRMATION (TO BUYER)
- **File:** `order-confirmation.html`
- **Purpose:** Buyer receives order confirmation
- **Features:**
  - Display order ID, items, totals
  - Shipping address confirmation
  - Estimated delivery date
  - Payment method used
  - **CTA Buttons:**
    - ✅ **Track Your Order** → Links to `order-tracking.html?orderId=[ORDER_ID]`
    - Continue Shopping → Back to shop.html

### Step 14: ORDER CREATED (BACKEND)
- **API Endpoint:** `POST /api/orders/checkout`
- **Purpose:** Backend creates order record
- **Status:** Processing

### Step 15: ORDER SENT TO ADMIN DASHBOARD
- **File:** `admin/admin-orders.html`
- **Purpose:** Admin views new orders
- **Features:**
  - Order list with status, customer, date
  - Click to view full order details
  - **Next:** Process order

### Step 16: ADMIN VIEW ORDER
- **File:** `admin/admin-orders.html` (detail view)
- **Purpose:** Admin reviews order details
- **Features:**
  - Customer information
  - Product(s) ordered with quantities
  - Shipping address
  - Payment information
  - Order total and status

### Step 17: PROCESS ORDER
- **File:** `assets/js/admin-orders.js`
- **Purpose:** Admin prepares order for shipment
- **Features:**
  - Mark items as picked/packed
  - Generate packing slip
  - **Status changes:** Processing → Ready to Ship

### Step 18: UPDATE ORDER STATUS
- **File:** `assets/js/admin-orders.js`
- **Purpose:** Track order through fulfillment
- **Status Flow:**
  - ⏳ Processing
  - 📦 Ready to Ship
  - 🚚 Shipped (with tracking)
  - 🎉 Delivered

---

## **TRACKING: BUYER PERSPECTIVE**

### Option A: From Confirmation Page
1. User clicks "Track Your Order" on order-confirmation.html
2. Automatically loads `order-tracking.html?orderId=[ORDER_ID]`
3. Displays tracking info (if available)

### Option B: Manual Tracking
1. User navigates to `order-tracking.html`
2. Enters Order Number and Email
3. **Loader Active:** "Track Package" button shows spinner during search
4. System fetches order status from backend
5. Displays:
   - Order status (Processing, Shipped, Delivered, etc.)
   - Tracking number (if shipped)
   - Delivery timeline with milestones
   - Download receipt button

### Option C: My Orders Page
1. User navigates to `my-orders.html` (via profile)
2. Views all personal orders
3. Click any order to view details or track

---

## **FILES CREATED/MODIFIED**

### HTML Pages
- ✅ `index.html` - Home page
- ✅ `shop.html` - Product listing
- ✅ `cart.html` - Shopping cart + checkout modal
- ✅ `order-confirmation.html` - Order confirmation page
- ✅ `order-tracking.html` - Order tracking page
- ✅ `my-orders.html` - User order history
- ✅ `order-details.html` - Single order details view
- ✅ `success.html` - Payment success (temporary page)

### CSS Files
- ✅ `assets/css/base.css` - Global styles + button loaders
- ✅ `assets/css/cart.css` - Cart page styles
- ✅ `assets/css/checkout.css` - Checkout modal styles
- ✅ `assets/css/order-confirmation.css` - Confirmation page styles
- ✅ `assets/css/order-tracking.css` - Tracking page styles
- ✅ `assets/css/orders.css` - Orders list styles

### JavaScript Files
- ✅ `assets/js/main.js` - Global utilities + button loader helper
- ✅ `assets/js/cart.js` - Cart functionality
- ✅ `assets/js/checkout.js` - Checkout flow + Stripe integration
- ✅ `assets/js/order-confirmation.js` - Confirmation page logic
- ✅ `assets/js/order-tracking.js` - Tracking page logic
- ✅ `assets/js/success.js` - Payment verification and redirect
- ✅ `assets/js/orders.js` - Order listing logic

### Admin Files
- ✅ `admin/admin-orders.html` - Admin order management
- ✅ `admin/assets/js/admin-orders.js` - Admin order handling

---

## **KEY FEATURES IMPLEMENTED**

### 🔄 Loading States
- ✅ Checkout button shows spinner when opening modal
- ✅ Continue to Stripe button shows spinner during payment processing
- ✅ Track Package button shows spinner during search
- ✅ Buttons remain clickable during loading (visual feedback only)

### 💾 Data Persistence
- ✅ Cart stored in localStorage
- ✅ Order data saved to sessionStorage after payment
- ✅ Order ID passed via URL parameters for tracking

### 🔗 Workflow Links
- ✅ Confirmation page links to tracking with order ID
- ✅ Success page auto-redirects to confirmation
- ✅ Orders page links to details/tracking

### 📱 Responsive Design
- ✅ Dark theme throughout
- ✅ Gold (#D4AF37) brand color
- ✅ White/light text on dark backgrounds
- ✅ Mobile-optimized layouts

---

## **TESTING CHECKLIST**

- [ ] Browse products on shop.html
- [ ] Add items to cart
- [ ] View cart summary
- [ ] Click "Proceed to Checkout" (should show loader and modal)
- [ ] Fill in shipping info
- [ ] Click "Continue to Stripe" (should show loader)
- [ ] Mock payment or use Stripe test card
- [ ] Verify success.html displays order info
- [ ] Verify auto-redirect to order-confirmation after 3 seconds
- [ ] Verify "Track Your Order" button has order ID in URL
- [ ] On order-tracking.html, verify order loads automatically
- [ ] Test manual tracking by entering order ID + email
- [ ] Verify loader shows on "Track Package" button
- [ ] Test my-orders.html (requires user account)
- [ ] Verify admin-orders.html shows orders (admin login required)

---

## **NEXT STEPS FOR BACKEND DEVELOPER**

1. **Create API Endpoints:**
   - `POST /api/orders/checkout` - Create order session
   - `POST /api/orders/verify-payment/:sessionId` - Verify Stripe payment
   - `GET /api/orders/:orderId/track?email=...` - Get tracking info
   - `GET /api/orders/user/:userId` - Get user's orders

2. **Database Schema:**
   - Store order with items, pricing, shipping, customer info, payment status
   - Track order status progression (Processing → Shipped → Delivered)
   - Store tracking numbers

3. **Integrations:**
   - Complete Stripe integration
   - Shipping provider API (for real tracking)
   - Email notification system

4. **Admin Features:**
   - Implement order status updates
   - Generate shipping labels
   - Send tracking info to customers

---

## **VERSION**
- Created: August 2026
- Frontend Status: ✅ COMPLETE
- Backend Status: ⏳ IN PROGRESS (by other developer)
