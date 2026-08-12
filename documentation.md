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
