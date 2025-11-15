import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class GetFilesDto extends PaginationDto {
    search?: string;
    mimeType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
