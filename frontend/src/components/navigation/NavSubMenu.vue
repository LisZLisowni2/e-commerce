<script setup lang="ts">
import { type NavItem } from "@/types/NavItem";
import { NavigationMenuLink } from "../ui/navigation-menu";

defineProps<{
    items: NavItem[];
}>();
</script>

<template>
    <ul class="flex flex-col gap-1 pl-3 border-l border-muted my-1">
        <li v-for="subitem in items" :key="subitem.index" class="py-1">
            <!-- Case 1: Item HAS sub-items (Recursive Step) -->
            <div v-if="subitem.subnames && subitem.subnames.length > 0">
                <span
                    class="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2"
                >
                    {{ subitem.name }}
                </span>
                <!-- Recursive call -->
                <NavSubMenu :items="subitem.subnames" />
            </div>

            <!-- Case 2: Leaf Node Link -->
            <NavigationMenuLink v-else as-child>
                <a
                    :href="subitem.link || '#'"
                    class="block select-none rounded-md p-2 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                    {{ subitem.name }}
                </a>
            </NavigationMenuLink>
        </li>
    </ul>
</template>
