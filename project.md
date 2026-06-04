# TrustDelivery – Final Project Overview

## Problem

Many businesses in Yaoundé sell products through WhatsApp, Facebook, Instagram, and physical shops. Once a product leaves the shop, they lose visibility over what happens next.

Common issues include:

* Products not being delivered.
* Products being stolen or misplaced.
* Customers claiming they never received the product.
* Riders claiming customers were unavailable.
* No centralized tracking system.
* No reliable proof of delivery.

TrustDelivery solves this by providing a centralized delivery management platform where every delivery is tracked from creation to completion.

---

# The Ecosystem

The platform consists of three main actors:

```text
Merchant
    ↓
Creates Delivery Request
    ↓
Administrator
    ↓
Assigns Delivery
    ↓
Rider
    ↓
Executes Delivery
    ↓
Delivery Result
    ↓
Merchant + Administrator Updated
```

---

# SECTION 1 — MERCHANT PORTAL

The Merchant Portal is for businesses that want products delivered.

Examples:

* Online stores
* WhatsApp sellers
* Instagram sellers
* Electronics shops
* Fashion stores
* Pharmacies

The merchant's role is very simple:

> Create deliveries, pay for deliveries, and track deliveries.

The merchant does NOT manage riders.

The merchant does NOT assign deliveries.

---

## Merchant Dashboard

When the merchant logs in, they see:

* Deliveries in progress
* Delivered orders
* Failed deliveries
* Total deliveries this month
* Total amount spent on deliveries

---

## Create Delivery

The merchant creates a delivery request by entering:

### Product Information

```text
Product Description
```

Example:

```text
Samsung Galaxy S24 Ultra 256GB Black
```

---

### Customer Information

```text
Customer Name
Customer Phone Number
```

---

### Delivery Information

```text
Delivery Address
```

Example:

```text
Bastos, Carrefour Tradex, opposite Ecobank
```

As the merchant types, the platform suggests known addresses from the database.

Example:

```text
Bastos Carrefour Tradex
Bastos Pharmacie
Bastos Ambassade de France
```

This reduces address errors.

---

### Product Value

Example:

```text
450,000 FCFA
```

This is useful for reporting and future Cash-On-Delivery features.

---

## Delivery Cost Calculation

The platform automatically calculates delivery cost based on distance.

Example:

```text
Distance: 7.4 km

Delivery Cost:
2,000 FCFA
```

The merchant does not enter the delivery fee.

The system calculates it.

---

## Payment

The merchant chooses:

* Orange Money
* MTN MoMo
* Merchant Wallet

After successful payment:

```text
Status:
Awaiting Assignment
```

The request is sent to the administrator.

---

## Tracking Deliveries

The merchant can follow every delivery in real time.

Possible statuses:

```text
Awaiting Assignment
Assigned
In Transit
Delivered
Failed
```

---

## Delivery History

The merchant only sees deliveries belonging to their business.

They can view:

* Today
* This Week
* This Month

---

## Proof of Delivery

When delivery is completed:

```text
Delivered
01/06/2026
14:35
```

Verification method:

* OTP verification

Optional future additions:

* Delivery photo
* GPS location

---

# SECTION 2 — ADMINISTRATOR PORTAL

The Administrator Portal is the operational center of TrustDelivery.

This is your company.

Everything passes through this section.

---

## Administrator Dashboard

Displays:

* Active riders
* Deliveries awaiting assignment
* Deliveries in transit
* Delivered packages
* Failed deliveries
* Revenue generated

---

## Delivery Queue

Every paid delivery appears here.

Example:

```text
#1001

Merchant:
Arthur Electronics

Destination:
Bastos
```

No rider is assigned yet.

---

## Rider Assignment

The administrator chooses the most suitable rider.

Assignment can be based on:

* Current workload
* Delivery area
* Availability
* Performance

Example:

```text
Assign To:
Jean
```

Once assigned:

```text
Status:
Assigned
```

---

## Rider Management

Administrator can:

### Create Rider

```text
Name
Phone
Motorbike Number
```

### Update Rider

Modify rider information.

### Suspend Rider

Temporarily prevent access.

### Remove Rider

Deactivate account permanently.

---

## Delivery Monitoring

Administrators can see every delivery in the system.

Filters:

```text
Awaiting Assignment
Assigned
In Transit
Delivered
Failed
```

This provides complete visibility.

---

## Rider Performance Reports

### Daily Report

Shows:

* Deliveries assigned
* Deliveries completed
* Deliveries failed

---

### Weekly Report

Shows:

* Total assignments
* Completion rate
* Failure rate

Example:

```text
Assigned:
120

Delivered:
112

Failed:
8

Success Rate:
93%
```

---

### Monthly Report

Provides complete rider performance statistics.

Useful for:

* Bonuses
* Salary calculations
* Performance evaluations

---

## Revenue Reports

The administrator can monitor:

* Daily revenue
* Weekly revenue
* Monthly revenue
* Yearly revenue

---

# SECTION 3 — RIDER PORTAL

The Rider Portal is designed to be mobile-first.

The rider's only responsibility is to execute deliveries.

---

## Rider Dashboard

