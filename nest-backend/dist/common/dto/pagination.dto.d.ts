export declare class PaginationDto {
    page?: number;
    limit?: number;
}
export declare class PaginationResponseDto {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
