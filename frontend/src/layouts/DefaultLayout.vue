<script setup lang="ts">
import { useForm, useField } from "vee-validate";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { computed, onMounted, ref } from "vue";
import { RouterView } from "vue-router";
import { useThemeStore } from "@/stores/useThemeStore";
import Button from "@/components/ui/button/Button.vue";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import IconDropdown from "@/components/navigation/IconDropdown.vue";
import {
    CircleUserRound,
    Phone,
    ShoppingBasket,
} from "lucide-vue-next";
import { useProducts } from "@/composables/useProducts";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/composables/useUser.ts";
import api from "@/api.ts";
import { useAuthStore } from "@/stores/useAuthStore.ts";
import router from "@/router/router.ts";
import FormField from "@/components/ui/FormField.vue";
import { useCategories } from "@/composables/useCategories";
import type { Category } from "@/types/Category";
import type { NavItem } from "@/types/NavItem";
import NavSubMenu from "@/components/navigation/NavSubMenu.vue";
import { 
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem
} from "@/components/ui/command"

const query = ref("")
const { data: products } = useProducts({ searchQuery: query.value })

const queryResults = computed(() => {
    if (query.value === "") return []

    return products.value
})

const authStore = useAuthStore();

onMounted(async () => {
    const { error } = useUser();

    if (error.value) {
        authStore.logout();
    }
});

const { data } = useCategories();
const themeStore = useThemeStore();

function extractSubcategories(categories: Category[]): NavItem[] {
    return categories.map((category) => {
        if (category.children_recursive.length > 0) {
            return {
                index: category.id,
                name: category.name,
                link: `/${category.slug}`,
                subnames: extractSubcategories(category.children_recursive),
            };
        } else {
            return {
                index: category.id,
                name: category.name,
                link: `/${category.slug}`,
                subnames: [],
            };
        }
    });
}

const navElements = computed(() => {
    if (!data.value) return [];

    const nav = extractSubcategories(data.value.categories);
    return nav
});

const loginForm = z.object({
    email: z
        .string()
        .min(1, { message: "Email address is required" })
        .email("Must be a valid email address"),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
});

type loginFormValue = z.infer<typeof loginForm>;

const { handleSubmit, errors } = useForm<loginFormValue>({
    validationSchema: toTypedSchema(loginForm),
});

const queryClient = useQueryClient();
const { value: email } = useField<string>("email");
const { value: password } = useField<string>("password");

const { refetch: fetchUserProfile } = useUser();

const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (credentials: loginFormValue) => {
        const { data } = await api.post("/login", credentials);
        return data;
    },
    mutationKey: ["user"],
    onSuccess: async (res) => {
        authStore.setToken(res.token);
        queryClient.invalidateQueries();
        await fetchUserProfile();
    },
    onError: () => {
        console.error(`Authentication failed. Email or password wrong`);
    },
});

const onSubmit = handleSubmit((data) => {
    mutate({ email: data.email, password: data.password });
});

const { mutate: logoutMutate } = useMutation({
    mutationFn: async () => {
        const { data } = await api.post("/logout");
        return data;
    },
    mutationKey: ["user"],
    onSuccess: async () => {
        authStore.logout();

        router.push("/");
        // window.location.reload()
    },
    onError: () => {
        console.error(`Logout failed. Server error probably`);
    },
});

const onLogoutSubmit = () => {
    logoutMutate();
};
</script>

