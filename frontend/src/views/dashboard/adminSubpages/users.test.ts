import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { createTestingPinia } from "@pinia/testing";
import users from "@/views/dashboard/adminSubpages/users.vue";
import { useUsers } from "@/composables/useUsers";
import { useAuthStore } from "@/stores/useAuthStore";
import type { User } from "@/types/User";
import type { PaginationResult } from "@/types/PaginationResult";

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

vi.mock("@/composables/useUsers", () => ({
    useUsers: vi.fn(),
}));

const mockUsers: User[] = [
    {
        id: 1,
        email: "alice@example.com",
        email_verified_at: "2026-01-01",
        password: "password",
        scope: "user",
        status: "active",
        first_name: "Alice",
        last_name: "Smith",
        phone: "+1234567890",
        gender: "woman",
        created_at: "2026-01-01",
        updated_at: "2026-01-02",
    },
    {
        id: 2,
        email: "bob@example.com",
        password: "password",
        scope: "vendor",
        status: "inactive",
        first_name: "Bob",
        last_name: "Jones",
        phone: "+10987654321",
        gender: "man",
        created_at: "2026-01-01",
        updated_at: "2026-01-02",
    },
];

const mockPagination: PaginationResult<User> = {
    data: mockUsers,
    current_page: 1,
    last_page: 1,
    first_page: 1,
    per_page: 20,
    total: 2,
    from: 1,
    to: 2,
};

const mountUsers = (user: Partial<User> | null = null, usersData: any = undefined, isLoading = false) => {
    vi.mocked(useUsers).mockReturnValue({
        data: ref(usersData),
        isLoading: ref(isLoading),
        error: null,
    } as any);

    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: true });

    if (user) {
        const authStore = useAuthStore(pinia);
        authStore.user = user as User;
    }

    return mount(users, {
        global: {
            plugins: [pinia],
        },
    });
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 30));

