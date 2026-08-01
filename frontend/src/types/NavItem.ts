export interface NavItem {
    index: number;
    name: string;
    link: string;
    subnames: NavItem[];
}