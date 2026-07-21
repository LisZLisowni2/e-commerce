export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageURL: string;
    last30DaysPrice: number | undefined;
    created_at: string;
    updated_at: string;
}
