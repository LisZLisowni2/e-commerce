<script setup lang="ts">
  import { RouterView } from "vue-router"
  import { useThemeStore } from "./stores/useThemeStore";
  import Button from "./components/ui/button/Button.vue";
  import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

  const themeStore = useThemeStore();

  const navElements = [
    {
      index: 0,
      name: 'Laptop',
      link: '/laptop',
      subnames: [
        {
          index: 1,
          name: 'Mac',
          link: '/laptop/mac',
        },
        {
          index: 2,
          name: 'Gaming',
          link: '/laptop/gaming',
        },
        {
          index: 3,
          name: 'Ultrabook',
          link: '/laptop/ultrabook' 
        },
      ]
    },
    {
      index: 4,
      name: 'Desktop',
      link: '/desktop',
      subnames: [
        {
          index: 5,
          name: 'Gaming',
          link: '/desktop/gaming',
        },
        {
          index: 6,
          name: 'Ready for AI',
          link: '/desktop/ai',
        },
        {
          index: 7,
          name: 'Workstation',
          link: '/desktop/workstation' 
        },
      ]
    },
    {
      index: 8,
      name: 'Peripheral',
      link: '/peripheral',
      subnames: [
        {
          index: 9,
          name: 'Mouse',
          link: '/peripheral/mouse',
        },
        {
          index: 10,
          name: 'Keyboard',
          link: '/peripheral/keyboard',
        },
        {
          index: 11,
          name: 'Headset',
          link: '/peripheral/headset' 
        },
      ]
    },
    {
      index: 12,
      name: 'Server',
      link: '/server',
      subnames: [
        {
          index: 13,
          name: 'Home lab',
          link: '/server/home',
        },
        {
          index: 14,
          name: 'Business',
          link: '/server/businnes',
        },
      ]
    }
  ]
</script>

<template>
  <header class="p-4 flex flex-row *:mr-4 items-center">
    <h1 class="text-xl sm:text-3xl text-amber-500">E-commerance</h1>
    <Button @click="themeStore.mode === 'light' ? themeStore.mode = 'dark' : themeStore.mode = 'light'">
      Toggle Theme
    </Button>
  </header>
  <nav class="flex justify-center">
    <NavigationMenu>
      <NavigationMenuList class="max-w-dvw flex flex-col sm:flex-row justify-center items-center overflow-auto">
        <NavigationMenuItem v-for="item in navElements" :key="item.index">
          <NavigationMenuTrigger>
            <Button variant="ghost">{{ item.name }}</Button>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul class="w-50" v-for="subitem in item.subnames" :key="subitem.index">
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
</template>
