
import { createSlice } from '@reduxjs/toolkit';

// Helper function to load cart from localStorage for a specific user
const loadCartFromStorage = (userId = 'guest') => {
  try {
    if (typeof window !== 'undefined') {
      const storageKey = `glowvita_cart_${userId}`;
      const serializedCart = localStorage.getItem(storageKey);
      if (serializedCart) {
        return JSON.parse(serializedCart);
      }
    }
  } catch (err) {
    console.warn('Failed to load cart from localStorage:', err);
  }
  return [];
};

// Helper function to save cart to localStorage for a specific user
const saveCartToStorage = (items, userId = 'guest') => {
  try {
    if (typeof window !== 'undefined') {
      const storageKey = `glowvita_cart_${userId}`;
      const serializedCart = JSON.stringify(items);
      localStorage.setItem(storageKey, serializedCart);
    }
  } catch (err) {
    console.warn('Failed to save cart to localStorage:', err);
  }
};

// Helper function to migrate guest cart to user cart
const migrateGuestCartToUser = (userId) => {
  try {
    if (typeof window !== 'undefined') {
      const guestCart = loadCartFromStorage('guest');
      const userCart = loadCartFromStorage(userId);
      
      if (guestCart.length > 0) {
        // Merge guest cart with user cart (user cart items take precedence)
        const mergedCart = [...userCart];
        
        guestCart.forEach(guestItem => {
          const existingItem = mergedCart.find(item => item._id === guestItem._id);
          if (existingItem) {
            // Increase quantity if item already exists
            existingItem.quantity += guestItem.quantity;
          } else {
            // Add new item if it doesn't exist
            mergedCart.push(guestItem);
          }
        });
        
        // Save merged cart to user's storage
        saveCartToStorage(mergedCart, userId);
        
        // Clear guest cart
        localStorage.removeItem('glowvita_cart_guest');
        
        return mergedCart;
      }
      
      return userCart;
    }
  } catch (err) {
    console.warn('Failed to migrate guest cart:', err);
    return loadCartFromStorage(userId);
  }
  return [];
};

const initialState = {
  items: loadCartFromStorage(), // Default to guest cart
  isOpen: false,
  currentUserId: 'guest', // Track current user
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Set the current user and load their cart
    setCurrentUser(state, action) {
      const userId = action.payload || 'guest';
      
      if (userId !== state.currentUserId) {
        // If switching from guest to logged-in user, migrate cart
        if (state.currentUserId === 'guest' && userId !== 'guest') {
          state.items = migrateGuestCartToUser(userId);
        } else {
          // Otherwise, just load the user's cart
          state.items = loadCartFromStorage(userId);
        }
        state.currentUserId = userId;
      }
    },

    // Sync local cart items with API cart (for when user logs in)
    syncWithAPICart(state, action) {
      const { apiCartItems, userId } = action.payload;
      
      if (userId !== 'guest') {
        // Replace local items with API items
        state.items = apiCartItems || [];
        state.currentUserId = userId;
        
        // Save the synced cart to localStorage
        saveCartToStorage(state.items, userId);
      }
    },

    // Clear cart and reset to guest (for logout)
    resetToGuest(state) {
      state.items = [];
      state.currentUserId = 'guest';
      saveCartToStorage([], 'guest');
    },
    
    addToCart(state, action) {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item._id === newItem._id);

      if (existingItem) {
        existingItem.quantity += newItem.quantity || 1;
      } else {
        state.items.push({ ...newItem, quantity: newItem.quantity || 1 });
      }
      
      // Save to localStorage for current user
      saveCartToStorage(state.items, state.currentUserId);
    },
    
    updateQuantity(state, action) {
      const { _id, quantity } = action.payload;
      const item = state.items.find(item => item._id === _id);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
      
      // Save to localStorage for current user
      saveCartToStorage(state.items, state.currentUserId);
    },
    
    removeFromCart(state, action) {
      const idToRemove = action.payload;
      state.items = state.items.filter(item => item._id !== idToRemove);
      
      // Save to localStorage for current user
      saveCartToStorage(state.items, state.currentUserId);
    },
    
    clearCart(state) {
      state.items = [];
      
      // Save to localStorage for current user
      saveCartToStorage(state.items, state.currentUserId);
    },
    
    setCartOpen(state, action) {
      state.isOpen = action.payload;
    },
  },
});

export const { 
    setCurrentUser,
    syncWithAPICart,
    resetToGuest,
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    setCartOpen
} = cartSlice.actions;

// Selector to get cart items count
export const selectCartItemsCount = (state) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

// Selector to get cart total
export const selectCartTotal = (state) => 
  state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

export default cartSlice.reducer;
