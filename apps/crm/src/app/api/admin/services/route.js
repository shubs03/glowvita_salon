import _db from "@repo/lib/db";
import ServiceModel from "@repo/lib/models/admin/Service";
import { authMiddlewareCrm } from "../../../../middlewareCrm.js";

await _db();

// GET all services
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const services = await ServiceModel.find({}).populate("category", "name");
        return Response.json(services, { status: 200 });
    } catch (error) {
        return Response.json(
            { message: "Error fetching services", error: error.message },
            { status: 500 }
        );
    }
}, ["vendor", "doctor", "supplier"]);

// POST a new service
export const POST = authMiddlewareCrm(async (req) => {
    try {
        const body = await req.json();
        const { name, description, category, image } = body;

        if (!name || !category) {
            return Response.json(
                { message: "Name and category are required" },
                { status: 400 }
            );
        }

        const newService = await ServiceModel.create({
            name,
            description,
            category,
            serviceImage: image
        });
        return Response.json(newService, { status: 201 });
    } catch (error) {
        return Response.json(
            { message: "Error creating service", error: error.message },
            { status: 500 }
        );
    }
}, ["vendor"]);
