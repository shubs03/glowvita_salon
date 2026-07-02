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

export async function GET() {
    const contactData = {
        hero: {
            headline: "Get in Touch with Us",
            description: "If you need help, want to share feedback, or simply have a question, we're here to listen and respond with care so your journey with GlowVita remains smooth and enjoyable."
        },
        offices: [
            {
                city: 'Nashik, Maharashtra',
                label: 'Corporate Office',
                address: 'Corporate Office : Business Plus, A Wing, 5th Floor, Office No. 505, 506, Near Sai Square, Mumbai Naka, Nashik, Maharashtra, India PIN - 422009',
            }
        ],
        contactInfo: {
            title: "Contact Us",
            description: "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
            phone: "+91 9075201035",
            email: "glowvitasalon@gmail.com",
            address: "Corporate Office : Business Plus, A Wing, 5th Floor, Office No. 505, 506, Near Sai Square, Mumbai Naka, Nashik, Maharashtra, India PIN - 422009"
        },
        awards: {
            title: "Awards & Recognition",
            description: "These awards are a testament to our commitment to excellence and our dedication to providing the best salon software solutions to our customers.",
            list: [
                {
                    title: "Best Salon Software 2026",
                    description: "Winner of the Best Salon Software award in the Tech Innovators Magazine 2026."
                },
                {
                    title: "Customer's Choice Award",
                    description: "Winner of the Customer's Choice Award in Beauty Tech Reviews 2026."
                },
                {
                    title: "Fastest Growing Platform",
                    description: "Winner of the Fastest Growing Platform award in Startup Weekly 2026."
                }
            ]
        }
    };

    return Response.json(
        { success: true, data: contactData },
        { status: 200 }
    );
}
