> **Status: deferred, not part of MVP.** Neptune's MVP go-to-market (see `prd.md` Section 10) is sales-led — custom $3-15K/month pricing, demo → paid trial, manual invoicing. Run this prompt only once a self-serve/lower-priced tier is introduced and in-app checkout is actually needed (`prd.md` Section 6, Non-MVP scope).

You are a senior full-stack developer specializing in SaaS payment integration. Your job is to fully implement a payment gateway into this codebase — from backend order creation to frontend checkout to webhook handling — so that users can pay and the system automatically updates their access.

This is a SaaS product. There is no physical delivery. All access is digital and granted instantly after payment is confirmed.

---

## STEP 1 — GATHER INFORMATION

Ask me these questions one by one. Do not proceed until I answer:

1. Which payment gateway are you integrating?
   (Razorpay / Cashfree / Stripe / PayU / Instamojo / PhonePe / CCAvenue / PayPal / Other)

2. Paste your API credentials:
   - Public Key / Key ID / App ID / Client ID:
   - Secret Key / Salt / Client Secret:
   - (If PhonePe or CCAvenue, also share Merchant ID and Salt Index/Working Key)

3. What is your tech stack?
   - Frontend: (React / Next.js / Vue / HTML + JS / Other)
   - Backend: (Node.js + Express / Next.js API Routes / Python Flask / Python FastAPI / Laravel / Other)
   - Database: (MongoDB / PostgreSQL / MySQL / Supabase / Firebase / Other)
   - Hosting/Deployment: (Vercel / Netlify / Railway / VPS / Other)

4. What are you selling?
   - One-time payment (lifetime access or fixed fee)
   - Monthly subscription
   - Annual subscription
   - Multiple plans (if yes, list plan names and prices)

5. Do you already have these pages on your website? (answer Yes / No / Needs to be created)
   - Privacy Policy
   - Terms & Conditions
   - Refund & Cancellation Policy
   - Contact Us
   - Pricing Page

6. What should happen after a successful payment?
   (Examples: unlock a dashboard, change user role to "paid", send a welcome email, redirect to a specific page)

---

## STEP 2 — SEARCH FOR LATEST DOCS

Before writing any code, do a web search for:
"[GATEWAY NAME] official API documentation 2025"
"[GATEWAY NAME] webhook integration [BACKEND LANGUAGE] 2025"

Read the actual documentation and confirm:
- The correct API endpoint URLs for this gateway
- The exact header names and authentication method
- The correct signature verification method for webhooks
- Any recent SDK version changes

State which version of the gateway's SDK or API version you are using and where you found it.

---

## STEP 3 — CREATE MISSING PAGES

For every page the user said "Needs to be created", generate the complete page content now.

All pages must be:
- Consistent with the existing design system in the codebase
- In the correct file format for the tech stack (e.g., .jsx for React, .vue for Vue)
- Placed in the correct folder (e.g., /pages/ or /app/ depending on framework)
- Linked in the website footer

### Privacy Policy
Include: what data is collected, how payment data is handled, that Razorpay/Stripe/etc. processes payments, data retention policy, user rights.

### Terms & Conditions
Include: what the SaaS service does, subscription terms, auto-renewal if applicable, acceptable use, account termination, governing law (India for Indian gateways, US for Stripe/PayPal).

### Refund & Cancellation Policy
Include: how cancellation works for subscriptions, whether refunds are given (pro-rata or not), the no-refund window (e.g., after 7 days), how to request a refund (email address). Keep it fair and legally sensible. Do NOT mention shipping or physical delivery anywhere.

### Contact Us
Include: support email, support phone number (ask me for these), business name ("99sols.ai", the maker of Neptune), city. Keep it clean and professional.

### Pricing Page
Generate a clean pricing section using the plans I provided. Include what's in each plan, a CTA button for each plan that triggers the payment flow.

---

## STEP 4 — BACKEND IMPLEMENTATION

Build the complete backend payment flow:

### A. Install Dependencies
Give me the exact install command for the official SDK of the selected gateway. Use the latest stable version found in the docs.

### B. Environment Variables
Show me the exact .env file entries needed:

GATEWAY_KEY_ID=your_key_id_here GATEWAY_KEY_SECRET=your_secret_here GATEWAY_WEBHOOK_SECRET=your_webhook_secret_here

Use the actual variable names the SDK expects. Never hardcode keys in the source code.

### C. Create Order / Payment Session Endpoint
Build a POST route: `/api/payment/create-order`
- Accept: `{ planId, userId, amount, currency }`
- Create an order/session using the gateway's API
- Return the order ID and any other fields needed by the frontend
- Use exact field names from the gateway documentation
- Include full error handling

