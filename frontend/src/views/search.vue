<script setup lang="ts">
    import { useRoute } from 'vue-router';
    import router from '@/router/router';
    import { useProducts } from '@/composables/useProducts';
    import { computed } from 'vue';
    import ItemCard from '@/components/ui/ItemCard.vue';

    const route = useRoute();

    if (!route.params.query && !route.params.category) {
        router.push("/")
    }

    const searchQuery = computed(() => route.params.query as string | undefined);
    const category = computed(() => route.params.category as string | undefined);

    const { data: productsList } = route.params.query
        ? useProducts({ searchQuery, page: 1 })
        : useProducts({ category, page: 1 })
</script>

<template>
    <aside>
        
    </aside>
    <section class="m-4 p-4 *:m-2">
        <ul>
            <ItemCard v-for="product in productsList?.data" 
                :title="product.name"
                :price="product.price"
                :lowest-price30-days="product.last30DaysPrice"
                :image-url="product.imageURL"
            />
        </ul>
    </section>
</template>