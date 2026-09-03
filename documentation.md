# Ethiopian Farmers Market Platform

## Professional Product Documentation

A facilitated B2B agricultural marketplace connecting farmers directly with verified business buyers, with secure payment integration and a direct handoff model.

---

# 1. Project Overview

The Ethiopian Farmers Market Platform is a facilitated B2B marketplace that connects farmers directly with business buyers such as restaurants, hotels, wholesalers, exporters, processors, and retailers. The platform exists to make agricultural trade more transparent, more trustworthy, and easier to transact without acting as the owner of the produce or the logistics operator.

The core idea is to structure the transaction, not to replace the physical handoff. Farmers publish available produce, business buyers discover and order it, and the platform records the trade, the approvals, and the fulfillment status.

The product is designed to prove demand first: can farmers and buyers actually transact through the platform? That question is more important than delivery automation, RFQ workflows, or heavy marketplace complexity at the start.

---

# 2. Business Requirements

The business requirement is to enable a trusted marketplace where supply and demand can meet directly, with enough verification to reduce fraud and enough structure to make transactions reliable.

Farmers must be able to create and manage produce listings with transparent pricing.

Business buyers must be able to browse, search, and place orders against real stock.

Both sides must have verified identities before higher-risk or larger-value activity is allowed.

The platform must preserve a reliable record of listings, orders, fulfillments, and payments.

Payments must be supported through a secure integration layer rather than exposed card or wallet handling in the app.

The platform must remain a facilitated marketplace and not take ownership of produce or operate delivery logistics in the core model.

Business rules are intentionally strict where trust matters. Self-dealing is blocked, stock must be reserved safely under concurrent demand, and the platform must distinguish browsing from transaction privileges.

---

# 3. User Roles & Permissions

The system uses a capability-based model. A user is first an identity, then may be approved for one or more capabilities. An admin privilege exists separately from the farmer and buyer capabilities.

| User / Role         | Main Permissions                                                                                             | Key Restrictions                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| **Visitor**         | Browse and search public listings                                                                            | Cannot create listings, order, or approve actions                                    |
| **Farmer**          | Create and manage listings, accept or reject order fulfillments, view payout history                         | Cannot approve their own capability or bypass stock and verification rules           |
| **Business Buyer**  | Browse, search, cart, checkout, and track orders                                                             | Cannot create listings or self-approve business status                               |
| **Admin — UPDATED** | Approve applications, oversee accounts, handle payment exceptions/disputes, and manage operational oversight | Does not replace farmer or buyer actions. No manual payment confirmation capability. |

The model supports a user holding both farmer and buyer capabilities when appropriate, while self-ordering from one's own listing is explicitly prevented.

**Important capability rule:** Farmer and Business Buyer are not permanent login roles selected during authentication. A user first registers as an identity and may subsequently apply for one or more capabilities. Those capabilities must be approved before the corresponding transactional privileges are granted.

---

# 4. Functional and Non-Functional Requirements

## Functional Requirements

### Authentication and Registration

* Phone-based user registration.
* Registration requires:

  * Phone number
  * Password
  * OTP verification
  * First name
  * Second name
* OTP verification is used to verify ownership of the phone number during registration.
* The password created during registration is used for subsequent authentication.
* Login is performed using:

  * Phone number
  * Password
* OTP is **not required for normal login**.
* After registration and phone verification, users may apply for farmer and/or business buyer capabilities.
* Separate application and approval flows exist for farmer and buyer capabilities.

### Marketplace

* Public browsing and searching of listings.
* Farmer listing management with price history and availability updates.
* Buyer cart and checkout across multiple farmers in a single order.
* Concurrency-safe stock reservation and order creation.
* Per-farmer order fulfillment records with accept, reject, and complete states.

### Payments

* Payment initiation through Chapa with hosted checkout.
* Signed webhook handling for payment confirmation and transaction updates.
* System automatically confirms and records payments via Chapa webhook events.
* Admin handles only exceptions, disputes, and audit review. **UPDATED**
* No manual payment confirmation workflow exists.

---

## MANDATORY CORE DATABASE LOGIC RULE

### `pending → paid` via webhook only

