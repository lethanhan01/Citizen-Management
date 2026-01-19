export type ApiParams = Record<string, string | number | boolean | null | undefined>;

export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  pagination?: Pagination;
};

export type UnknownRecord = Record<string, unknown>;
