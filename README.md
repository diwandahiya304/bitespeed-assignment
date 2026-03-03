🚀 Bitespeed Backend Task – Identity Reconciliation
📌 Overview

This project implements the Identity Reconciliation API for Bitespeed.

The goal is to identify and link multiple contacts (email/phone) belonging to the same customer and return a consolidated response.

The system ensures:

The oldest contact in the identity cluster is marked as primary

Multiple primaries are merged correctly

All secondary contacts directly reference the final primary (no chain linking)

No duplicate emails or phone numbers

Primary contact’s email and phone appear first in the response

Optimized batch updates using Prisma updateMany

Uses a hosted relational database via Prisma connection string

🛠 Tech Stack

Node.js

Express.js

Prisma ORM

Hosted Relational Database (via Prisma connection string)

Git & GitHub

📂 Database Schema
Contact Table
{
  id: Int
  phoneNumber: String?
  email: String?
  linkedId: Int?
  linkPrecedence: "primary" | "secondary"
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime?
}
🌐 Database Configuration

This project uses a hosted database.

The connection string is stored securely in:

.env

Example:

DATABASE_URL="postgres://7395bf9db215b96fde3ca6cd72202906af5ff25666d911d270694574e4c9759d:sk_7wZpYTuldVHSQDGGiQTFj@db.prisma.io:5432/postgres?sslmode=require&pool=true"

⚠️ The .env file is excluded from GitHub for security reasons.

No local dev.db file is used.

🔗 API Endpoint
POST /identify
📥 Request Body
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}

At least one of email or phoneNumber must be provided.

📤 Response Format
{
  "contact": {
    "primaryContactId": number,
    "emails": ["string"],
    "phoneNumbers": ["string"],
    "secondaryContactIds": [number]
  }
}
⚙️ Identity Resolution Logic
1️⃣ Find Matching Contacts

Search existing contacts using:

email OR

phoneNumber

2️⃣ Expand Full Identity Graph

Retrieve:

Matched contacts

Their parents (linkedId)

Their children (where linkedId = id)

3️⃣ Select Primary Contact

Oldest createdAt becomes primary.

Ensures deterministic reconciliation.

4️⃣ Merge Multiple Primaries

If multiple primaries exist:

Convert newer primaries to secondary

Update their linkedId to the oldest primary

5️⃣ Flatten Identity Structure

Use Prisma updateMany to batch update:

updateMany({
  where: {
    OR: [
      { id: { in: idsToUpdate } },
      { linkedId: { in: idsToUpdate } }
    ]
  },
  data: {
    linkedId: primary.id,
    linkPrecedence: "secondary"
  }
})

Ensures:

No secondary points to another secondary

All contacts directly reference the primary

6️⃣ Insert New Secondary (If Needed)

If new email or phoneNumber is introduced:

Create a new secondary

Link it to the primary

7️⃣ Build Response

Primary email first

Primary phone first

Remove duplicates

Return secondary IDs only

▶️ How to Run Locally
1️⃣ Install dependencies
npm install
2️⃣ Generate Prisma Client
npx prisma generate
3️⃣ Run migration (if required)
npx prisma migrate deploy
4️⃣ Start server
node server.js

Server runs on:

http://localhost:3000
🧪 Example Request
{
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "123456"
}
🌐 Hosted API

Live endpoint:

https://bitespeed-assignment-5k86.onrender.com/identify

Example:

https://your-app-name.onrender.com/identify
📌 Notes

No local SQLite database is used.

Uses hosted relational storage via Prisma connection string.

.env file is excluded for security.

Optimized database operations using batch updates.

Handles edge cases involving multiple primaries and chain merging.

👨‍💻 Author

Diwan Singh Dahiya
Bitespeed Backend Task Submission

Now your README correctly reflects:

✔ Hosted database
✔ No dev.db
✔ Production-ready setup
✔ Optimized reconciliation logic
