// import _db from "../../../../../../../packages/lib/src/db.js";
// import _db from "../../../../../../../glowvita_salon/packages/lib/src/db.js";
// import SocialMediaTemplate from "../../../../../../../packages/lib/src/models/Marketing/socialMediaTemplate.model.js";
// import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

// await _db();

// // GET all Social Media templates
// export const GET = authMiddlewareAdmin(async (req) => {
//   try {
//     const templates = await SocialMediaTemplate.find({})
//       .sort({ createdAt: -1 })
//       .lean();
//     return Response.json({ success: true, data: templates });
//   } catch (error) {
//     console.error("Error fetching social media templates:", error);
//     return Response.json(
//       { success: false, message: "Error fetching social media templates" },
//       { status: 500 }
//     );
//   }
// });

// // POST a new Social Media template
// export const POST = authMiddlewareAdmin(async (req) => {
//   try {
//     const body = await req.json();
//     const { title, category, description = '', imageUrl = '', status = 'Draft', isActive = true } = body;
//     const user = req.user;

//     // Validate required fields
//     if (!title || !category) {
//       return Response.json(
//         { success: false, message: 'Title and category are required' },
//         { status: 400 }
//       );
//     }

//     // Check for existing template with same title (case insensitive)
//     const existingTemplate = await SocialMediaTemplate.findOne({
//       title: { $regex: new RegExp(`^${title.trim()}$`, 'i') }
//     });

//     if (existingTemplate) {
//       return Response.json(
//         { success: false, message: 'A template with this title already exists' },
//         { status: 400 }
//       );
//     }

//     // Create new template
//     const newTemplate = new SocialMediaTemplate({
//       title: title.trim(),
//       category,
//       description: description || '',
//       imageUrl: imageUrl || '',
//       status,
//       isActive,
//       createdBy: user._id,
//       updatedBy: user._id
//     });

//     const savedTemplate = await newTemplate.save();
//     return Response.json(
//       { 
//         success: true, 
//         message: 'Social Media template created successfully', 
//         data: savedTemplate 
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error creating social media template:", error);
//     return Response.json(
//       { 
//         success: false, 
//         message: 'Error creating social media template',
//         ...(process.env.NODE_ENV === 'development' && { error: error.message })
//       },
//       { status: 500 }
//     );
//   }
// });

// // PUT update a Social Media template
// export const PUT = authMiddlewareAdmin(async (req) => {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get('id');
//     const body = await req.json();
//     const user = req.user;
    
//     if (!id) {
//       return Response.json(
//         { success: false, message: "Template ID is required" },
//         { status: 400 }
//       );
//     }

//     const updatedTemplate = await SocialMediaTemplate.findByIdAndUpdate(
//       id,
//       { 
//         ...body,
//         updatedBy: user._id,
//         updatedAt: new Date() 
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updatedTemplate) {
//       return Response.json(
//         { success: false, message: "Social Media template not found" },
//         { status: 404 }
//       );
//     }

//     return Response.json({
//       success: true,
//       message: "Social Media template updated successfully",
//       data: updatedTemplate
//     });
//   } catch (error) {
//     console.error("Error updating social media template:", error);
//     return Response.json(
//       { 
//         success: false,
//         message: "Error updating social media template",
//         ...(process.env.NODE_ENV === 'development' && { error: error.message })
//       },
//       { status: 500 }
//     );
//   }
// });

// // DELETE a Social Media template
// export const DELETE = authMiddlewareAdmin(async (req) => {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get('id');
    
//     if (!id) {
//       return Response.json(
//         { success: false, message: "Template ID is required" },
//         { status: 400 }
//       );
//     }

//     const deletedTemplate = await SocialMediaTemplate.findByIdAndDelete(id);
    
//     if (!deletedTemplate) {
//       return Response.json(
//         { success: false, message: "Social Media template not found" },
//         { status: 404 }
//       );
//     }

//     return Response.json({
//       success: true,
//       message: "Social Media template deleted successfully"
//     });
//   } catch (error) {
//     console.error("Error deleting social media template:", error);
//     return Response.json(
//       { 
//         success: false,
//         message: "Error deleting social media template",
//         ...(process.env.NODE_ENV === 'development' && { error: error.message })
//       },
//       { status: 500 }
//     );
//   }
// });
