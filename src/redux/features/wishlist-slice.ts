import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  addToWishlistApi,
  getWishlistApi,
  removeFromWishlistByProductId,
  removeFromWishlistById,
  clearAllWishlistApi,
  checkWishlistStatus,
} from "@/utils/wishlistApi";

// --- Types ---
export type WishlistProduct = {
  id: number;
  name: string;
  price: number;
  discountedPrice?: number;
  images?: { id: number; linkImage: string }[];
  [key: string]: any;
};

export type WishlistVariant = {
  id: number;
  name?: string;
  [key: string]: any;
};

export type WishListItem = {
  id: number; // wishlist record ID
  createdAt: string;
  product: WishlistProduct;
  variant?: WishlistVariant | null;
};

type WishlistState = {
  items: WishListItem[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  // Map of productId -> boolean for quick "is liked" check
  likedMap: Record<number, boolean>;
};

const initialState: WishlistState = {
  items: [],
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  loading: false,
  error: null,
  likedMap: {},
};

// --- Async Thunks ---

// Thêm sản phẩm vào wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (
    { productId, variantId }: { productId: number; variantId?: number | null },
    { rejectWithValue }
  ) => {
    try {
      const data = await addToWishlistApi(productId, variantId);
      if (data.success) {
        return { productId, data: data.data };
      }
      return rejectWithValue(data.message || "Không thể thêm vào yêu thích");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể thêm vào yêu thích"
      );
    }
  }
);

// Lấy danh sách wishlist
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (
    { page, size }: { page?: number; size?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const data = await getWishlistApi(page || 0, size || 10);
      if (data.success) {
        return data.data; // { content, totalPages, totalElements, ... }
      }
      return rejectWithValue(data.message || "Không thể tải danh sách yêu thích");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể tải danh sách yêu thích"
      );
    }
  }
);

// Kiểm tra trạng thái yêu thích
export const checkIsLiked = createAsyncThunk(
  "wishlist/checkIsLiked",
  async (productId: number, { rejectWithValue }) => {
    try {
      const isLiked = await checkWishlistStatus(productId);
      return { productId, isLiked };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể kiểm tra trạng thái"
      );
    }
  }
);

// Xóa khỏi wishlist theo productId
export const removeByProductId = createAsyncThunk(
  "wishlist/removeByProductId",
  async (productId: number, { rejectWithValue }) => {
    try {
      const data = await removeFromWishlistByProductId(productId);
      if (data.success) {
        return productId;
      }
      return rejectWithValue(data.message || "Không thể xóa khỏi yêu thích");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể xóa khỏi yêu thích"
      );
    }
  }
);

// Xóa khỏi wishlist theo wishlist record ID
export const removeByWishlistId = createAsyncThunk(
  "wishlist/removeByWishlistId",
  async (wishlistId: number, { rejectWithValue }) => {
    try {
      const data = await removeFromWishlistById(wishlistId);
      if (data.success) {
        return wishlistId;
      }
      return rejectWithValue(data.message || "Không thể xóa khỏi yêu thích");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể xóa khỏi yêu thích"
      );
    }
  }
);

// Xóa toàn bộ wishlist
export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const data = await clearAllWishlistApi();
      if (data.success) {
        return true;
      }
      return rejectWithValue(data.message || "Không thể xóa toàn bộ");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể xóa toàn bộ"
      );
    }
  }
);

// Toggle wishlist (thêm nếu chưa có, xóa nếu đã có)
export const toggleWishlist = createAsyncThunk(
  "wishlist/toggleWishlist",
  async (productId: number, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const isLiked = state.wishlistReducer.likedMap[productId];

      if (isLiked) {
        await dispatch(removeByProductId(productId)).unwrap();
        return { productId, isLiked: false };
      } else {
        await dispatch(addToWishlist({ productId })).unwrap();
        return { productId, isLiked: true };
      }
    } catch (err: any) {
      return rejectWithValue(err || "Không thể thao tác");
    }
  }
);

// --- Slice ---
export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setLikedStatus: (
      state,
      action: PayloadAction<{ productId: number; isLiked: boolean }>
    ) => {
      state.likedMap[action.payload.productId] = action.payload.isLiked;
    },
  },
  extraReducers: (builder) => {
    // fetchWishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.content || [];
        state.totalPages = action.payload.totalPages || 0;
        state.totalElements = action.payload.totalElements || 0;
        state.currentPage = action.payload.pageable?.pageNumber || 0;
        // Update likedMap from fetched items
        (action.payload.content || []).forEach((item: WishListItem) => {
          if (item.product?.id) {
            state.likedMap[item.product.id] = true;
          }
        });
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // addToWishlist
    builder
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.likedMap[action.payload.productId] = true;
        if (!state.items.some((i) => i.product?.id === action.payload.productId)) {
          state.totalElements += 1;
        }
      });

    // checkIsLiked
    builder
      .addCase(checkIsLiked.fulfilled, (state, action) => {
        state.likedMap[action.payload.productId] = action.payload.isLiked;
      });

    // removeByProductId
    builder
      .addCase(removeByProductId.fulfilled, (state, action) => {
        const productId = action.payload;
        state.likedMap[productId] = false;
        const hadItem = state.items.some((item) => item.product?.id === productId);
        state.items = state.items.filter(
          (item) => item.product?.id !== productId
        );
        if (hadItem && state.totalElements > 0) {
          state.totalElements -= 1;
        }
      });

    // removeByWishlistId
    builder
      .addCase(removeByWishlistId.fulfilled, (state, action) => {
        const wishlistId = action.payload;
        const removedItem = state.items.find((item) => item.id === wishlistId);
        if (removedItem?.product?.id) {
          state.likedMap[removedItem.product.id] = false;
        }
        state.items = state.items.filter((item) => item.id !== wishlistId);
      });

    // clearWishlist
    builder
      .addCase(clearWishlist.fulfilled, (state) => {
        state.items = [];
        state.likedMap = {};
        state.totalElements = 0;
        state.totalPages = 0;
      });

    // toggleWishlist
    builder
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.likedMap[action.payload.productId] = action.payload.isLiked;
      });
  },
});

export const { setLikedStatus } = wishlist.actions;
export default wishlist.reducer;
