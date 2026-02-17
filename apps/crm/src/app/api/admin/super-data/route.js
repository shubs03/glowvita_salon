import _db from "@repo/lib/db";
import SuperDataModel from "@repo/lib/models/admin/SuperData";
import { authMiddlewareCrm } from "../../../../middlewareCrm.js";

await _db();

// GET all super data items
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const data = await SuperDataModel.find({});
        return Response.json(data, { status: 200 });
    } catch (error) {
        return Response.json(
            { message: "Error fetching super data", error: error.message },
            { status: 500 }
        );
    }
}, ["vendor", "doctor", "supplier"]);
