import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { createTestingPinia } from "@pinia/testing";
import users from "@/views/dashboard/adminSubpages/users.vue";
import { useUsers } from "@/composables/useUsers";
import { useAuthStore } from "@/stores/useAuthStore";
import type { User } from "@/types/User";

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
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
        expect(wrapper.text()).toContain("alice@example.com");
        expect(wrapper.text()).toContain("bob@example.com");
        expect(wrapper.text()).toContain("Alice");
        expect(wrapper.text()).toContain("Smith");
    });

    it("renders user details in the table", () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
        expect(wrapper.text()).toContain("user");
        expect(wrapper.text()).toContain("vendor");
        expect(wrapper.text()).toContain("active");
        expect(wrapper.text()).toContain("inactive");
        expect(wrapper.text()).toContain("+1234567890");
        expect(wrapper.text()).toContain("2026-01-02");
    });

    it("renders table headers", () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
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

    it("filters users by email", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
        await wrapper.find("input").setValue("bob");
        expect(wrapper.text()).toContain("bob@example.com");
        expect(wrapper.text()).not.toContain("alice@example.com");
    });

    it("shows no rows when the filter matches nothing", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
        await wrapper.find("input").setValue("nonexistent");
        expect(wrapper.text()).not.toContain("alice@example.com");
        expect(wrapper.text()).not.toContain("bob@example.com");
    });

    it("renders an empty table when there are no users", () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: [] });
        expect(wrapper.text()).toContain("A list of users");
        expect(wrapper.text()).not.toContain("alice@example.com");
    });

    it("renders an edit and delete button for each user", () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
        expect(wrapper.findAll("button").length).toBe(4);
    });

    it("opens the edit dialog with the correct user id", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
        const content = await openDialog(wrapper, 0);
        expect(content).toBeTruthy();
        expect(content!.textContent).toContain("Edit User of ID 1");
    });

    it("prefills the form with the user email", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
        await openDialog(wrapper, 0);
        const emailInput = document.body.querySelector<HTMLInputElement>("#email");
        expect(emailInput!.value).toBe("alice@example.com");
    });

    it("submits the edit form with updated values", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
        await openDialog(wrapper, 0);

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
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
        const content = await openDialog(wrapper, 0);

        setDialogInput("email", "not-an-email");
        (wrapper.vm as any).scope = "user";
        (wrapper.vm as any).status = "active";
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
        expect(content!.textContent).toContain("Invalid email");
    });

    it("does not submit when the phone number is invalid", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
        const content = await openDialog(wrapper, 0);

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
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
        await openDialog(wrapper, 0);

        (wrapper.vm as any).email = "new@example.com";
        (wrapper.vm as any).status = "active";
        (wrapper.vm as any).scope = "SUPERADMIN";
        submitDialogForm();
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("allows superadmins to assign the SUPERADMIN scope", async () => {
        const wrapper = mountUsers({ id: 1, scope: "SUPERADMIN" }, { users: mockUsers });
        await openDialog(wrapper, 0);

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
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
        const content = await openDialog(wrapper, 1);
        expect(content!.textContent).toContain("Deletion of user of ID 1");
    });

    it("does not allow deleting your own account", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
        await openDialog(wrapper, 1);
        clickDialogButton("Yes");
        await flush();

        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("allows deleting another user", async () => {
        const wrapper = mountUsers({ id: 1, scope: "admin" }, { users: mockUsers });
        await openDialog(wrapper, 3);
        clickDialogButton("Yes");
        await flush();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(2);
    });
});
