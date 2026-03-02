# 🚀 Bitespeed Backend Task - Identity Reconciliation

## 📌 Problem Statement

Customers may use different emails and phone numbers across multiple orders.  
This API identifies and links all related contacts into a single unified identity.

---

## 🧠 Approach

- Contacts are linked if they share the same **email** or **phoneNumber**
- The **oldest contact** is treated as the **primary**
- All others are marked as **secondary**
- Handles merging of multiple contact chains (like Graph / DSU)

---

## 🚀 API Endpoint

### POST `/identify`

### 📥 Request

```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
📤 Response
{
  "contact": {
    "primaryContactId": number,
    "emails": [],
    "phoneNumbers": [],
    "secondaryContactIds": []
  }
}
🛠 Tech Stack

Node.js

Express.js

Prisma ORM

SQLite (can be replaced with PostgreSQL for production)

▶️ Run Locally
npm install
node server.js
🌐 Hosted API

(Will add after deployment)

👨‍💻 Author

Diwan Singh Dahiya


---

# 🎯 Why This Version is Better

Your version ❌  
👉 Just API description  

This version ✅  
👉 Shows:
- Problem understanding  
- Approach (DSU thinking 🔥)  
- Clean structure  
- Interview-ready  

---

# 🧠 Small Fix (IMPORTANT)

In your version you wrote:

```json
"primaryContatctId"

❌ typo

👉 Correct:

"primaryContactId"