The system logic strictly requires:

```text
payment_status = confirmed
```

only via the Chapa webhook.

Manual payment transitions such as:

```text
pending → admin approves → paid
```

or:

```text
mark as paid manually
```

are completely prohibited.

---

## Non-Functional Requirements

**Security:** secrets protected, sensitive payment data never stored in the application.

**Reliability:** payment webhooks and order updates processed safely and idempotently.

**Performance:** responsive browsing and order operations under normal marketplace load.

**Scalability:** architecture able to grow from pilot usage to a larger multi-role marketplace.

**Auditability:** important marketplace and payment actions preserved in records.

**Maintainability:** clear separation between frontend, backend, data, and integration layers.

The platform must be robust enough to preserve trust even when users act concurrently, cancel late, or complete fulfillment outside the app.

---

# 5. Use Cases

## Register and become a verified user

A visitor registers by providing their:

* Phone number
* Password
* First name
* Second name

The platform sends an OTP to the provided phone number. The user enters the OTP to verify ownership of the phone number and complete registration.

After successful registration and verification, the user can apply for farmer and/or business buyer capabilities.

Capability approval is handled separately according to the platform's verification process.

---

## User Login

A registered and verified user logs in using:

* Phone number
* Password

The system authenticates the credentials and establishes the user's authenticated session/token.

OTP is not required for normal login.

The user's approved capabilities determine which marketplace functionality they are authorized to access.

For example:

```text
User
 ├── Farmer capability → Approved
 └── Buyer capability → Not approved
```

The user can access farmer functionality but cannot access buyer transactional functionality.

A user may also hold both capabilities:

```text
User
 ├── Farmer capability → Approved
 └── Buyer capability → Approved
```

In that case, the user may access both sets of functionality, subject to the platform's business rules.

---

## Farmer publishes produce

A verified farmer creates a listing, sets quantity and price, and updates availability as stock changes.

---

## Buyer orders produce

A verified business buyer searches listings, adds items to a cart, and places an order spanning one or more farmers.

---

## Farmer accepts or rejects fulfillment

Each farmer reviews only the fulfillment rows that belong to them and accepts or rejects based on actual stock.

---

## Payment is completed

The buyer completes payment through hosted checkout and the platform automatically records and transitions the confirmed transaction state via secure webhook processing.

---

## Admin oversight

An admin approves capabilities, monitors records, handles ledger exceptions, and manages the operational side of the marketplace.

---

# 6. User Stories

As a visitor, I want to register using my phone number, password, first name, and second name and verify my phone with an OTP so that I can create a trusted account.

As a registered user, I want to log in using my phone number and password so that I can access my account without requiring an OTP for every login.

As a user, I want to apply for farmer or business buyer capability so that I can access the functionality relevant to my business activity.

As a farmer, I want to list produce with clear quantity and price so that buyers can trust what is actually available.

As a farmer, I want to accept or reject incoming orders so that I only commit to what I can fulfill.

As a business buyer, I want to search active listings and place orders across multiple farmers so that I can source supply efficiently.

As a business buyer, I want to see the status of each fulfillment so that I know which parts of my order are confirmed or completed.

As an admin, I want to verify farmers and buyers so that the marketplace remains trustworthy.

As an admin, I want automated webhook logging of transactions so that financial records are systematically verified and auditable.

As a platform owner, I want the system to handle payments without exposing raw card or wallet data so that the integration remains secure.

---

# 7. High-Level Architecture

The architecture is organized into five main layers: client, application, data, integration, and infrastructure.

| Layer                           | Description                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client layer**                | Vue 3 web application for farmers, buyers, and admins.                                                                                                                                                                                                                                                                                                                                                           |
| **Application layer — UPDATED** | Laravel backend handling authentication, roles, listings, orders, and fulfillments. Registration uses phone number, password, OTP verification, first name, and second name. Login uses phone number and password. The application layer handles capability authorization and order processing and payment state updates automatically through Chapa webhook events. No manual payment approval workflow exists. |
| **Data layer**                  | MySQL stores users, capabilities, listings, orders, payment records, and audit-relevant business data.                                                                                                                                                                                                                                                                                                           |
| **Integration layer**           | Chapa for payment checkout and webhooks; SMS gateway for OTP delivery during registration.                                                                                                                                                                                                                                                                                                                       |
| **Infrastructure layer**        | Redis for queues and caching, NGINX as reverse proxy, and Docker Compose for deployment consistency.                                                                                                                                                                                                                                                                                                             |

