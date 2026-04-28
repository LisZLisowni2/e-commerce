<script setup lang="ts">
    import {
        DropdownMenu,
        DropdownMenuTrigger,
        DropdownMenuContent
    } from "@/components/ui/dropdown-menu"
    import Button from "../ui/button/Button.vue";
</script>

<template>
    <DropdownMenu>
    <DropdownMenuTrigger as-child>
        <Button variant="ghost" class="*:scale-150">
            <slot name="icon">

            </slot>
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48">
        <slot name="content">
            
        </slot>
    </DropdownMenuContent>
    </DropdownMenu>
</template>