<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import router from '@/router/router';
import { useProducts } from '@/composables/useProducts';
import { computed, ref } from 'vue';
import ItemCard from '@/components/ui/ItemCard.vue';
import { Input } from '@/components/ui/input';

const route = useRoute();

if (!route.params.query && !route.params.category) {
    router.push("/")
}

const sortingMethod = ref<string>('NULL')

const searchQuery = computed(() => route.params.query as string | undefined);
const category = computed(() => route.params.category as string | undefined);

const { data: productsList } = route.params.query
    ? useProducts({ searchQuery, page: 1 })
    : useProducts({ category, page: 1 })
</script>

<template>
    <div class="flex flex-col md:flex-row">
        <aside class="md:w-1/4 m-4 p-4 bg-white dark:bg-zinc-950 shadow-md border rounded-md *:m-4">
            <div>
                <h3 class="text-xl">Sorting:</h3>
                <select class="m-3" v-model="sortingMethod">
                    <option value="NULL" selected>None</option>
                    <option value="date_asc">By date ascending</option>
                    <option value="date_desc">By date descending</option>
                    <option value="name_asc">By date ascending</option>
                    <option value="name_desc">By date descending</option>
                    <option value="price_asc">By price ascending</option>
                    <option value="price_desc">By price descending</option>
                </select>
            </div>
            <hr />
            <div>
                <h3 class="text-xl">Filtering:</h3>
                <div>
                    <p>Price:</p>
                    <div class="flex flex-row gap-4">
                        <Input type="text" placeholder="Minimum" />
                        <Input type="text" placeholder="Maximum" />
                    </div>
                </div>
            </div>
        </aside>
        <section class="md:w-3/4 m-4 p-4 *:m-2 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="hover:scale-105 transition-all" v-for="product in productsList?.data" :key="product.id">
                <RouterLink :to="`/product/${product.id}`">
                    <ItemCard :title="product.name" :price="product.price"
                        :lowest-price30-days="product.last30DaysPrice" :image-url="product.imageURL" />
                </RouterLink>
            </div>
        </section>
    </div>
</template>