The platform keeps the transactional core lean: verified users, reliable stock, order records, fulfillment records, and secure automated payment handling. That structure supports future growth without changing the basic marketplace model.

---

# Authentication Flow Summary

The authentication and capability flow is:

```text
Visitor
   ↓
Registration
   ↓
Phone + Password + First Name + Second Name
   ↓
OTP Verification
   ↓
Verified User Account
   ↓
Apply for Capabilities
   ↓
Admin Approval
   ↓
Approved Farmer / Business Buyer Capability
   ↓
Login
   ↓
Phone + Password
   ↓
Authenticated User
   ↓
Access functionality based on approved capabilities
```

The user does **not** select Farmer or Business Buyer as their authentication role during login.

Farmer and Business Buyer are **approved capabilities** that determine what the authenticated user is allowed to do.

A user may have:

```text
Farmer only
```

or:

```text
Business Buyer only
```

or, where appropriate:

```text
Farmer + Business Buyer
```

Admin privileges remain separate from these capabilities.

This authentication and capability model ensures that identity, authentication, authorization, and marketplace privileges remain clearly separated.

# updated 
 i want a small update/addendum containing ONLY the new concepts i decided on.

The new things to add are:

Buyer pays after receiving the product.
Buyer is responsible for transportation.
Payment is integrated into the platform using Chapa.
Buyer selects an available Chapa payment method at checkout.
Farmer has a registered payment destination.
The intended settlement is to the farmer rather than the platform holding the money.
Chapa webhook confirms the successful payment.
Farmer gets a notification that payment is completed.
No manual admin payout.
Platform does not take commission from each product transaction; platform revenue is through a separate monthly/yearly fee.
Admin can activate/deactivate farmer and buyer accounts, particularly for unpaid platform fees.
Inactive users cannot perform protected marketplace operations.
///////update////////////////
I want to change the current marketplace payment and account-management business logic to the following NEW business model.

IMPORTANT:
- Do NOT rewrite unrelated features.
- Do NOT remove existing Farmer/Business Buyer capabilities.
- Do NOT break the existing authentication, order, fulfillment, listing, or authorization systems.
- First inspect the existing Laravel backend and Vue frontend implementation and understand the current payment flow before modifying anything.
- Reuse the existing architecture, models, controllers, resources, policies, migrations, notifications, and routes where appropriate.
- Make the changes incrementally and professionally.
- If the current implementation conflicts with this new business model, modify it rather than keeping the old behavior.

==================================================
1. NEW PAYMENT BUSINESS MODEL
==================================================

The marketplace will use an integrated Chapa payment flow.

The buyer is responsible for transportation.

The buyer places an order, the farmer accepts it, and the buyer sends their own vehicle to collect the produce from the farmer.

The buyer pays ONLY AFTER receiving the produce.

The intended flow is:

Buyer places order
    ↓
Farmer accepts order
    ↓
Buyer sends own vehicle
    ↓
Farmer hands over produce
    ↓
Buyer receives and checks produce
    ↓
Buyer confirms "Product Received"
    ↓
"Pay Farmer" becomes available
    ↓
Buyer opens Chapa payment
    ↓
Buyer selects an available payment method
    ↓
Buyer completes payment securely through Chapa
    ↓
Chapa confirms successful payment
    ↓
Chapa webhook reaches Laravel backend
    ↓
Backend verifies webhook/payment
    ↓
Payment becomes confirmed
    ↓
Farmer receives an in-app notification
    "Payment Completed"
    ↓
Order/fulfillment can be finalized

==================================================
2. IMPORTANT: PLATFORM MUST NOT HOLD FARMER SALES MONEY
==================================================

The platform should NOT use the old flow where:

Buyer → Chapa → Platform balance → Admin payout → Farmer.

