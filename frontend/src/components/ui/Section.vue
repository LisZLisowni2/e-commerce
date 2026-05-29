<script setup lang="ts">
    defineProps<{
        customClass?: string
    }>();
</script>

<template>
    <section :class="['w-full', 'p-5', 'px-10', customClass]">
        <slot>

        </slot>
    </section>
</template>