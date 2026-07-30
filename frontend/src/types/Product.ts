export interface Product {
    id: number;
    vendor_id: number;
    name: string;
    description: string;
    price: number;
    imageURL: string;
    last30DaysPrice: number | undefined;
    quantity: number;
    created_at: string;
    updated_at: string;
}
