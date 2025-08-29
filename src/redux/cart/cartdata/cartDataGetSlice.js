import { createSlice } from "@reduxjs/toolkit";
import { fetchCartData, updateCartItem, removeCartItem } from './cartDataGetActions';


const cartDataSlice = createSlice({
  name: "cartData",
  initialState: {
    cart: [],
    totalPrice: 0,
    loadingCartData: false,
    errorCartData: null,
    lastFetchTime: null,
    rateLimited: false,
    retryAfter: null,
    // Update states
    updatingCartItem: false,
    updateCartItemError: null,
    removingCartItem: false,
    removeCartItemError: null,
  },
  reducers: {
    // Clear cart data
    clearCartData: (state) => {
      state.cart = [];
      state.totalPrice = 0;
      state.errorCartData = null;
      state.lastFetchTime = null;
      state.rateLimited = false;
      state.retryAfter = null;
    },
    
    // Clear errors
    clearCartErrors: (state) => {
      state.errorCartData = null;
      state.updateCartItemError = null;
      state.removeCartItemError = null;
      state.rateLimited = false;
      state.retryAfter = null;
    },
    
    // Set initial cart data (for backwards compatibility)
    setInitial: (state, action) => {
      state.cart = action.payload || [];
      state.totalPrice = action.payload?.reduce((total, item) => {
        return total + (item.price?.discountedPrice || item.price?.regularPrice || 0) * item.count;
      }, 0) || 0;
    },
    
    // Update local cart item (optimistic update)
    updateLocalCartItem: (state, action) => {
      const { productId, combinationsID, sellerId, quantity } = action.payload;
      const itemIndex = state.cart.findIndex(item => 
        item.productId === productId && 
        item.combinationsID === combinationsID && 
        item.seller_id === sellerId
      );
      
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          state.cart.splice(itemIndex, 1);
        } else {
          state.cart[itemIndex].count = quantity;
        }
        
        // Recalculate total price
        state.totalPrice = state.cart.reduce((total, item) => {
          return total + (item.price?.discountedPrice || item.price?.regularPrice || 0) * item.count;
        }, 0);
      }
    },
    
    // Remove local cart item (optimistic update)
    removeLocalCartItem: (state, action) => {
      const { productId, combinationsID, sellerId } = action.payload;
      state.cart = state.cart.filter(item => 
        !(item.productId === productId && 
          item.combinationsID === combinationsID && 
          item.seller_id === sellerId)
      );
      
      // Recalculate total price
      state.totalPrice = state.cart.reduce((total, item) => {
        return total + (item.price?.discountedPrice || item.price?.regularPrice || 0) * item.count;
      }, 0);
    },
    
    // Reset rate limit state
    resetRateLimit: (state) => {
      state.rateLimited = false;
      state.retryAfter = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart data
      .addCase(fetchCartData.pending, (state) => {
        state.loadingCartData = true;
        state.errorCartData = null;
      })
      .addCase(fetchCartData.fulfilled, (state, action) => {
        state.loadingCartData = false;
        state.cart = action.payload.cart || [];
        state.totalPrice = action.payload.totalPrice || 0;
        state.lastFetchTime = Date.now();
        state.rateLimited = false;
        state.retryAfter = null;
      })
      .addCase(fetchCartData.rejected, (state, action) => {
        state.loadingCartData = false;
        state.errorCartData = action.payload;
        
        // Handle rate limiting
        if (action.payload?.status === 429) {
          state.rateLimited = true;
          state.retryAfter = action.payload?.retryAfter || 60;
        }
      })
      
      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.updatingCartItem = true;
        state.updateCartItemError = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.updatingCartItem = false;
        // The optimistic update should already be applied
        // Here we can update with server response if needed
        if (action.payload?.cart) {
          state.cart = action.payload.cart;
          state.totalPrice = action.payload.totalPrice || 0;
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.updatingCartItem = false;
        state.updateCartItemError = action.payload;
        
        // Handle rate limiting
        if (action.payload?.status === 429) {
          state.rateLimited = true;
          state.retryAfter = action.payload?.retryAfter || 60;
        }
        
        // TODO: Revert optimistic update on error
        // You might want to refetch cart data here
      })
      
      // Remove cart item
      .addCase(removeCartItem.pending, (state) => {
        state.removingCartItem = true;
        state.removeCartItemError = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.removingCartItem = false;
        // The optimistic update should already be applied
        if (action.payload?.cart) {
          state.cart = action.payload.cart;
          state.totalPrice = action.payload.totalPrice || 0;
        }
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.removingCartItem = false;
        state.removeCartItemError = action.payload;
        
        // Handle rate limiting
        if (action.payload?.status === 429) {
          state.rateLimited = true;
          state.retryAfter = action.payload?.retryAfter || 60;
        }
        
        // TODO: Revert optimistic update on error
      });
  },
});

export const { 
  clearCartData, 
  clearCartErrors, 
  setInitial, 
  updateLocalCartItem, 
  removeLocalCartItem,
  resetRateLimit 
} = cartDataSlice.actions;

export default cartDataSlice.reducer;