<script setup lang="ts">
import { useRoute } from 'vue-router';
import router from "@/router/router"
import { useProduct } from '@/composables/useProducts';
import { useImageProductByComputed } from '@/composables/useImageProduct';
import { computed } from 'vue';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const route = useRoute()

const idParam = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;

if (!idParam) {
    router.push("/")
}

const { data, error, isError, isLoading } = useProduct(Number.parseInt(idParam))

const imagePath = computed(() => data.value?.imageURL)

const { data: imageValue, isLoading: isImageLoading } = useImageProductByComputed(imagePath)

</script>

<template>
    <div v-if="isLoading">
        <p>Loading product...</p>
    </div>
    <div v-else-if="isError">
        <p class="text-red-500">Error: {{ error }}</p>
    </div>
    <div class="p-8 px-16 flex flex-col md:flex-row gap-4" v-else>
        <section class="md:w-2/3">
            <p v-if="isImageLoading">Image loading...</p>
            <img v-else :src="imageValue" alt="Image product" width="500" />
            <hr />
            <h2 class="text-2xl">Description</h2>
            <p>{{ data?.description }}</p>
        </section>
        <aside class="md:w-1/3">
            <Card>
                <CardContent class="*:m-1">
                    <p class="font-extrabold">{{ data?.name }}</p>
                    <p class="font-bold">{{ data?.price }}$</p>
                    <p>Last price in 30 days: {{ data?.last30DaysPrice }}</p>
                    <p>Category ID: {{ data?.category_id }}</p>
                    <p>Vendor ID: {{ data?.vendor_id }}</p>
                    <Button>Add to cart</Button>
                </CardContent>
            </Card>
        </aside>
    </div>
</template>
