export type GetPercentageResponse = PercentageItem[];

export interface PercentageItem {
  make?: string;
  model?: string;
  percentage: number;
}
