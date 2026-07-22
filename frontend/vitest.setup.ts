import { config } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { createRouter, createMemoryHistory } from "vue-router";
import axios from "axios";
import { vi, beforeEach, afterEach } from "vitest";
import router from "./src/router/router";

const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
        get length() { return Object.keys(store).length; },
        key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

vi.mock("axios", () => {
    const mockInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() },
        },
    };

    return {
        default: {
            create: vi.fn(() => mockInstance),
            ...mockInstance,
        },
    };
});

const testRouter = createRouter({
    history: createMemoryHistory(),
    routes: router.getRoutes(),
});

config.global.plugins = [
    testRouter,
    createTestingPinia({
        createSpy: vi.fn,
        stubActions: true,
    }),
];

beforeEach(async () => {
    await router.push("/");
    await router.isReady();
});

afterEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
});
