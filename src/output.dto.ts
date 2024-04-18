export interface CollectionResponseMeta {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  sortBy?: [string, 'ASC' | 'DESC'][];
  search?: string;
  filter?: Record<string, string>;
}

export interface CollectionResponseLinks {
  first: string;
  previous: string;
  current: string;
  next: string;
  last: string;
}

export interface CollectionResponse<T> {
  data: T[];
  meta: CollectionResponseMeta;
  links: CollectionResponseLinks;
}