const openDialog = async (wrapper: ReturnType<typeof mountUsers>, buttonIndex: number) => {
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

describe("users.vue", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = "";
    });

    it("shows loading state", () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, undefined, true);
        expect(wrapper.text()).toContain("Loading...");
    });

    it("does not render the table while loading", () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, undefined, true);
        expect(wrapper.text()).not.toContain("A list of users");
    });

    it("renders users when data is available", () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        expect(wrapper.text()).toContain("alice@example.com");
        expect(wrapper.text()).toContain("bob@example.com");
        expect(wrapper.text()).toContain("Alice");
        expect(wrapper.text()).toContain("Smith");
    });

    it("renders user details in the table", () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        expect(wrapper.text()).toContain("user");
        expect(wrapper.text()).toContain("vendor");
        expect(wrapper.text()).toContain("active");
        expect(wrapper.text()).toContain("inactive");
        expect(wrapper.text()).toContain("+1234567890");
        expect(wrapper.text()).toContain("2026-01-02");
    });

    it("renders table headers", () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        expect(wrapper.text()).toContain("A list of users");
        expect(wrapper.text()).toContain("ID");
        expect(wrapper.text()).toContain("Email");
        expect(wrapper.text()).toContain("Email verified at");
        expect(wrapper.text()).toContain("Scope");
        expect(wrapper.text()).toContain("Status");
        expect(wrapper.text()).toContain("First name");
        expect(wrapper.text()).toContain("Last name");
        expect(wrapper.text()).toContain("Phone");
        expect(wrapper.text()).toContain("Date of Birth");
        expect(wrapper.text()).toContain("Gender");
        expect(wrapper.text()).toContain("Created at");
        expect(wrapper.text()).toContain("Updated at");
    });

    it("renders an empty table when there are no users", () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: { ...mockPagination, data: [] } });
        expect(wrapper.text()).toContain("A list of users");
        expect(wrapper.text()).not.toContain("alice@example.com");
    });

    it("renders an edit, delete, and add button", () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        expect(wrapper.findAll("button").length).toBe(8);
    });

    it("opens the edit dialog with the correct user id", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        const content = await openDialog(wrapper, 4);
        expect(content).toBeTruthy();
        expect(content!.textContent).toContain("Edit User of ID 1");
    });

    it("prefills the form with the user email", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        await openDialog(wrapper, 4);
        const emailInput = document.body.querySelector<HTMLInputElement>("#email");
        expect(emailInput!.value).toBe("alice@example.com");
    });

    it("submits the edit form with updated values", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        await openDialog(wrapper, 4);

        (wrapper.vm as any).email = "new@example.com";
        (wrapper.vm as any).scope = "user";
        (wrapper.vm as any).status = "active";
        submitDialogForm();
        await flush();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1, email: "new@example.com", scope: "user", status: "active" }),
        );
    });

    it("does not submit when the email is invalid", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        const content = await openDialog(wrapper, 4);

        setDialogInput("email", "not-an-email");
        (wrapper.vm as any).scope = "user";
        (wrapper.vm as any).status = "active";
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
        expect(content!.textContent).toContain("Invalid email");
    });

    it("does not submit when the phone number is invalid", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        const content = await openDialog(wrapper, 4);

        (wrapper.vm as any).email = "new@example.com";
        (wrapper.vm as any).scope = "user";
        (wrapper.vm as any).status = "active";
        setDialogInput("phone", "123");
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
        expect(content!.textContent).toContain("Must be a valid phone number");
    });

    it("blocks non-superadmins from assigning the SUPERADMIN scope", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        await openDialog(wrapper, 4);

        (wrapper.vm as any).email = "new@example.com";
        (wrapper.vm as any).status = "active";
        (wrapper.vm as any).scope = "SUPERADMIN";
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("allows superadmins to assign the SUPERADMIN scope", async () => {
        const wrapper = mountUsers({ id: 1, scope: "SUPERADMIN" }, { users: mockPagination });
        await openDialog(wrapper, 4);

        (wrapper.vm as any).email = "new@example.com";
        (wrapper.vm as any).status = "active";
        (wrapper.vm as any).scope = "SUPERADMIN";
        submitDialogForm();
        await flush();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1, email: "new@example.com", scope: "SUPERADMIN" }),
        );
    });

    it("opens the delete dialog with the correct user id", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        const content = await openDialog(wrapper, 5);
        expect(content!.textContent).toContain("Deletion of user of ID 1");
    });

    it("does not allow deleting your own account", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        await openDialog(wrapper, 5);
        clickDialogButton("Yes");
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("allows deleting another user", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        await openDialog(wrapper, 7);
        clickDialogButton("Yes");
        await flush();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(2);
    });

    it("opens the add user dialog", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        const content = await openDialog(wrapper, 3);
        expect(content).toBeTruthy();
        expect(content!.textContent).toContain("Add User");
    });

    it("submits the add form with valid values", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        await openDialog(wrapper, 3);

        (wrapper.vm as any).addEmail = "new@example.com";
        (wrapper.vm as any).addPassword = "password123";
        (wrapper.vm as any).addScope = "vendor";
        (wrapper.vm as any).addStatus = "active";
        submitDialogForm();
        await flush();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                email: "new@example.com",
                password: "password123",
                scope: "vendor",
                status: "active",
            }),
        );
    });

    it("does not submit when the add email is invalid", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        const content = await openDialog(wrapper, 3);

        setDialogInput("add-email", "not-an-email");
        (wrapper.vm as any).addPassword = "password123";
        (wrapper.vm as any).addScope = "user";
        (wrapper.vm as any).addStatus = "active";
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
        expect(content!.textContent).toContain("Invalid email");
    });

    it("does not submit when the password is too short", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        const content = await openDialog(wrapper, 3);

        (wrapper.vm as any).addEmail = "new@example.com";
        (wrapper.vm as any).addPassword = "short";
        (wrapper.vm as any).addScope = "user";
        (wrapper.vm as any).addStatus = "active";
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
        expect(content!.textContent).toContain("Password must be at least 8 characters");
    });

    it("does not submit when the add phone number is invalid", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        const content = await openDialog(wrapper, 3);

        (wrapper.vm as any).addEmail = "new@example.com";
        (wrapper.vm as any).addPassword = "password123";
        (wrapper.vm as any).addScope = "user";
        (wrapper.vm as any).addStatus = "active";
        setDialogInput("add-phone", "123");
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
        expect(content!.textContent).toContain("Must be a valid phone number");
    });

    it("blocks non-superadmins from creating a SUPERADMIN user", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockPagination });
        await openDialog(wrapper, 3);

        (wrapper.vm as any).addEmail = "new@example.com";
        (wrapper.vm as any).addPassword = "password123";
        (wrapper.vm as any).addStatus = "active";
        (wrapper.vm as any).addScope = "SUPERADMIN";
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("allows superadmins to create a SUPERADMIN user", async () => {
        const wrapper = mountUsers({ id: 1, scope: "SUPERADMIN" }, { users: mockPagination });
        await openDialog(wrapper, 3);

        (wrapper.vm as any).addEmail = "new@example.com";
        (wrapper.vm as any).addPassword = "password123";
        (wrapper.vm as any).addStatus = "active";
        (wrapper.vm as any).addScope = "SUPERADMIN";
        submitDialogForm();
        await flush();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({ email: "new@example.com", scope: "SUPERADMIN" }),
        );
    });
});