Do NOT implement the farmer product-payment flow using the Chapa Transfer API if that requires the platform to first receive and hold the buyer's money.

The intended architecture is:

Buyer
  ↓
Chapa integrated checkout
  ↓
Farmer's supported payment settlement destination
  ↓
Farmer

The platform should act as the marketplace/payment integration layer, not as the holder of farmer sales funds.

Use Chapa's supported subaccount/direct settlement mechanism if it supports this exact marketplace configuration.

IMPORTANT:
Do NOT assume unsupported Chapa functionality.

Before implementing the final settlement logic, inspect the existing Chapa integration and clearly isolate the settlement configuration so it can be adjusted according to Chapa's actual API capabilities.

The system must support the intended farmer settlement architecture without creating a platform-held payout balance.

==================================================
3. FARMER PAYMENT ACCOUNT
==================================================

Farmers must be able to register their payment destination.

The farmer should be able to provide a supported payment method such as:

- Telebirr
- CBE / CBE Birr
- Other payment methods supported by the configured Chapa integration

Store the required payment information securely.

Do NOT store payment PINs, passwords, OTPs, or other payment-provider authentication secrets.

The farmer's payment destination should be associated with their account and used when processing buyer payments.

If Chapa requires a subaccount for the farmer, store the required Chapa subaccount identifier/reference rather than sensitive credentials.

==================================================
4. BUYER PAYMENT EXPERIENCE
==================================================

After the buyer confirms that the product has been received, show:

"Pay Farmer"

Example:

Order: #ORD-001
Farmer: Ahmed
Amount: 10,000 ETB

[ Pay Farmer ]

The buyer should then be redirected to or shown the configured Chapa checkout.

The buyer should choose from the payment methods actually supported by Chapa.

Do NOT build a fake payment form.

Do NOT ask the buyer to enter their Telebirr/CBE PIN or password into our Laravel/Vue application.

Payment-provider authentication must happen through Chapa/the payment provider's secure flow.

==================================================
5. PAYMENT STATUS
==================================================

Separate fulfillment status from payment status.

Recommended payment statuses:

- pending
- initiated
- confirmed
- failed

The frontend must NEVER mark a payment as confirmed merely because the buyer clicked "Pay".

Only a verified successful Chapa response/webhook can change:

pending/initiated → confirmed

The webhook must:

1. Verify the webhook signature.
2. Validate the transaction reference.
3. Validate the payment status.
4. Validate the amount/order relationship.
5. Prevent duplicate webhook processing.
6. Update the Payment record.
7. Update the related order/fulfillment where appropriate.
8. Create a notification for the farmer.
9. Store appropriate transaction/reference information for auditing.

==================================================
6. FARMER PAYMENT NOTIFICATION
==================================================

After successful payment confirmation, automatically notify the farmer.

Example:

"Payment Completed"

Order: #ORD-001
Amount: 10,000 ETB
Payment Status: Confirmed

Implement this using the project's existing notification architecture if one already exists.

The farmer must not need to manually click "Payment Received" when Chapa has successfully confirmed the transaction.

==================================================
7. REMOVE/CHANGE OLD MANUAL PAYOUT FLOW
==================================================

The current system may contain:

- PayoutController
- Admin creates payout
- Admin marks payout as processed
- Farmer views pending/processed payouts

This old product-payment model must no longer be the primary flow.

Do NOT allow:

Admin creates farmer payout
    ↓
Admin manually transfers buyer's order money
    ↓
Admin marks payout processed

Instead:

Buyer pays through Chapa
    ↓
Chapa confirms
    ↓
Webhook
    ↓
Farmer payment confirmation

Before deleting anything, inspect whether existing payout models/tables/endpoints are used elsewhere.

If they are only related to the old manual farmer settlement flow, refactor/remove them safely through proper migrations and code cleanup.

Do not blindly delete database tables or production data.

==================================================
8. PLATFORM REVENUE MODEL
==================================================

The platform will NOT take a percentage commission from individual product transactions.

Example:

Product price = 10,000 ETB
Farmer product payment = 10,000 ETB
Platform transaction commission = 0 ETB

The platform owner instead receives revenue through a separate:

- Monthly platform fee, OR
- Yearly platform fee

This fee is completely separate from buyer-to-farmer product payments.

Do not deduct the monthly/yearly platform fee automatically from individual product payments unless explicitly required elsewhere.

==================================================
9. ACCOUNT ACTIVATION / DEACTIVATION
==================================================

Add account activation management for both:

- Farmers
- Business Buyers

Add an account status such as:

active
inactive

Admin must be able to:

- View users
- Activate a user
- Deactivate a user
- See current account status
- See relevant platform-fee status if the existing system supports it

==================================================
10. PLATFORM FEE AND ACCOUNT ACCESS
==================================================

If a farmer or buyer does not pay their required monthly/yearly platform fee, the admin can deactivate the account.

Example:

Platform fee overdue
    ↓
Admin deactivates account
    ↓
Account = inactive
    ↓
Protected marketplace operations are blocked

After the required fee is paid:

Admin activates account
    ↓
Account = active
    ↓
Marketplace access restored

Deactivation MUST NOT delete:

- User account
- Listings
- Orders
- Fulfillments
- Payments
- Historical transaction records
- Capabilities

The user's historical data must remain intact.

==================================================
11. ACCOUNT STATUS VS CAPABILITY
==================================================

Do NOT replace the existing Farmer/Business Buyer capability system.

Keep these concepts separate:

Authentication
    = Who is the user?

Capability
    = What role/permission does the user have?

Account status
    = Is the account currently active?

Example:

User
 ├── Account Status: Active
 ├── Farmer Capability: Approved
 └── Business Buyer Capability: Not Approved

An inactive farmer may still have an approved Farmer capability, but protected farmer operations must be blocked while the account is inactive.

==================================================
12. BACKEND AUTHORIZATION
==================================================

Account deactivation must be enforced by the Laravel backend.

Do NOT only hide buttons in Vue.

For protected operations, check:

Authenticated?
    ↓
Account active?
    ↓
Required capability?
    ↓
Authorized?
    ↓
Allow operation

An inactive user should not be able to bypass restrictions by calling the API directly.

Update middleware/policies/authorization logic where appropriate.

==================================================
13. ORDER/FULFILLMENT LOGIC
==================================================

The buyer is responsible for logistics.

Do not add a platform delivery system.

The intended fulfillment flow is:

pending
    ↓
accepted
    ↓
handed_over
    ↓
buyer_received
    ↓
completed

Payment is separate from fulfillment.

For example:

Fulfillment:
buyer_received

Payment:
pending

Then after successful Chapa confirmation:

Payment:
confirmed

Order:
completed, when all required completion conditions are satisfied.

Do not mark payment as confirmed merely because the farmer handed over the produce.

==================================================
14. DATABASE CHANGES
==================================================

Inspect the existing database schema first.

Add only the required migrations.

Potential changes may include:

users:
- account_status or equivalent

farmer payment information:
- payment_method
- payment_account/reference
- Chapa subaccount/reference if required

payments:
- payment status improvements
- Chapa transaction reference
- provider reference where required
- webhook/confirmation information where appropriate

platform fees:
If there is no existing platform-fee model, design a clean model for monthly/yearly fee tracking.

Do not duplicate existing columns or tables.

Use Laravel migrations.

==================================================
15. API CHANGES
==================================================

Inspect existing routes/controllers before adding new endpoints.

Potential functionality:

Farmer:
- Add/update payment account
- View payment status
- View payment history
- Receive payment notification

Buyer:
- Confirm product received
- Initiate payment
- View payment status

Admin:
- Activate user
- Deactivate user
- View account status
- Manage/review platform fee status

Do not create duplicate endpoints if equivalent existing endpoints can be safely modified.

==================================================
16. FRONTEND CHANGES
==================================================

Update the Vue frontend to reflect the new business flow.

Buyer:

After receiving the product:

[ Confirm Received ]

Then:

[ Pay Farmer ]

Then Chapa payment flow.

Farmer dashboard:

Show:

Payment Completed ✓
Order #ORD-001
Amount: 10,000 ETB

Farmer profile/settings:

Payment account management.

Admin dashboard:

