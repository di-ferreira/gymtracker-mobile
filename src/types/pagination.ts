export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total_pages: number;
    has_previous: boolean;
    has_next: boolean;
    total_items: number;
  };
}
