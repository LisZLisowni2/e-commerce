import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import categories from "@/views/dashboard/adminSubpages/categories.vue";
import { useCategoriesFlat } from "@/composables/useCategories";
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

vi.mock("@/composables/useCategories", () => ({
    useCategories: vi.fn(),
    useCategoriesFlat: vi.fn(),
}));

const mockCategories: CategoryFlat[] = [
    {
        id: 1,
        name: "Laptops",
        slug: "laptops",
        parent_id: null,
    },
    {
        id: 2,
        name: "Gaming",
        slug: "laptops-gaming",
        parent_id: 1,
    },
];

const mountCategories = (data: CategoryFlat[] | undefined = undefined, isLoading = false) => {
    vi.mocked(useCategoriesFlat).mockReturnValue({
        data: ref({ categories: data }),
        isLoading: ref(isLoading),
        error: null,
    } as any);

    return mount(categories);
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 30));

const openDialog = async (wrapper: ReturnType<typeof mountCategories>, buttonIndex: number) => {
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

describe("categories.vue", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = "";
    });

    it("shows loading state", () => {
        const wrapper = mountCategories(undefined, true);
        expect(wrapper.text()).toContain("Loading...");
    });

    it("does not render the table while loading", () => {
        const wrapper = mountCategories(undefined, true);
        expect(wrapper.text()).not.toContain("A list of categories");
    });

    it("renders categories when data is available", () => {
        const wrapper = mountCategories(mockCategories);
        expect(wrapper.text()).toContain("Laptops");
        expect(wrapper.text()).toContain("Gaming");
        expect(wrapper.text()).toContain("laptops-gaming");
    });

    it("renders category details in the table", () => {
        const wrapper = mountCategories(mockCategories);
        expect(wrapper.text()).toContain("1");
        expect(wrapper.text()).toContain("2");
        expect(wrapper.text()).toContain("laptops");
        expect(wrapper.text()).toContain("1");
    });

    it("renders table headers", () => {
        const wrapper = mountCategories(mockCategories);
        expect(wrapper.text()).toContain("A list of categories");
        expect(wrapper.text()).toContain("ID");
        expect(wrapper.text()).toContain("Name");
        expect(wrapper.text()).toContain("Slug");
        expect(wrapper.text()).toContain("Parent ID");
    });

    it("filters categories by name", async () => {
        const wrapper = mountCategories(mockCategories);
        await wrapper.find("input").setValue("gaming");
        expect(wrapper.text()).toContain("Gaming");
        expect(wrapper.text()).not.toContain("Laptops");
    });

    it("shows no rows when the filter matches nothing", async () => {
        const wrapper = mountCategories(mockCategories);
        await wrapper.find("input").setValue("nonexistent");
        expect(wrapper.text()).not.toContain("Laptops");
        expect(wrapper.text()).not.toContain("Gaming");
    });

    it("renders an empty table when there are no categories", () => {
        const wrapper = mountCategories([]);
        expect(wrapper.text()).toContain("A list of categories");
        expect(wrapper.text()).not.toContain("Laptops");
    });

    it("renders an add, edit, and delete button", () => {
        const wrapper = mountCategories(mockCategories);
        expect(wrapper.findAll("button").length).toBe(5);
    });

    it("opens the add category dialog", async () => {
        const wrapper = mountCategories(mockCategories);
        const content = await openDialog(wrapper, 0);
        expect(content).toBeTruthy();
        expect(content!.textContent).toContain("Add Product");
    });

    it("submits the add form with valid values", async () => {
        const wrapper = mountCategories(mockCategories);
        await openDialog(wrapper, 0);

        (wrapper.vm as any).addName = "Accessories";
        (wrapper.vm as any).addParentID = null;
        submitDialogForm();
        await flush();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "Accessories",
                parent_id: null,
            }),
        );
    });

    it("submits the add form with a parent category", async () => {
        const wrapper = mountCategories(mockCategories);
        await openDialog(wrapper, 0);

        (wrapper.vm as any).addName = "Accessories";
        (wrapper.vm as any).addParentID = "1";
        submitDialogForm();
        await flush();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "Accessories",
                parent_id: 1,
            }),
        );
    });

    it("does not submit when the add name is missing", async () => {
        const wrapper = mountCategories(mockCategories);
        const content = await openDialog(wrapper, 0);

        (wrapper.vm as any).addParentID = null;
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
        expect(content!.textContent).toContain("Name is required");
    });

    it("opens the edit dialog with the correct category id", async () => {
        const wrapper = mountCategories(mockCategories);
        const content = await openDialog(wrapper, 1);
        expect(content).toBeTruthy();
        expect(content!.textContent).toContain("Edit category of ID 1");
    });

    it("prefills the form with the category name", async () => {
        const wrapper = mountCategories(mockCategories);
        await openDialog(wrapper, 1);
        const nameInput = document.body.querySelector<HTMLInputElement>("#name");
        expect(nameInput!.value).toBe("Laptops");
    });

    it("submits the edit form with updated values", async () => {
        const wrapper = mountCategories(mockCategories);
        await openDialog(wrapper, 1);

        (wrapper.vm as any).name = "Laptops Pro";
        (wrapper.vm as any).parentID = "2";
        submitDialogForm();
        await flush();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 1,
                name: "Laptops Pro",
                parent_id: 2,
            }),
        );
    });

    it("opens the delete dialog with the correct category id", async () => {
        const wrapper = mountCategories(mockCategories);
        const content = await openDialog(wrapper, 2);
        expect(content!.textContent).toContain("Deletion of category of ID 1");
    });

    it("calls the delete mutation when Yes is clicked", async () => {
        const wrapper = mountCategories(mockCategories);
        await openDialog(wrapper, 2);
        clickDialogButton("Yes");
        await flush();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(1);
    });
});
