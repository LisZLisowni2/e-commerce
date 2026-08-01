export interface CategoryFlat {
    id: number,
    name: string,
    slug: string,
    parent_id?: number,
}

export interface Category {
    id: number,
    name: string,
    slug: string,
    parent_id?: number,
    children_recursive: Category[]
}