Show:

User
Role/Capability
Account Status
Platform Fee Status
Activate / Deactivate

Inactive users should clearly see that their marketplace access is restricted.

==================================================
17. SAFETY / DATA INTEGRITY
==================================================

Do not:

- Store payment PINs.
- Store payment passwords.
- Trust frontend payment-success flags.
- Allow manual payment confirmation through arbitrary admin requests.
- Allow duplicate webhook processing.
- Delete historical financial records when a user is deactivated.
- Break existing authentication/capability functionality.
- Assume Chapa supports a settlement feature without verifying its API requirements.

Use database transactions where appropriate.

Use idempotency for payment/webhook processing.

==================================================
18. IMPLEMENTATION PROCESS
==================================================

Before writing code:

1. Inspect the existing Payment model.
2. Inspect PaymentController.
3. Inspect Chapa integration/configuration.
4. Inspect ChapaWebhookController.
5. Inspect Order and OrderFulfillment models/controllers.
6. Inspect PayoutController and Payout model.
7. Inspect current notification system.
8. Inspect User model and authorization/policies.
9. Inspect existing frontend payment/order/fulfillment pages.
10. Identify exactly which parts implement the old payment model.

Then produce a short implementation plan showing:

- Files to modify
- Files to create
- Migrations required
- Routes required
- API changes
- Frontend changes
- Old functionality to remove/refactor
- Chapa integration changes

DO NOT start by deleting or rewriting everything.

After the plan is reviewed, implement the changes incrementally.

Finally:

- Run Laravel tests.
- Test payment initiation.
- Test successful Chapa webhook.
- Test duplicate webhook.
- Test failed payment.
- Test buyer confirmation flow.
- Test farmer notification.
- Test inactive farmer restrictions.
- Test inactive buyer restrictions.
- Test admin activation/deactivation.
- Test platform-fee-related access control.
- Test profile management.
- Test farmer payment-account management.
- Test buyer profile management.
- Verify that historical orders/payments remain intact.

==================================================
19. FARMER AND BUYER PROFILE MANAGEMENT
==================================================

Add a dedicated profile management section for both Farmers and Business Buyers.

Both user types must be able to view and update their own profile information.

Do not allow users to edit information that should be controlled by the system/admin.

--------------------------------------------------
19.1 FARMER PROFILE
--------------------------------------------------

The Farmer must have a profile page where they can manage:

Personal/Profile Information:
- First name
- Second name
- Phone number, according to the existing authentication/security rules
- Profile photo, if supported by the existing system

Farmer Information:
- Farmer/business display information
- Location/address information, if already supported
- Other farmer profile fields that already exist in the database

Payment Account Management:
The Farmer must be able to manage the account where they receive payments.

The farmer should be able to:

- Add a payment account
- View their current payment account
- Update their payment account
- Change the payment method
- Remove/change an old payment account if allowed by the business rules

Supported payment methods must be based on the actual Chapa integration.

Examples:

- Telebirr
- CBE / CBE Birr
- Other supported Chapa payment/settlement methods

Example:

Payment Method:
[ Telebirr ▼ ]

Account / Phone:
09XXXXXXXX

Account Name:
Farmer Name

[ Save Payment Account ]

If Chapa requires a subaccount or recipient identifier, store the required identifier/reference securely.

Do NOT store:

- Telebirr PIN
- CBE PIN
- Bank password
- Payment OTP
- Payment-provider authentication secrets

The farmer's payment account should be associated with their profile and used for the intended Chapa settlement flow.

--------------------------------------------------
19.2 BUYER PROFILE
--------------------------------------------------

The Business Buyer must have a profile page where they can manage their own information.

The Buyer should be able to:

- View profile
- Edit first name
- Edit second name
- Manage phone number according to existing authentication/security rules
- Manage profile photo if supported
- Manage business-related profile information already supported by the project
- View account status
- View approved capabilities

The Buyer must NOT be able to modify:

- Account activation status
- Capability approval status
- Admin-controlled fields
- Payment confirmation records
- Order history
- Payment history

--------------------------------------------------
19.3 PROFILE ACCESS
--------------------------------------------------

