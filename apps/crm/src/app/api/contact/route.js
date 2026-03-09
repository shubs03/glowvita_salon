import _db from "@repo/lib/db";
import ContactMessageModel from "@repo/lib/models/admin/ContactMessage";

await _db();

export async function POST(req) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, phone, message, salonName } = body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !message) {
            return Response.json(
                { message: "All fields are required." },
                { status: 400 }
            );
        }

        const contact = await ContactMessageModel.create({
            firstName,
            lastName,
            email,
            phone,
            message,
            salonName,
            source: "crm",
        });

        return Response.json(
            { message: "Support ticket created successfully!", contact },
            { status: 201 }
        );
    } catch (error) {
        console.error("CRM Contact form error:", error);
        return Response.json(
            { message: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
