<script setup lang="ts">
import {
    Sidebar,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Bell, Box, HomeIcon, Table, UserPen } from "@lucide/vue";
import SidebarFooter from "./sidebar/SidebarFooter.vue";
import SidebarContent from "./sidebar/SidebarContent.vue";

const items = [
    {
        title: "Summary",
        url: "/vendor/dashboard/",
        icon: Table,
    },
    {
        title: "Products",
        url: "/vendor/dashboard/products",
        icon: Box,
    },
    {
        title: "Notifications",
        url: "/vendor/dashboard/notifications",
        icon: Bell,
    },
];

const footerItems = [
    {
        title: "Home page",
        url: "/",
        icon: HomeIcon
    },
    {
        title: "Profile",
        url: "/profile",
        icon: UserPen
    }
]

</script>

<template>
    <Sidebar variant="sidebar" class="z-20">
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>Vendor dashboard</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem v-for="item in items" :key="item.title">
                            <SidebarMenuButton as-child>
                                <RouterLink :to="item.url">
                                    <component :is="item.icon" />
                                    <span>{{ item.title }}</span>
                                </RouterLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem v-for="item in footerItems" :key="item.title">
                    <SidebarMenuButton as-child>
                        <RouterLink :to="item.url">
                            <component :is="item.icon" />
                            <span>{{ item.title }}</span>
                        </RouterLink>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
</template>
