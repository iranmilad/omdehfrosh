// src/store/comments/slices/submitCommentActions.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../../Libs/httpcodes/httpcodes";

export const submitComment = createAsyncThunk(
  "comments/submitComment",
  async ({ productId, ...payload }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl(`/singleproduct/createproductcomments/${productId}`), {
        method: "POST",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = {
          status: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
          alreadyCommented: !!errorData?.alreadyCommented,
          productId, // so OrderItemComment can run onCommented only for this product
        };
        return rejectWithValue(error);
      }

      const data = await response.json();
      return { ...data, productId }; // so OrderItemComment can run onCommented only for this product
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);

