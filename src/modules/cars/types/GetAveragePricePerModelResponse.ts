export type GetAveragePricePerModelResponse = AveragePriceItem[];

export interface AveragePriceItem {
    make: string;
    model: string;
    averagePrice: number;
}