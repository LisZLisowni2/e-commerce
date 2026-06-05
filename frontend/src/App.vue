<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { computed, ref, watch } from "vue";
import { RouterView } from "vue-router";
import { useThemeStore } from "./stores/useThemeStore";
import Button from "./components/ui/button/Button.vue";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import IconDropdown from "./components/navigation/IconDropdown.vue";
import {
    ChevronsUpDown,
    Check,
    Search,
    CircleUserRound,
    Phone,
    ShoppingBasket,
} from "lucide-vue-next";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "./components/ui/input-group";
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
import { useUser } from "./composables/useUser.ts";
import { onMounted } from "vue";

onMounted(() => useUser())

const themeStore = useThemeStore();

const navElements = computed(() => [
    {
        index: 0,
        name: "Laptop",
        link: "/laptop",
        subnames: [
            {
                index: 1,
                name: "Mac",
                link: "/laptop/mac",
            },
            {
                index: 2,
                name: "Gaming",
                link: "/laptop/gaming",
            },
            {
                index: 3,
                name: "Ultrabook",
                link: "/laptop/ultrabook",
            },
        ],
    },
    {
        index: 4,
        name: "Desktop",
        link: "/desktop",
        subnames: [
            {
                index: 5,
                name: "Gaming",
                link: "/desktop/gaming",
            },
            {
                index: 6,
                name: "Ready for AI",
                link: "/desktop/ai",
            },
            {
                index: 7,
                name: "Workstation",
                link: "/desktop/workstation",
            },
        ],
    },
    {
        index: 8,
        name: "Peripherials",
        link: "/peripheral",
        subnames: [
            {
                index: 9,
                name: "Mouse",
                link: "/peripheral/mouse",
            },
            {
                index: 10,
                name: "Keyboard",
                link: "/peripheral/keyboard",
            },
            {
                index: 11,
                name: "Headset",
                link: "/peripheral/headset",
            },
        ],
    },
    {
        index: 12,
        name: "Server",
        link: "/server",
        subnames: [
            {
                index: 13,
                name: "Home lab",
                link: "/server/home",
            },
            {
                index: 14,
                name: "Business",
                link: "/server/businnes",
            },
        ],
    },
]);

const loginForm = z.object({
    email: z.string()
        .min(1, { message: "Email address is required" })
        .email("Must be a valid email address"),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" })
})

type loginFormValue = z.infer<typeof loginForm>

const { handleSubmit, errors } = useForm<loginFormValue>({
    validationSchema: toTypedSchema(loginForm)
})

const { value: email } = useField<string>("email")
const { value: password } = useField<string>("password")

const onSubmit = handleSubmit((data) => {
    console.log(`Data: ${JSON.stringify(data, null, 2)}`)
})
</script>

<template>
    <header class="flex max-md:flex-col items-center w-full gap-4 px-4 py-2">
        <div class="flex flex-row max-md:flex-col items-center gap-4 shrink-0">
            <RouterLink to="/"><h1 class="text-xl sm:text-3xl text-amber-500">E-commerce</h1></RouterLink>
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
        <div class="flex-1">
            <InputGroup>
                <InputGroupInput placeholder="Search..." />
                <InputGroupAddon>
                    <Search />
                </InputGroupAddon>
            </InputGroup>
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
                <template #content>
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
                                        <div class="grid gap-3">
                                            <Label for="email-1">Email</Label>
                                            <Input
                                                id="email-1"
                                                v-model="email"
                                                name="email"
                                                type="email"
                                            />
                                            <span class="text-red-500" v-if="errors.email">{{ errors.email }}</span>
                                        </div>
                                        <div class="grid gap-3">
                                            <Label for="password-1"
                                                >Password</Label
                                            >
                                            <Input
                                                id="password-1"
                                                v-model="password"
                                                name="password"
                                                type="password"
                                            />
                                            <span class="text-red-500" v-if="errors.password">{{ errors.password }}</span>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Login</Button>
                                        <DialogClose as-child>
                                            <RouterLink to="/register"><Button variant="outline">Register</Button></RouterLink>
                                        </DialogClose>
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
                    <NavigationMenuTrigger>
                        <Button variant="ghost">{{ item.name }}</Button>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul
                            class="w-50"
                            v-for="subitem in item.subnames"
                            :key="subitem.index"
                        >
                            <NavigationMenuLink>
                                {{ subitem.name }}
                            </NavigationMenuLink>
                        </ul>
                    </NavigationMenuContent>
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