### D. Webhook Handler Endpoint
Build a POST route: `/api/payment/webhook`
- Verify the webhook signature using the gateway's exact method (HMAC, RSA, etc.)
- On payment success: update the user's record in the database to mark them as paid, set their plan, set expiry date
- On payment failure: log it, do not update the user
- Return HTTP 200 to acknowledge receipt
- Never trust a webhook without signature verification

### E. Payment Verification (for gateways that use client-side callback)
For gateways like Razorpay that return payment details in the frontend callback:
Build a POST route: `/api/payment/verify`
- Accept the payment ID, order ID, and signature from the frontend
- Re-verify the signature on the server
- Only after server-side verification: mark user as paid in the database
- Return success or failure to the frontend

---

## STEP 5 — FRONTEND IMPLEMENTATION

Build the complete frontend payment flow:

### A. Load the Payment SDK
Add the gateway's JavaScript SDK in the correct way for the framework:
- For Next.js: use next/script or a dynamic import
- For React: load in useEffect or via a Script component
- For HTML: add the script tag before closing body
- Use the exact CDN URL from the official docs

### B. Payment Button / Trigger
Create a `<PaymentButton>` component (or equivalent) that:
- Takes `planId` and `amount` as props
- On click: hits `/api/payment/create-order` to get the order ID
- Passes the order ID to the gateway's checkout function
- Opens the payment modal or redirects to hosted checkout
- On success callback: hits `/api/payment/verify` (if needed)
- On success confirmation: redirects user to a success page or updates UI state
- On failure: shows a friendly error message (not a raw error code)

### C. Success Page
Create a `/payment/success` page that:
- Shows a thank you message
- Displays what the user just unlocked
- Has a button to go to the dashboard

### D. Failure Page
Create a `/payment/failed` page that:
- Shows a friendly message
- Offers a retry button
- Provides a support email link

---

## STEP 6 — DATABASE SCHEMA

Based on the database the user is using, show the exact schema update needed:

Add these fields to the Users table/collection:
- `isPaid` (boolean, default false)
- `plan` (string: "free" / "monthly" / "annual" / "lifetime")
- `planExpiresAt` (date, null for lifetime)
- `paymentId` (string, the gateway's payment ID)
- `orderId` (string, the gateway's order ID)
- `paymentGateway` (string: "razorpay" / "stripe" / etc.)
- `paidAt` (date)

Create a separate Payments/Transactions collection/table:
- `userId`
- `orderId`
- `paymentId`
- `amount`
- `currency`
- `status` ("created" / "paid" / "failed" / "refunded")
- `gateway`
- `webhookPayload` (raw JSON for debugging)
- `createdAt`
- `updatedAt`

Show the exact model/schema code for the user's database.

---

## STEP 7 — WEBHOOK URL SETUP

After the code is built, tell me exactly:

1. What the webhook URL will be:
   `https://yourdomain.com/api/payment/webhook`

2. Where to paste this in the gateway dashboard:
   Give step-by-step navigation for the selected gateway.

3. Which events to enable in the webhook settings:
   List only the relevant ones (payment success, payment failed, subscription events if applicable).

4. How to get the webhook secret from the dashboard and where to put it in .env.

---

## STEP 8 — TESTING GUIDE

Give me:

1. Test credentials specific to this gateway (test card numbers, test UPI IDs, test net banking credentials)

2. How to run a test payment end to end:
   - Start your local server
   - Open the pricing page
   - Click buy
   - Use test credentials
   - Confirm you see the success page
   - Check the database: user's isPaid should be true

3. How to simulate a webhook locally:
   - If Razorpay: use their dashboard's webhook test feature
   - If Stripe: use Stripe CLI (`stripe listen --forward-to localhost:3000/api/payment/webhook`)
   - For others: use ngrok to expose localhost + paste ngrok URL as webhook in the dashboard

4. What to check before switching to live:
   - [ ] Replace test API keys with live keys in .env
   - [ ] Webhook URL is your live domain, not localhost
   - [ ] SSL is active (https, not http)
   - [ ] Do a real ₹1 test transaction
   - [ ] Confirm webhook is received and user is updated in DB

---

## CONSTRAINTS — ALWAYS FOLLOW THESE

- Never put API keys or secrets in frontend code. All sensitive keys go backend only.
- Never trust a payment as complete until the webhook confirms it server-side.
- This is a SaaS product — never mention shipping, delivery, or physical goods anywhere in the code or pages you create.
- All code must have comments explaining what each block does, written in plain English so a non-technical founder can follow it.
- If any part of the gateway's documentation has changed since your training, clearly say so and tell me which URL to check.
- Use the gateway's official SDK where available — do not manually write raw HTTP calls unless there is no SDK.
- Match the existing code style, folder structure, and naming conventions already in this codebase. Do not introduce new patterns unless necessary.

---

Now start. Ask me the questions from Step 1.




