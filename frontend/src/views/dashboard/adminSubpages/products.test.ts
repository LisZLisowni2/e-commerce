import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import products from "@/views/dashboard/adminSubpages/products.vue";
import { useProducts } from "@/composables/useProducts";
import { useUsers } from "@/composables/useUsers";
import { useCategoriesFlat } from "@/composables/useCategories";
import type { Product } from "@/types/Product";
import type { User } from "@/types/User";
import type { CategoryFlat } from "@/types/Category";

const elementProto = Element.prototype as any;
if (!elementProto.hasPointerCapture) {
    elementProto.hasPointerCapture = () => false;
    elementProto.setPointerCapture = () => {};
    elementProto.releasePointerCapture = () => {};
}

const mockMutate = vi.fn();

vi.mock("@tanstack/vue-query", () => ({
    useQueryClient: vi.fn(() => ({
        invalidateQueries: vi.fn(),
    })),
    useMutation: vi.fn(() => ({
        mutate: mockMutate,
    })),
}));

vi.mock("@/api", () => ({
    default: {
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock("@/composables/useProducts", () => ({
    useProducts: vi.fn(),
}));

vi.mock("@/composables/useUsers", () => ({
    useUsers: vi.fn(),
}));

vi.mock("@/composables/useCategories", () => ({
    useCategories: vi.fn(),
    useCategoriesFlat: vi.fn(),
}));

const mockProducts: Product[] = [
    {
        id: 1,
        vendor_id: 1,
        category_id: 1,
        name: "RTX 5070",
        description: "Graphics card",
        price: 3299.99,
        imageURL: "/rtx.jpg",
        last30DaysPrice: 3299.99,
        quantity: 5,
        created_at: "2026-01-01",
        updated_at: "2026-01-02",
    },
    {
        id: 2,
        vendor_id: 2,
        category_id: 2,
        name: "MacBook Pro",
        description: "Laptop",
        price: 12999.99,
        imageURL: "/macbook.jpg",
        last30DaysPrice: undefined,
        quantity: 2,
        created_at: "2026-01-01",
        updated_at: "2026-01-02",
    },
];

const mockCategories: CategoryFlat[] = [
    {
        id: 1,
        name: "Laptops",
        slug: "laptops",
        parent_id: undefined,
    },
    {
        id: 2,
        name: "Gaming Laptops",
        slug: "gaming-laptops",
        parent_id: 1,
    },
];

const mockVendors: User[] = [
    {
        id: 1,
        email: "vendor1@example.com",
        password: "password",
        scope: "vendor",
        status: "active",
    },
    {
        id: 2,
        email: "vendor2@example.com",
        password: "password",
        scope: "vendor",
        status: "active",
    },
];

const mountProducts = (data: Product[] | undefined = undefined, isLoading = false) => {
    vi.mocked(useProducts).mockReturnValue({
        data: ref(data),
        isLoading: ref(isLoading),
        error: null,
    } as any);

    vi.mocked(useUsers).mockReturnValue({
        data: ref({ users: mockVendors }),
        isLoading: ref(false),
        error: null,
    } as any);

    vi.mocked(useCategoriesFlat).mockReturnValue({
        data: ref({ categories: mockCategories }),
        isLoading: ref(false),
        error: null,
    } as any);

    return mount(products);
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 30));

const createImageFile = (size = 1024, name = "new-gpu.jpg", type = "image/jpeg") => {
    return new File([new ArrayBuffer(size)], name, { type });
};

const openDialog = async (wrapper: ReturnType<typeof mountProducts>, buttonIndex: number) => {
    wrapper.findAll("button")[buttonIndex].trigger("click");
    await flush();
    return document.body.querySelector<HTMLElement>('[data-slot="dialog-content"]');
};

const setDialogInput = (id: string, value: string) => {
    const input = document.body.querySelector<HTMLInputElement>(`#${id}`);
    input!.value = value;
    input!.dispatchEvent(new Event("input", { bubbles: true }));
};

const submitDialogForm = () => {
    const form = document.body.querySelector<HTMLFormElement>("form");
    form!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
};

const clickDialogButton = (text: string) => {
    const content = document.body.querySelector<HTMLElement>('[data-slot="dialog-content"]')!;
    const button = Array.from(content.querySelectorAll("button")).find(
        (b) => b.textContent === text,
    );
    button!.click();
};

const openVendorSelect = (content: HTMLElement) => {
    const trigger = content.querySelector<HTMLElement>('[data-slot="select-trigger"]');
    trigger!.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0, ctrlKey: false }));
};

