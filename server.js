const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Server is running");
});

app.post("/identify", async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;

        // 1. Find matching contacts
        const matched = await prisma.contact.findMany({
            where: {
                OR: [
                    email ? { email } : undefined,
                    phoneNumber ? { phoneNumber } : undefined
                ].filter(Boolean)
            }
        });

        // No match
        if (matched.length === 0) {
            const newContact = await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: "primary",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            return res.json({
                contact: {
                    primaryContactId: newContact.id,
                    emails: email ? [email] : [],
                    phoneNumbers: phoneNumber ? [phoneNumber] : [],
                    secondaryContactIds: []
                }
            });
        }

        // 2. Get all related contacts (via matched IDs)
        const matchedIds = matched.map(c => c.id);

        let related = await prisma.contact.findMany({
            where: {
                OR: [
                    { id: { in: matchedIds } },
                    { linkedId: { in: matchedIds } }
                ]
            }
        });

        // 3. Find the oldest contact → PRIMARY
        let primary = related.reduce((oldest, curr) => {
            return new Date(curr.createdAt) < new Date(oldest.createdAt)
                ? curr
                : oldest;
        });

        // 4. Convert other primaries → secondary
        for (let contact of related) {
            if (contact.id !== primary.id && contact.linkPrecedence === "primary") {
                await prisma.contact.update({
                    where: { id: contact.id },
                    data: {
                        linkPrecedence: "secondary",
                        linkedId: primary.id,
                        updatedAt: new Date()
                    }
                });
            }
        }

        // 5. Get updated full chain using primary
        let finalContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { id: primary.id },
                    { linkedId: primary.id }
                ]
            }
        });

        // 6. Check if new info is introduced
        const existingEmails = new Set(finalContacts.map(c => c.email));
        const existingPhones = new Set(finalContacts.map(c => c.phoneNumber));

        if (
            (email && !existingEmails.has(email)) ||
            (phoneNumber && !existingPhones.has(phoneNumber))
        ) {
            await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkedId: primary.id,
                    linkPrecedence: "secondary",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            // Refresh contacts after insert
            finalContacts = await prisma.contact.findMany({
                where: {
                    OR: [
                        { id: primary.id },
                        { linkedId: primary.id }
                    ]
                }
            });
        }

        // 7. Prepare response (PRIMARY FIRST)
        const primaryEmail = primary.email;
        const primaryPhone = primary.phoneNumber;

        const emails = [
            primaryEmail,
            ...[...new Set(finalContacts.map(c => c.email))]
                .filter(e => e && e !== primaryEmail)
        ].filter(Boolean);

        const phoneNumbers = [
            primaryPhone,
            ...[...new Set(finalContacts.map(c => c.phoneNumber))]
                .filter(p => p && p !== primaryPhone)
        ].filter(Boolean);

        const secondaryContactIds = finalContacts
            .filter(c => c.linkPrecedence === "secondary")
            .map(c => c.id);

        return res.json({
            contact: {
                primaryContactId: primary.id,
                emails,
                phoneNumbers,
                secondaryContactIds
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Start server
app.listen(3000, () => {
    console.log("Server started on port 3000");
});