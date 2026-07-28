export interface Address {
    id: number;
    address_type: string;
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
}