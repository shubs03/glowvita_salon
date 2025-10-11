import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { 
  setCurrentUser, 
  syncWithAPICart, 
  resetToGuest, 
  addToCart as addToLocalCart 
} from '@repo/store/slices/cartSlice';
import { 
  useGetClientCartQuery, 
  useAddToClientCartMutation
} from '@repo/store/api';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Helper function to convert local cart item to API format
const convertToAPIFormat = (localItem: any) => ({
  productId: localItem._id,
  productName: localItem.productName,
  productImage: localItem.productImage,
  quantity: localItem.quantity,
  price: localItem.price,
  vendorId: localItem.vendorId,
  supplierName: localItem.supplierName,
});

export const useCartSync = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const localCartItems = useAppSelector((state) => state.cart.items);
  const currentUserId = useAppSelector((state) => state.cart.currentUserId);
  
  const [addToCartAPI] = useAddToClientCartMutation();
  
  // Get API cart data
  const { data: apiCartData, refetch: refetchCart } = useGetClientCartQuery(
    undefined, 
    { skip: !isAuthenticated || !user?._id }
  );

  // Sync cart when user authentication status changes
  useEffect(() => {
    const handleUserChange = async () => {
      if (isAuthenticated && user?._id) {
        // User just logged in
        const userId = user._id;
        
        // Get guest cart items before switching
        const guestCartItems = currentUserId === 'guest' ? localCartItems : [];
        
        // Set current user first
        dispatch(setCurrentUser(userId));
        
        // Refetch API cart to get latest data
        const { data: freshCartData } = await refetchCart();
        const apiCartItems = freshCartData?.data?.items || [];
        
        // If there are guest cart items, merge them with API cart
        if (guestCartItems.length > 0) {
          try {
            console.log('Syncing guest cart with API cart...');
            
            // Add each guest item to API cart
            for (const guestItem of guestCartItems) {
              const apiItem = convertToAPIFormat(guestItem);
              await addToCartAPI(apiItem).unwrap();
            }
            
            // Refetch cart after adding items
            const { data: updatedCartData } = await refetchCart();
            const updatedApiCartItems = updatedCartData?.data?.items || [];
            
            // Sync local state with updated API cart
            dispatch(syncWithAPICart({ 
              apiCartItems: updatedApiCartItems, 
              userId 
            }));
            
            toast.success('Cart items synced successfully!');
          } catch (error) {
            console.error('Failed to sync cart:', error);
            toast.error('Failed to sync cart items');
            
            // Fallback: just sync with existing API cart
            dispatch(syncWithAPICart({ 
              apiCartItems, 
              userId 
            }));
          }
        } else {
          // No guest items, just sync with API cart
          dispatch(syncWithAPICart({ 
            apiCartItems, 
            userId 
          }));
        }
      } else {
        // User logged out or is not authenticated
        dispatch(resetToGuest());
      }
    };

    // Only run if the authentication status or user ID has changed
    const newUserId = isAuthenticated && user?._id ? user._id : 'guest';
    if (newUserId !== currentUserId) {
      handleUserChange();
    }
  }, [isAuthenticated, user?._id, dispatch, currentUserId]);

  return {
    syncCart: async () => {
      if (isAuthenticated && user?._id) {
        const { data: freshCartData } = await refetchCart();
        const apiCartItems = freshCartData?.data?.items || [];
        dispatch(syncWithAPICart({ 
          apiCartItems, 
          userId: user._id 
        }));
      }
    }
  };
};