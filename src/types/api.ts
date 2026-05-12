/** Envelope JSON chuẩn backend — ApiResponse<T> */
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error: Record<string, string> | string | null;
};

/** Spring Data Page — phần FE thường dùng */
export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements?: number;
  pageable?: { pageNumber: number; pageSize: number };
};
