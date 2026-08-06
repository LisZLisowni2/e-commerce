export interface PaginationResult<T> {
    data: T[],
    current_page: number,
    last_page: number,
    first_page: number,
    per_page: number,
    total: number,
    from: number | null,
    to: number | null
}