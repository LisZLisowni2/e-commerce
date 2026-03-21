<script setup lang="ts">
import img1 from "@/assets/testAd1.jpg";
import testProduct from "@/assets/testProduct.webp";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, A11y } from "swiper/modules";
import Slide from "@/components/swiper/Slide.vue";
import ItemCard from "@/components/ui/ItemCard.vue";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Section from "@/components/ui/Section.vue";

const modules = [Navigation, Pagination, A11y];
</script>

<template>
    <Section>
        <swiper
            :slides-per-view="1"
            :space-between="50"
            navigation
            :modules="modules"
            :pagination="{ clickable: true }"
            :scrollbar="{ draggable: true }"
            :autoplay="{ delay: 5000 }"
        >
            <swiper-slide>
                <slide>
                    <img :src="img1" alt="ad1" />
                </slide>
            </swiper-slide>
            <swiper-slide>
                <slide>
                    <img :src="img1" alt="ad1" />
                </slide>
            </swiper-slide>
            <swiper-slide>
                <slide>
                    <img :src="img1" alt="ad1" />
                </slide>
            </swiper-slide>
        </swiper>
    </Section>
    <Section>
        <h1 class="text-3xl font-bold">Bargains of the day</h1>
        <swiper
            :slides-per-view="6"
            :space-between="50"
            navigation
            :modules="modules"
            :pagination="{ clickable: true }"
            :scrollbar="{ draggable: true }"
            :autoplay="{ delay: 5000 }"
            class="m-8"
        >
            <swiper-slide>
                <ItemCard
                    title="Test"
                    :image-url="testProduct"
                    :price="12.44"
                />
            </swiper-slide>
            <swiper-slide>
                <ItemCard
                    title="Test"
                    :image-url="testProduct"
                    :price="12.44"
                />
            </swiper-slide>
            <swiper-slide>
                <ItemCard
                    title="Test"
                    :image-url="testProduct"
                    :price="12.44"
                />
            </swiper-slide>
            <swiper-slide>
                <ItemCard
                    title="Test"
                    :image-url="testProduct"
                    :price="12.44"
                />
            </swiper-slide>
            <swiper-slide>
                <ItemCard
                    title="Test"
                    :image-url="testProduct"
                    :price="12.44"
                />
            </swiper-slide>
            <swiper-slide>
                <ItemCard
                    title="Test"
                    :image-url="testProduct"
                    :price="12.44"
                />
            </swiper-slide>
            <swiper-slide>
                <ItemCard
                    title="Test"
                    :image-url="testProduct"
                    :price="12.44"
                />
            </swiper-slide>
            <swiper-slide>
                <ItemCard
                    title="Test"
                    :image-url="testProduct"
                    :price="12.44"
                />
            </swiper-slide>
            <swiper-slide>
                <ItemCard
                    title="Test"
                    :image-url="testProduct"
                    :price="12.44"
                />
            </swiper-slide>
            <swiper-slide>
                <ItemCard
                    title="Test"
                    :image-url="testProduct"
                    :price="12.44"
                />
            </swiper-slide>
            <swiper-slide>
                <ItemCard
                    title="Test"
                    :image-url="testProduct"
                    :price="12.44"
                />
            </swiper-slide>
        </swiper>
        <div class="m-5 overflow-auto whitespace-nowrap p-5"></div>
    </Section>
</template>
