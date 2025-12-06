export interface BulkCreateResponse {
    created: number;
    failed: number;
    errors: BulkCreationError[];
}

export interface BulkCreationError {
    index: number;
    message: string;
}