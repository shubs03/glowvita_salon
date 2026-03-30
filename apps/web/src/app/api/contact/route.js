import _db from "@repo/lib/db";
import ContactMessageModel from "@repo/lib/models/admin/ContactMessage";

await _db();

export async function POST(req) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, phone, message, source, salonName } = body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !message) {
            return Response.json(
                { message: "All fields are required." },
                { status: 400 }
            );
        }

        // Validate email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return Response.json(
                { message: "Invalid email address." },
                { status: 400 }
            );
        }

        // Validate phone
        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            return Response.json(
                { message: "Please enter a valid 10-digit phone number." },
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
            source: source || "website",
        });

        return Response.json(
            { message: "Message sent successfully!", contact },
            { status: 201 }
        );
    } catch (error) {
        console.error("Contact form error:", error);
        return Response.json(
            { message: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
