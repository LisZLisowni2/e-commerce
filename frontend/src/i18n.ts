import { createI18n } from "vue-i18n"

const messages = {
    en: {
        theme: "Toggle theme",
        nav: {
            peripherials: {
                name: "Peripherials",
                mouse: "Mouse",
                keyboard: "Keyboard",
                headset: "Headset"
            },
            server: {
                name: "Server",
                business: "Business"
            },
            desktop: {
                workstation: "Workstation"
            }
        },
        latest: "Latest products"
    },
    pl: {
        theme: "Zmień motyw",
        nav: {
            peripherials: {
                name: "Peryferia",
                mouse: "Myszka",
                keyboard: "Klawiatura",
                headset: "Słuchawki"
            },
            server: {
                name: "Serwer",
                business: "Biznes"
            },
            desktop: {
                workstation: "Stacja robocza"
            }
        },
        latest: "Najnowsze produkty"
    }
}

export const i18n = createI18n({
    messages,
    locale: 'en',
    fallbackLocale: 'en'
})