Shows:

```text
Assigned Today
Completed Today
Remaining Deliveries
```

---

## Assigned Deliveries

The rider sees all deliveries assigned to them.

Example:

```text
Product:
Samsung Galaxy S24

Customer:
John Doe

Phone:
677123456

Address:
Bastos Carrefour Tradex
```

---

## Start Delivery

When the rider leaves for delivery:

```text
Start Delivery
```

Status becomes:

```text
In Transit
```

Merchant and administrator are updated.

---

## Successful Delivery

Customer receives an OTP.

Example:

```text
5821
```

Customer provides the OTP to the rider.

Rider enters OTP.

If valid:

```text
Delivered
```

The delivery is closed successfully.

---

## Failed Delivery

If delivery cannot be completed:

Rider selects a reason:

```text
Customer Unavailable
Wrong Address
Phone Unreachable
Customer Refused Product
Other
```

Additional notes can be added.

Status becomes:

```text
Failed
```

Merchant and administrator are immediately informed.

---

## Daily Expense Tracking

The rider records expenses incurred during work.

Examples:

```text
Fuel
Repairs
Parking
Other
```

Example entry:

```text
Fuel:
3,000 FCFA
```

These expenses are visible to administrators for operational reporting.

---

# Future Versions

After validating the idea in Yaoundé, the platform can expand with:

### Version 2

* GPS live tracking
* Route optimization
* Customer notifications
* Delivery photos
* Merchant wallet
* Cash-On-Delivery management

### Version 3

* Douala expansion
* Mobile apps (Android/iPhone)
* Rider earnings management
* AI-assisted route planning
* Nationwide delivery network

---

# Core Value Proposition

TrustDelivery is not just a delivery application.

It is a **delivery accountability platform**.

Every delivery has:

* A merchant who requested it.
* An administrator who assigned it.
* A rider responsible for it.
* A verifiable delivery outcome.

This creates transparency, trust, and operational control for businesses in Yaoundé while giving your company a scalable logistics service that can grow city by city.

You're right. We defined the delivery flow but not how a merchant joins the platform.

Since TrustDelivery is a delivery company and not just a software platform, merchant registration should collect enough information for you to:

* Identify the business
* Verify the business owner
* Contact them
* Generate invoices and payments
* Reduce fraud

I would make the registration process very simple for MVP.

## Merchant Registration Flow

### Step 1: Basic Information

#### Business Name

```text
Arthur Electronics
```

Required.

---

#### Business Type

Dropdown:

```text
Electronics
Fashion
Beauty
Pharmacy
Food
Home Appliances
General Merchandise
Other
```

Required.

---

#### Business Address

Example:

```text
Mvog-Ada, Yaoundé
```

Required.

---

#### Business Phone Number

Example:

```text
677123456
```

Required.

---

#### Business Email

Example:

```text
contact@arthurelectronics.com
```

Optional for MVP but recommended.

---

### Step 2: Owner Information

#### Owner Full Name

Example:

```text
Arthur Tcheutchoua
```

Required.

---

#### Owner Phone Number

Example:

```text
678123456
```

Required.

---

#### National ID Number (Optional MVP)

Can be added later.

This helps verify merchants and reduce fraud.

---

### Step 3: Security

#### Password

Rules:

* Minimum 8 characters
* One uppercase
* One number

---

#### Confirm Password

Must match.

---

### Step 4: Accept Terms

Checkbox:

```text
I agree to TrustDelivery's terms and conditions.
```

Required.

---

# Registration Approval

This is where many startups make a mistake.

I do NOT recommend automatically activating merchant accounts.

Instead:

### Merchant Creates Account

Status:

```text
Pending Approval
```

Administrator receives notification.

---

### Administrator Reviews Merchant

Administrator sees:

```text
Business Name
Owner Name
Phone Number
Business Type
Address
```

Administrator can:

```text
Approve
Reject
```

---

### After Approval

Merchant receives:

```text
Welcome to TrustDelivery.

Your account has been approved.
```

Status:

```text
Active
```

Now they can create deliveries.

---

# Merchant Entity

The merchant table would look like:

```text
Merchant

id
business_name
business_type
business_address
business_phone
business_email

owner_name
owner_phone

status

created_at
updated_at
```

---

# Merchant Statuses

```text
Pending Approval
Active
Suspended
Rejected
```

---

# Merchant Wallet (Future)

I would also prepare the registration model for future wallet support.

```text
wallet_balance
```

Example:

```text
25,000 FCFA
```

The merchant can recharge using:

* Orange Money
* MTN MoMo

And deliveries are deducted automatically.

---

# Recommended Registration Screen

A clean two-step wizard:

### Step 1 — Business Information

```text
Business Name
Business Type
Business Address
Business Phone
Business Email
```

### Step 2 — Owner Information

```text
Owner Full Name
Owner Phone Number
Password
Confirm Password
```

Button:

```text
Create Account
```

After submission:

```text
Account Created Successfully

Your account is awaiting approval by TrustDelivery.
```

This is simple enough for small WhatsApp sellers while still giving you enough information to manage merchants professionally.

DB-pw=4vsVJ/82VYk_5Ny