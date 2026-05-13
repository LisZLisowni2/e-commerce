import { config } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { createRouter, createMemoryHistory } from "vue-router";
import axios from "axios";
import { vi, beforeEach, afterEach } from "vitest";
import router from "./src/router/router";

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
});