describe("products.vue", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = "";
    });

    it("shows loading state", () => {
        const wrapper = mountProducts(undefined, true);
        expect(wrapper.text()).toContain("Loading...");
    });

    it("does not render the table while loading", () => {
        const wrapper = mountProducts(undefined, true);
        expect(wrapper.text()).not.toContain("A list of products");
    });

    it("renders products when data is available", () => {
        const wrapper = mountProducts(mockProducts);
        expect(wrapper.text()).toContain("RTX 5070");
        expect(wrapper.text()).toContain("MacBook Pro");
    });

    it("renders product details in the table", () => {
        const wrapper = mountProducts(mockProducts);
        expect(wrapper.text()).toContain("1");
        expect(wrapper.text()).toContain("2");
        expect(wrapper.text()).toContain("3299.99");
        expect(wrapper.text()).toContain("12999.99");
        expect(wrapper.text()).toContain("Graphics card");
        expect(wrapper.text()).toContain("/rtx.jpg");
        expect(wrapper.text()).toContain("2026-01-02");
    });

    it("renders table headers", () => {
        const wrapper = mountProducts(mockProducts);
        expect(wrapper.text()).toContain("A list of products");
        expect(wrapper.text()).toContain("ID");
        expect(wrapper.text()).toContain("Vendor ID");
        expect(wrapper.text()).toContain("Category ID");
        expect(wrapper.text()).toContain("Name");
        expect(wrapper.text()).toContain("Description");
        expect(wrapper.text()).toContain("Price");
        expect(wrapper.text()).toContain("Quantity");
        expect(wrapper.text()).toContain("Image URL");
        expect(wrapper.text()).toContain("Last 30 Days Price");
        expect(wrapper.text()).toContain("Created at");
        expect(wrapper.text()).toContain("Updated at");
    });

    it("filters products by name", async () => {
        const wrapper = mountProducts(mockProducts);
        const searchInput = wrapper.find("input");
        await searchInput.setValue("rtx");
        expect(wrapper.text()).toContain("RTX 5070");
        expect(wrapper.text()).not.toContain("MacBook Pro");
    });

    it("shows no rows when the filter matches nothing", async () => {
        const wrapper = mountProducts(mockProducts);
        await wrapper.find("input").setValue("nonexistent");
        expect(wrapper.text()).not.toContain("RTX 5070");
        expect(wrapper.text()).not.toContain("MacBook Pro");
    });

    it("renders an empty table when there are no products", () => {
        const wrapper = mountProducts([]);
        expect(wrapper.text()).toContain("A list of products");
        expect(wrapper.text()).not.toContain("RTX 5070");
    });

    it("renders an edit, delete, and add button", () => {
        const wrapper = mountProducts(mockProducts);
        expect(wrapper.findAll("button").length).toBe(5);
    });

    it("opens the edit dialog with the correct product id", async () => {
        const wrapper = mountProducts(mockProducts);
        const content = await openDialog(wrapper, 1);
        expect(content).toBeTruthy();
        expect(content!.textContent).toContain("Edit Product of ID 1");
    });

    it("opens the edit dialog for the second product", async () => {
        const wrapper = mountProducts(mockProducts);
        const content = await openDialog(wrapper, 3);
        expect(content!.textContent).toContain("Edit Product of ID 2");
    });

    it("prefills the form with the product name", async () => {
        const wrapper = mountProducts(mockProducts);
        await openDialog(wrapper, 1);
        const nameInput = document.body.querySelector<HTMLInputElement>("#name");
        expect(nameInput!.value).toBe("RTX 5070");
    });

    it("submits the edit form with updated values", async () => {
        const wrapper = mountProducts(mockProducts);
        await openDialog(wrapper, 1);
        setDialogInput("name", "RTX 5090");
        setDialogInput("price", "199.99");
        submitDialogForm();
        await flush();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1, name: "RTX 5090", price: 199.99 }),
        );
    });

    it("does not submit when the quantity is negative", async () => {
        const wrapper = mountProducts(mockProducts);
        const content = await openDialog(wrapper, 1);
        setDialogInput("quantity", "-1");
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
        expect(content!.textContent).toContain("Number must be greater than 0");
    });

    it("opens the delete dialog with the correct product id", async () => {
        const wrapper = mountProducts(mockProducts);
        const content = await openDialog(wrapper, 2);
        expect(content!.textContent).toContain("Deletion of product of ID 1");
    });

    it("calls the delete mutation when Yes is clicked", async () => {
        const wrapper = mountProducts(mockProducts);
        await openDialog(wrapper, 2);
        clickDialogButton("Yes");
        await flush();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(1);
    });

    it("opens the add product dialog", async () => {
        const wrapper = mountProducts(mockProducts);
        const content = await openDialog(wrapper, 0);
        expect(content).toBeTruthy();
        expect(content!.textContent).toContain("Add Product");
    });

    it("submits the add form with valid values", async () => {
        const wrapper = mountProducts(mockProducts);
        await openDialog(wrapper, 0);

        (wrapper.vm as any).addName = "New GPU";
        (wrapper.vm as any).addDescription = "A new graphics card";
        (wrapper.vm as any).addPrice = "499.99";
        (wrapper.vm as any).addQuantity = "10";
        (wrapper.vm as any).addImage = createImageFile();
        (wrapper.vm as any).addVendorId = "1";
        (wrapper.vm as any).addCategoryId = "1";
        submitDialogForm();
        await flush();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "New GPU",
                description: "A new graphics card",
                price: 499.99,
                quantity: 10,
                image: expect.any(File),
                vendor_id: 1,
                category_id: 1,
            }),
        );
    });

    it("does not submit when required add fields are missing", async () => {
        const wrapper = mountProducts(mockProducts);
        const content = await openDialog(wrapper, 0);

        (wrapper.vm as any).addVendorId = "1";
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
        expect(content!.textContent).toContain("Name is required");
        expect(content!.textContent).toContain("Max image size if 5MB");
    });

    it("does not submit when the add quantity is negative", async () => {
        const wrapper = mountProducts(mockProducts);
        const content = await openDialog(wrapper, 0);

        (wrapper.vm as any).addName = "New GPU";
        (wrapper.vm as any).addDescription = "A new graphics card";
        (wrapper.vm as any).addPrice = "499.99";
        (wrapper.vm as any).addImage = createImageFile();
        (wrapper.vm as any).addVendorId = "1";
        setDialogInput("add-quantity", "-1");
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
        expect(content!.textContent).toContain("Number must be greater than 0");
    });

    it("does not submit when no vendor is selected", async () => {
        const wrapper = mountProducts(mockProducts);
        const content = await openDialog(wrapper, 0);

        (wrapper.vm as any).addName = "New GPU";
        (wrapper.vm as any).addDescription = "A new graphics card";
        (wrapper.vm as any).addPrice = "499.99";
        (wrapper.vm as any).addQuantity = "10";
        (wrapper.vm as any).addImage = createImageFile();
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
        expect(content!.textContent).toContain("Please select a vendor");
    });

    it("does not submit when no category is selected", async () => {
        const wrapper = mountProducts(mockProducts);
        const content = await openDialog(wrapper, 0);

        (wrapper.vm as any).addName = "New GPU";
        (wrapper.vm as any).addDescription = "A new graphics card";
        (wrapper.vm as any).addPrice = "499.99";
        (wrapper.vm as any).addQuantity = "10";
        (wrapper.vm as any).addImage = createImageFile();
        (wrapper.vm as any).addVendorId = "1";
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
        expect(content!.textContent).toContain("Please select a category");
    });

    it("lists vendors in the add form dropdown", async () => {
        const wrapper = mountProducts(mockProducts);
        await openDialog(wrapper, 0);
        const content = document.body.querySelector<HTMLElement>('[data-slot="dialog-content"]')!;
        openVendorSelect(content);
        await flush();
        const selectContent = document.body.querySelector<HTMLElement>('[data-slot="select-content"]');
        expect(selectContent).toBeTruthy();
        expect(selectContent!.textContent).toContain("vendor1@example.com");
        expect(selectContent!.textContent).toContain("vendor2@example.com");
    });

    it("lists categories in the add form dropdown", async () => {
        const wrapper = mountProducts(mockProducts);
        await openDialog(wrapper, 0);
        const content = document.body.querySelector<HTMLElement>('[data-slot="dialog-content"]')!;
        const triggers = content.querySelectorAll<HTMLElement>('[data-slot="select-trigger"]');
        triggers[1].dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0, ctrlKey: false }));
        await flush();
        const selectContent = document.body.querySelector<HTMLElement>('[data-slot="select-content"]');
        expect(selectContent).toBeTruthy();
        expect(selectContent!.textContent).toContain("Laptops");
        expect(selectContent!.textContent).toContain("Gaming Laptops");
    });

    it("does not submit when the image file is too large", async () => {
        const wrapper = mountProducts(mockProducts);
        const content = await openDialog(wrapper, 0);

        (wrapper.vm as any).addName = "New GPU";
        (wrapper.vm as any).addDescription = "A new graphics card";
        (wrapper.vm as any).addPrice = "499.99";
        (wrapper.vm as any).addQuantity = "10";
        (wrapper.vm as any).addVendorId = "1";
        (wrapper.vm as any).addImage = createImageFile(5 * 1024 * 1024 + 1);
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
        expect(content!.textContent).toContain("Max image size if 5MB");
    });

    it("does not submit when the image type is not supported", async () => {
        const wrapper = mountProducts(mockProducts);
        const content = await openDialog(wrapper, 0);

        (wrapper.vm as any).addName = "New GPU";
        (wrapper.vm as any).addDescription = "A new graphics card";
        (wrapper.vm as any).addPrice = "499.99";
        (wrapper.vm as any).addQuantity = "10";
        (wrapper.vm as any).addVendorId = "1";
        (wrapper.vm as any).addImage = createImageFile(1024, "new-gpu.gif", "image/gif");
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
        expect(content!.textContent).toContain("Only .jpg, .jpeg, .png and .webp formats are supported.");
    });
});
