import { NextResponse } from "next/server";
import _db from '../../../../../../../packages/lib/src/db.js';
import mongoose from 'mongoose';
import { authMiddlewareCrm } from '../../../../middlewareCrm.js';

const { default: SocialMediaTemplateModel, modelName } = await import("../../../../../../../packages/lib/src/models/Marketing/socialMediaTemplate.model.js");

export const dynamic = 'force-dynamic';

function getModel() {
  try { return mongoose.model(modelName); }
  catch { return mongoose.model(modelName, SocialMediaTemplateModel.schema); }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — Returns originals AND vendor copies as separate list items.
//
// Each item has `isVendorCopy` flag so the UI can split them into two tabs:
//   • "All Templates"      → isVendorCopy === false
//   • "My Customizations"  → isVendorCopy === true
//
// Originals also carry `isCustomized` + `editorJsonData` so the
// "All Templates" tab can open the vendor's saved version when editing again.
// ─────────────────────────────────────────────────────────────────────────────
export const GET = authMiddlewareCrm(async (req) => {
  try {
    await _db();
    const SocialMediaTemplate = getModel();

    const vendorId = req.user?.userId;



    // 1. All active admin originals (pristine templates with no parent and not created by this vendor)
    const originalsQuery = {
      isActive: true,
      parentTemplateId: null,
    };
    if (vendorId) {
      originalsQuery.createdBy = { $ne: new mongoose.Types.ObjectId(vendorId) };
    }
    
    const originals = await SocialMediaTemplate.find(originalsQuery)
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();

    // 2. This vendor's copies (any template scoped to vendorId or created by the vendor)
    const vendorCopies = vendorId
      ? await SocialMediaTemplate.find({
          $or: [
            { vendorId: new mongoose.Types.ObjectId(vendorId) },
            { createdBy: new mongoose.Types.ObjectId(vendorId) }
          ]
        }).select('-__v').lean()
      : [];

    // 3. Self-healing DB migration: link older template copies to their originals
    if (vendorId && vendorCopies.length > 0) {
      const unlinkedCopies = vendorCopies.filter(c => !c.parentTemplateId);
      for (const copy of unlinkedCopies) {
        const copyTitleClean = copy.title.replace(/\s*-\s*(Edited|Customized|My Design)$/i, '').trim().toLowerCase();
        const originalMatch = originals.find(orig => {
          const origTitleClean = orig.title.replace(/\s*-\s*(Edited|Customized|My Design)$/i, '').trim().toLowerCase();
          return origTitleClean === copyTitleClean;
        });

        if (originalMatch) {
          console.log(`[Migration] Self-healing link: copying template ID ${copy._id} parent to original ${originalMatch._id}`);
          await SocialMediaTemplate.updateOne(
            { _id: copy._id },
            {
              $set: {
                parentTemplateId: originalMatch._id,
                vendorId: new mongoose.Types.ObjectId(vendorId)
              }
            }
          );
          // Sync in-memory objects
          copy.parentTemplateId = originalMatch._id;
          copy.vendorId = new mongoose.Types.ObjectId(vendorId);
        }
      }
    }

    // 4. Map parentTemplateId → vendor copy for quick lookup
    const copyByParent = new Map();
    for (const copy of vendorCopies) {
      if (copy.parentTemplateId) {
        copyByParent.set(copy.parentTemplateId.toString(), copy);
      }
    }

    // 5. Build originals list — include vendor's saved jsonData as `editorJsonData`
    //    so the "All Templates" tab always opens the vendor's last edit (not the original).
    const originalsResult = originals.map(original => {
      const originalId = original._id.toString();
      const vendorCopy = copyByParent.get(originalId);
      return {
        _id: original._id,
        id: original._id,
        originalTemplateId: originalId,
        parentTemplateId: null,
        isVendorCopy: false,
        isCustomized: !!vendorCopy,
        title: original.title,
        category: original.category,
        description: original.description,
        imageUrl: original.imageUrl,
        jsonData: original.jsonData,
        // When the vendor has a copy, open THEIR saved canvas instead of the blank original
        editorJsonData: vendorCopy ? vendorCopy.jsonData : original.jsonData,
        availableFor: original.availableFor,
        status: original.status,
        isActive: original.isActive,
        createdAt: original.createdAt,
        updatedAt: original.updatedAt,
      };
    });

    // 6. Build vendor copies list for "My Customizations" tab
    const vendorCopiesResult = vendorCopies.map(copy => ({
      _id: copy._id,
      id: copy._id,
      originalTemplateId: copy.parentTemplateId?.toString() || null,
      parentTemplateId: copy.parentTemplateId?.toString() || null,
      isVendorCopy: true,
      isCustomized: true,
      title: copy.title,
      category: copy.category,
      description: copy.description,
      imageUrl: copy.imageUrl,
      jsonData: copy.jsonData,
      editorJsonData: copy.jsonData,
      availableFor: copy.availableFor,
      status: copy.status,
      isActive: copy.isActive,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    }));

    // Return both lists combined — frontend splits by isVendorCopy
    const allItems = [...originalsResult, ...vendorCopiesResult];

    return NextResponse.json({
      success: true,
      data: allItems,
      total: allItems.length,
      totalOriginals: originalsResult.length,
      totalCustomizations: vendorCopiesResult.length,
    }, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, max-age=0' }
    });

  } catch (error) {
    console.error('Error in GET /api/crm/social-media-templates:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching social media templates',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}, ['vendor', 'supplier']);

// ─────────────────────────────────────────────────────────────────────────────
// POST — Upsert a vendor-specific copy. The original is NEVER modified.
// ─────────────────────────────────────────────────────────────────────────────
export const POST = authMiddlewareCrm(async (req) => {
  try {
    await _db();
    const SocialMediaTemplate = getModel();

    const vendorId = req.user?.userId;
    if (!vendorId) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { templateId, jsonData, title, customizations } = body;

    if (!templateId || !jsonData) {
      return NextResponse.json(
        { success: false, message: 'Template ID and JSON data are required' },
        { status: 400 }
      );
    }

    // Must reference a valid admin original
    const originalTemplate = await SocialMediaTemplate.findOne({
      _id: templateId,
      vendorId: null,
    }).lean();

    if (!originalTemplate) {
      return NextResponse.json(
        { success: false, message: 'Original template not found' },
        { status: 404 }
      );
    }

    const existingCopy = await SocialMediaTemplate.findOne({
      vendorId,
      parentTemplateId: templateId,
    });

    let savedCopy;
    if (existingCopy) {
      existingCopy.jsonData = jsonData;
      existingCopy.title = title || existingCopy.title;
      existingCopy.updatedBy = vendorId;
      if (customizations) existingCopy.customizations = customizations;
      savedCopy = await existingCopy.save();
      return NextResponse.json({
        success: true, message: 'Customized template updated successfully',
        data: savedCopy, isNew: false,
      }, { status: 200 });
    } else {
      savedCopy = await SocialMediaTemplate.create({
        title: title || `${originalTemplate.title} - My Design`,
        category: originalTemplate.category,
        description: `My customized version of "${originalTemplate.title}"`,
        availableFor: originalTemplate.availableFor,
        status: 'Draft',
        isActive: true,
        jsonData,
        imageUrl: originalTemplate.imageUrl,
        createdBy: vendorId,
        createdByModel: 'Vendor',
        updatedBy: vendorId,
        vendorId,
        parentTemplateId: templateId,
      });
      return NextResponse.json({
        success: true, message: 'Customized template saved successfully',
        data: savedCopy, isNew: true,
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error in POST /api/crm/social-media-templates:', error);
    return NextResponse.json(
      { success: false, message: 'Error saving customized template',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}, ['vendor', 'supplier']);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE — Delete a vendor-specific copy.
// ─────────────────────────────────────────────────────────────────────────────
export const DELETE = authMiddlewareCrm(async (req) => {
  try {
    await _db();
    const SocialMediaTemplate = getModel();

    const vendorId = req.user?.userId;
    if (!vendorId) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID format' }, { status: 400 });
    }

    // Must be a customized copy belonging to this vendor
    const copy = await SocialMediaTemplate.findOne({
      _id: id,
      $or: [
        { vendorId: new mongoose.Types.ObjectId(vendorId) },
        { createdBy: new mongoose.Types.ObjectId(vendorId), parentTemplateId: { $ne: null } }
      ]
    });

    if (!copy) {
      return NextResponse.json(
        { success: false, message: 'Customization not found or access denied' },
        { status: 404 }
      );
    }

    await SocialMediaTemplate.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Customized template deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error in DELETE /api/crm/social-media-templates:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting customized template',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}, ['vendor', 'supplier']);