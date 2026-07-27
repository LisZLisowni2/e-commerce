export interface Address {
    address_type: string;
    is_default: boolean;
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    state_province: string;
    postal_code: string;
    country_code: string;
}