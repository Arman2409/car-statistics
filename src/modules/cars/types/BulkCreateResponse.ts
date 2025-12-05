export interface BulkCreateResponse {
    created: number;
    failed: number;
    errors: BulkCreateError[];
}

export interface BulkCreateError {
    index: number;
    message: string;
}