<script setup lang="ts">
    defineProps<{
        title: string,
        price: number,
        imageUrl: string,
    }>()
    
    import {
        Card,
        CardContent,
    } from '@/components/ui/card'
</script>

<template>
    <Card class="inline-block px-2 mx-2 w-full">
        <CardContent class="text-center">
            <img :src="imageUrl" :alt="`${title}-image`" width="180" class="p-2" />
            <h2 class="text-xl">{{ title }}</h2>
            <p class="text-2xl font-bold">${{ price }}</p>
        </CardContent>
    </Card>
</template>