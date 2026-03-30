import _db from "@repo/lib/db";
import CategoryModel from "@repo/lib/models/admin/Category";
import { authMiddlewareCrm } from "../../../../middlewareCrm.js";

await _db();

// GET all categories (available to all CRM users)
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const categories = await CategoryModel.find({});
        return Response.json(categories, { status: 200 });
    } catch (error) {
        return Response.json(
            { message: "Error fetching categories", error: error.message },
            { status: 500 }
        );
    }
}, ["vendor", "doctor", "supplier"]);

// POST a new category
export const POST = authMiddlewareCrm(async (req) => {
    try {
        const body = await req.json();
        const { name, description, image } = body;

        if (!name) {
            return Response.json(
                { message: "Name is required" },
                { status: 400 }
            );
        }

        const newCategory = await CategoryModel.create({
            name,
            description,
            categoryImage: image
        });
        return Response.json(newCategory, { status: 201 });
    } catch (error) {
        return Response.json(
            { message: "Error creating category", error: error.message },
            { status: 500 }
        );
    }
}, ["vendor"]);
