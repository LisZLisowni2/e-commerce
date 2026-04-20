<script setup lang="ts">
  import { useI18n } from "vue-i18n";
  import { computed, ref, watch } from "vue";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent
} from "@/components/ui/dropdown-menu"
import IconDropdown from "./components/navigation/IconDropdown.vue";
import { ChevronsUpDown, Check, Search, CircleUserRound, Phone, ShoppingBasket } from "lucide-vue-next";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./components/ui/input-group";
import DropdownMenuItem from "./components/ui/dropdown-menu/DropdownMenuItem.vue";
  const { t, locale } = useI18n()

  const languages = [
    { code: "en", label: "English", "flag": "🇺🇸", region: "US" },
    { code: "pl", label: "Polish", "flag": "🇵🇱", region: "PL"}
  ]

  const selected = ref<string>('en')

  const currentLanguage = ref<{
    code: string,
    label: string,
    flag: string,
    region: string
  }>({ code: "en", label: "English", "flag": "🇺🇸", region: "EN" });

  watch(selected, (newCode) => {
    currentLanguage.value = languages.find(l => l.code === newCode)! 
    locale.value = newCode
  })

  const themeStore = useThemeStore();

  const navElements = computed(() => [
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
          name: t('nav.desktop.workstation'),
          link: '/desktop/workstation' 
        },
      ]
    },
    {
      index: 8,
      name: t('nav.peripherials.name'),
      link: '/peripheral',
      subnames: [
        {
          index: 9,
          name: t('nav.peripherials.mouse'),
          link: '/peripheral/mouse',
        },
        {
          index: 10,
          name: t('nav.peripherials.keyboard'),
          link: '/peripheral/keyboard',
        },
        {
          index: 11,
          name: t('nav.peripherials.headset'),
          link: '/peripheral/headset' 
        },
      ]
    },
    {
      index: 12,
      name: t('nav.server.name'),
      link: '/server',
      subnames: [
        {
          index: 13,
          name: 'Home lab',
          link: '/server/home',
        },
        {
          index: 14,
          name: t('nav.server.business'),
          link: '/server/businnes',
        },
      ]
    }
  ])
</script>

<template>
  <header class="flex max-md:flex-col items-center w-full gap-4 px-4 py-2">
    <div class="flex flex-row items-center gap-4 shrink-0">
      <h1 class="text-xl sm:text-3xl text-amber-500">E-commerance</h1>
      <Button @click="themeStore.mode === 'light' ? themeStore.mode = 'dark' : themeStore.mode = 'light'">
        {{ t('theme') }}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="secondary" className="w-48 justify-between flex items-center">
            <span>{{currentLanguage.flag}} {{currentLanguage.label}}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
            <DropdownMenuItem
              v-for="lang in languages"
              :key="lang.code"
              className="flex justify-between"
            >
              <Button variant="link" @click="selected = lang.code">
                <span>{{lang.flag}} {{lang.label}}</span>
                <Check v-if="selected === lang.code" className="h-4 w-4" />
              </Button>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div class="flex-1">
      <InputGroup>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
    </div>
    <div class="flex gap-4 shrink-0 max-md:m-auto ml-auto">
      <IconDropdown>
        <template #icon>
          <Phone />
        </template>
        <template #content>
          <DropdownMenuItem>
            <h1>Test</h1>
          </DropdownMenuItem>
        </template>
      </IconDropdown>
      <IconDropdown>
        <template #icon>
          <CircleUserRound />
        </template>
        <template #content>
          <DropdownMenuItem>
            <h1>Test</h1>
          </DropdownMenuItem>
        </template>
      </IconDropdown>
      <IconDropdown>
        <template #icon>
          <ShoppingBasket />
        </template>
        <template #content>
          <DropdownMenuItem>
            <h1>Test</h1>
          </DropdownMenuItem>
        </template>
      </IconDropdown>
    </div>
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
