import _db from "../../../../../../../packages/lib/src/db.js";
import CategoryModel from "../../../../../../../packages/lib/src/models/admin/Category.model.js";
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