Each authenticated user can only edit their own profile.

A farmer must not be able to edit another farmer's profile.

A buyer must not be able to edit another buyer's profile.

Admin users may have appropriate administrative access according to the existing authorization system.

Reuse existing profile endpoints if they already exist.

If they do not exist, use a clean structure such as:

GET    /api/profile
PUT    /api/profile
PUT    /api/profile/payment-account

Do not create duplicate endpoints if equivalent endpoints already exist.

--------------------------------------------------
19.4 ACCOUNT STATUS DISPLAY
--------------------------------------------------

The profile page must clearly display:

ACTIVE
or
INACTIVE

Example:

Account Status: ACTIVE ✓

If inactive:

Account Status: INACTIVE

Reason:
Platform access has been suspended.

An inactive user may still access their profile and historical information where appropriate, but protected marketplace operations must remain restricted.

--------------------------------------------------
19.5 FARMER PAYMENT ACCOUNT SECURITY
--------------------------------------------------

Farmer payment-account information is sensitive.

Mask sensitive account information when displaying it.

Examples:

Telebirr:
09******123

CBE:
******1234

Do not expose unnecessary payment-account information publicly on farmer listings or public farmer profiles.

Only expose the information required for the appropriate payment flow.

--------------------------------------------------
19.6 PROFILE FRONTEND
--------------------------------------------------

Create/update the Vue frontend with profile-management interfaces.

Suggested Farmer profile:

Profile
├── Personal Information
├── Farmer Information
├── Payment Account
│   ├── Payment Method
│   ├── Account/Phone
│   └── Account Name
└── Account Status

Suggested Buyer profile:

Profile
├── Personal Information
├── Business Information
└── Account Status

Use existing Vue components, form validation, API services, authentication state, and UI conventions wherever possible.

Do not create a completely separate architecture if reusable profile/form components already exist.

==================================================
20. FINAL BUSINESS MODEL
==================================================

The final business model must work as follows:

FARMER:
- Creates an account.
- Has Farmer capability.
- Manages their farmer profile.
- Registers their supported payment account.
- Lists agricultural products.
- Accepts buyer orders.
- Hands products to the buyer's vehicle.
- Receives payment through the integrated Chapa settlement flow.
- Receives an automatic payment confirmation notification.
- Pays the marketplace's monthly/yearly platform fee.
- Can be deactivated by Admin if required platform fees are not paid.

BUYER:
- Creates an account.
- Has Business Buyer capability.
- Manages their buyer/business profile.
- Browses agricultural products.
- Places orders.
- Provides their own transportation.
- Receives the products from the farmer.
- Confirms product receipt.
- Pays through Chapa integrated into the platform.
- Selects an available Chapa payment method.
- Payment is confirmed through the Chapa webhook.
- Can be deactivated by Admin if required platform fees are not paid.

PLATFORM:
- Provides the marketplace.
- Provides integrated Chapa payment functionality.
- Does NOT hold farmer sales money as a manual payout balance.
- Does NOT take product-transaction commission.
- Receives revenue through separate monthly/yearly platform fees.
- Admin manages account activation/deactivation.
- Maintains payment/order/fulfillment records.
- Sends payment notifications to farmers.

ADMIN:
- Manages users.
- Activates/deactivates Farmers.
- Activates/deactivates Business Buyers.
- Monitors platform-fee status.
- Manages platform access.
- Does NOT manually process farmer product payouts.
- Does NOT manually mark Chapa payments as confirmed.

FINAL FLOW:

Buyer places order
    ↓
Farmer accepts
    ↓
Buyer sends own vehicle
    ↓
Farmer hands over produce
    ↓
Buyer receives product
    ↓
Buyer confirms receipt
    ↓
Buyer clicks "Pay Farmer"
    ↓
Chapa Checkout
    ↓
Buyer selects supported payment method
    ↓
Payment completed
    ↓
Chapa webhook
    ↓
Laravel verifies payment
    ↓
Payment = CONFIRMED
    ↓
Farmer payment notification
    ↓
Order/fulfillment completed
    ↓
Platform records transaction
    ↓
Platform revenue remains separate through monthly/yearly fees