<template>
    <header class="flex max-md:flex-col items-center w-full gap-4 px-4 py-2">
        <div class="flex flex-row max-md:flex-col items-center gap-4 shrink-0">
            <RouterLink to="/"
                ><h1 class="text-xl sm:text-3xl text-amber-500">
                    E-commerce
                </h1></RouterLink
            >
            <Button
                @click="
                    themeStore.mode === 'light'
                        ? (themeStore.mode = 'dark')
                        : (themeStore.mode = 'light')
                "
            >
                Theme
            </Button>
        </div>
        <div class="relative w-full z-50">
            <Command class="z-50 rounded-lg border border-zinc-800">
                <CommandInput 
                    placeholder="Search..."
                    v-model="query"
                />
                
                <CommandList v-if="query.trim().length > 0" class="absolute top-full left-0 right-0 mt-1 z-50 min-h-40 rounded-md border border-zinc-800 bg-zinc-950 shadow-xl">
                    <CommandEmpty>No result found</CommandEmpty>
                    <CommandGroup heading="Results">
                        <CommandItem v-for="product in queryResults" :value="product.id">
                            {{ product.name }}
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
        </div>
        <div class="flex gap-4 shrink-0 max-md:m-auto ml-auto">
            <IconDropdown>
                <template #icon>
                    <Phone />
                </template>
                <template #content>
                    <DropdownMenuItem>
                        <h1>+48000000000</h1>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <h1>ecommerce@gmail.com</h1>
                    </DropdownMenuItem>
                </template>
            </IconDropdown>
            <IconDropdown>
                <template #icon>
                    <CircleUserRound />
                </template>
                <template v-if="!authStore.isAuthenticated" #content>
                    <DropdownMenuItem @select.prevent>
                        <Dialog>
                            <DialogTrigger as-child>
                                <span class="w-full cursor-pointer">Login</span>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Login form</DialogTitle>
                                </DialogHeader>
                                <form @submit.prevent="onSubmit">
                                    <div class="grid gap-4 p-3">
                                        <FormField>
                                            <Label for="email-1">Email</Label>
                                            <Input
                                                id="email-1"
                                                v-model="email"
                                                name="email"
                                                type="email"
                                            />
                                            <span
                                                class="text-red-500"
                                                v-if="errors.email"
                                                >{{ errors.email }}</span
                                            >
                                        </FormField>
                                        <FormField>
                                            <Label for="password-1"
                                                >Password</Label
                                            >
                                            <Input
                                                id="password-1"
                                                v-model="password"
                                                name="password"
                                                type="password"
                                            />
                                            <span
                                                class="text-red-500"
                                                v-if="errors.password"
                                                >{{ errors.password }}</span
                                            >
                                            <span
                                                class="text-red-500"
                                                v-if="isError"
                                                >{{ error }}</span
                                            >
                                        </FormField>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" v-if="!isPending"
                                            >Login</Button
                                        >
                                        <Button v-else variant="ghost"
                                            >Login</Button
                                        >
                                        <DialogClose as-child>
                                            <RouterLink to="/register"
                                                ><Button variant="outline"
                                                    >Register</Button
                                                ></RouterLink
                                            >
                                        </DialogClose>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </DropdownMenuItem>
                    <DropdownMenuItem @select.prevent>
                        <RouterLink to="/register">
                            <span class="w-full cursor-pointer">Register</span>
                        </RouterLink>
                    </DropdownMenuItem>
                </template>
                <template v-else #content>
                    <DropdownMenuItem @select.prevent>
                        <RouterLink to="/profile">
                            <span class="w-full cursor-pointer">Profile</span>
                        </RouterLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        v-if="
                            authStore.user?.scope === 'admin' ||
                            authStore.user?.scope === 'superadmin'
                        "
                        @select.prevent
                    >
                        <RouterLink to="/admin/dashboard">
                            <span class="w-full cursor-pointer"
                                >Admin Dashboard</span
                            >
                        </RouterLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        v-if="
                            authStore.user?.scope === 'support' ||
                            authStore.user?.scope === 'superadmin'
                        "
                        @select.prevent
                    >
                        <RouterLink to="/support/dashboard">
                            <span class="w-full cursor-pointer"
                                >Support Dashboard</span
                            >
                        </RouterLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        v-if="
                            authStore.user?.scope === 'vendor' ||
                            authStore.user?.scope === 'superadmin'
                        "
                        @select.prevent
                    >
                        <RouterLink to="/vendor/dashboard">
                            <span class="w-full cursor-pointer"
                                >Vendor Dashboard</span
                            >
                        </RouterLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem @select.prevent>
                        <Dialog>
                            <DialogTrigger as-child>
                                <span class="w-full cursor-pointer"
                                    >Logout</span
                                >
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Logout</DialogTitle>
                                </DialogHeader>
                                <form @submit.prevent="onLogoutSubmit">
                                    <h1>Are you sure?</h1>
                                    <DialogFooter>
                                        <Button type="submit">Yes</Button>
                                        <Button type="clear" variant="ghost"
                                            >No</Button
                                        >
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </DropdownMenuItem>
                </template>
            </IconDropdown>
            <IconDropdown>
                <template #icon>
                    <ShoppingBasket />
                </template>
                <template #content>
                    <DropdownMenuItem>
                        <h1>Test</h1>
                    </DropdownMenuItem>
                </template>
            </IconDropdown>
        </div>
    </header>
    <nav class="flex justify-center">
        <NavigationMenu>
            <NavigationMenuList
                class="max-w-dvw flex flex-col sm:flex-row justify-center items-center overflow-auto"
            >
                <NavigationMenuItem
                    v-for="item in navElements"
                    :key="item.index"
                >
                    <!-- If item has subnames, render Trigger + Content panel -->
                    <template v-if="item.subnames && item.subnames.length > 0">
                        <NavigationMenuTrigger>
                            <RouterLink :to="item.link">
                                {{ item.name }}
                            </RouterLink>
                        </NavigationMenuTrigger>

                        <NavigationMenuContent>
                            <!-- Render recursive component inside content viewport -->
                            <div class="w-56 p-3">
                                <NavSubMenu :items="item.subnames" />
                            </div>
                        </NavigationMenuContent>
                    </template>

                    <!-- Top-level leaf link (no subitems) -->
                    <NavigationMenuLink
                        v-else
                        :href="item.link || '#'"
                        :class="navigationMenuTriggerStyle()"
                    >
                        {{ item.name }}
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    </nav>
    <main class="bg-zinc-50 min-h-screen dark:bg-zinc-900">
        <router-view />
    </main>
    <footer class="p-8 flex flex-col justify-center items-center">
        <p>Copyright</p>
    </footer>
</template>
