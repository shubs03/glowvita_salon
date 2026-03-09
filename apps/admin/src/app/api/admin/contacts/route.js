import _db from "@repo/lib/db";
import ContactMessageModel from "@repo/lib/models/admin/ContactMessage";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

// GET all contact messages
export const GET = authMiddlewareAdmin(
    async (req) => {
        try {
            const { searchParams } = new URL(req.url);
            const status = searchParams.get("status");
            const page = parseInt(searchParams.get("page") || "1");
            const limit = parseInt(searchParams.get("limit") || "20");
            const skip = (page - 1) * limit;

            const query = status && status !== "all" ? { status } : {};

            const [messages, total] = await Promise.all([
                ContactMessageModel.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                ContactMessageModel.countDocuments(query),
            ]);

            return Response.json({
                messages,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            });
        } catch (error) {
            console.error("Fetch contacts error:", error);
            return Response.json({ message: "Failed to fetch messages" }, { status: 500 });
        }
    },
    ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"],
    "contact-messages:view"
);

// PUT: Update status of a contact message
export const PUT = authMiddlewareAdmin(
    async (req) => {
        try {
            const { id, status } = await req.json();

            if (!id || !status) {
                return Response.json({ message: "id and status are required" }, { status: 400 });
            }

            const validStatuses = ["new", "read", "replied"];
            if (!validStatuses.includes(status)) {
                return Response.json({ message: "Invalid status value" }, { status: 400 });
            }

            const updated = await ContactMessageModel.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            );

            if (!updated) {
                return Response.json({ message: "Message not found" }, { status: 404 });
            }

            return Response.json({ message: "Status updated", contact: updated });
        } catch (error) {
            console.error("Update contact error:", error);
            return Response.json({ message: "Failed to update message" }, { status: 500 });
        }
    },
    ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"],
    "contact-messages:edit"
);

// DELETE a contact message
export const DELETE = authMiddlewareAdmin(
    async (req) => {
        try {
            const { id } = await req.json();

            if (!id) {
                return Response.json({ message: "id is required" }, { status: 400 });
            }

            const deleted = await ContactMessageModel.findByIdAndDelete(id);

            if (!deleted) {
                return Response.json({ message: "Message not found" }, { status: 404 });
            }

            return Response.json({ message: "Message deleted successfully" });
        } catch (error) {
            console.error("Delete contact error:", error);
            return Response.json({ message: "Failed to delete message" }, { status: 500 });
        }
    },
    ["SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"],
    "contact-messages:delete"
);
