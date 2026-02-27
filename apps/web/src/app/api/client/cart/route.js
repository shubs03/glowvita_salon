import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import UserCartModel from '@repo/lib/models/user/UserCart.model';
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import mongoose from 'mongoose';

await _db();

// Helper function to get user ID from JWT token
const getUserId = async (req) => {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return null;
    }

    const payload = await verifyJwt(token);
    return payload?.userId;
  } catch (error) {
    return null;
  }
};

// GET: Fetch the user's cart
export async function GET(req) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    let cart = await UserCartModel.findOne({ userId }).lean();

    if (!cart) {
      // If no cart exists, create an empty one
      cart = { userId, items: [] };
    }

    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch cart', error: error.message }, { status: 500 });
  }
}

// POST: Add an item to the cart or update quantity if it exists
export async function POST(req) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    const item = await req.json();

    if (!item.productId || item.quantity === undefined || item.price === undefined) {
      return NextResponse.json({ success: false, message: 'Product ID, quantity, and price are required' }, { status: 400 });
    }

    // Check product stock availability
    const product = await ProductModel.findById(item.productId);

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    if (product.stock === 0) {
      return NextResponse.json({ success: false, message: 'Product is out of stock' }, { status: 400 });
    }

    // Check if user already has this product in cart
    const existingCart = await UserCartModel.findOne({
      userId,
      'items.productId': item.productId
    });

    let totalRequestedQuantity = item.quantity;

    // If product already exists in cart, add to existing quantity
    if (existingCart) {
      const existingItem = existingCart.items.find(
        cartItem => cartItem.productId.toString() === item.productId.toString()
      );
      if (existingItem) {
        totalRequestedQuantity += existingItem.quantity;
      }
    }

    // Validate total quantity against stock
    if (totalRequestedQuantity > product.stock) {
      return NextResponse.json({
        success: false,
        message: `Cannot add ${item.quantity} items. Only ${product.stock} units available in stock${existingCart ? ' (you already have some in your cart)' : ''}.`,
        availableStock: product.stock
      }, { status: 400 });
    }

    // Use a single, efficient findOneAndUpdate operation similar to vendor cart
    const updatedCart = await UserCartModel.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        'items.productId': new mongoose.Types.ObjectId(item.productId)
      },
      {
        $inc: { 'items.$.quantity': item.quantity }
      },
      { new: true }
    );

    // If the item was not found in the cart, add it
    if (!updatedCart) {
      const cartWithNewItem = await UserCartModel.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        {
          $push: { items: { ...item, productId: new mongoose.Types.ObjectId(item.productId), vendorId: new mongoose.Types.ObjectId(item.vendorId) } },
          $setOnInsert: { userId: new mongoose.Types.ObjectId(userId) }
        },
        { upsert: true, new: true }
      );
      return NextResponse.json({ success: true, data: cartWithNewItem });
    }

    return NextResponse.json({ success: true, data: updatedCart });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to add item to cart', error: error.message }, { status: 500 });
  }
}

// PUT: Update item quantity in the cart
export async function PUT(req) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    const { productId, quantity } = await req.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json({ success: false, message: 'Product ID and quantity are required' }, { status: 400 });
    }

    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item
      const updatedCart = await UserCartModel.findOneAndUpdate(
        { userId },
        { $pull: { items: { productId } } },
        { new: true }
      );
      return NextResponse.json({ success: true, data: updatedCart || { userId, items: [] } });
    } else {
      // Validate stock before updating quantity
      const product = await ProductModel.findById(productId);

      if (!product) {
        return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
      }

      if (quantity > product.stock) {
        return NextResponse.json({
          success: false,
          message: `Cannot update quantity. Only ${product.stock} units available in stock.`,
          availableStock: product.stock
        }, { status: 400 });
      }

      // Otherwise, update the quantity
      const updatedCart = await UserCartModel.findOneAndUpdate(
        { userId, 'items.productId': productId },
        { $set: { 'items.$.quantity': quantity } },
        { new: true }
      );
      return NextResponse.json({ success: true, data: updatedCart });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update cart item', error: error.message }, { status: 500 });
  }
}

// DELETE: Remove an item from the cart
export async function DELETE(req) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    const updatedCart = await UserCartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedCart || { userId, items: [] } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to remove item from cart', error: error.message }, { status: 500 });
  }
}