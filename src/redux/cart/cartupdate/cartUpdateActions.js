// cartUpdateActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl } from '../../../Libs/utils/apiutils/apiutils';

export const updateCart = createAsyncThunk(
  'cart/updateCart',
  async (body, { rejectWithValue }) => {
    const token = localStorage.getItem('user');

    try {
      const response = await fetch(getApiUrl('/cart/updatesubscription'), {
        method: 'POST',
        headers: new Headers({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update cart');
      }

      const cartRes = await fetch(getApiUrl('/cart'), {
        headers: new Headers({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }),
      });

      if (!cartRes.ok) {
        return rejectWithValue('Failed to fetch cart data');
      }

      const serverData = await cartRes.json();
      const cart = serverData.cart || [];
      const total = cart.reduce(
        (sum, item) => sum + item.price.discountedPrice * item.count,
        0
      );

      return { cart, total };

    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);
