export {};

declare global {
    interface Window {
        bootstrap: typeof import("bootstrap");
    }
}