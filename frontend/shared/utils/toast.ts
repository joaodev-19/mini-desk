import type { ToastStatus } from "../types/generic";

export function showToast(
    title: string,
    message: string,
    type: ToastStatus = "success",
): void {
    const toastEl =
        document.getElementById("toast-alert");

    const titleEl =
        document.getElementById("toast-title");

    const messageEl =
        document.getElementById("toast-message");

    if (
        !(toastEl instanceof HTMLElement) ||
        !(titleEl instanceof HTMLElement) ||
        !(messageEl instanceof HTMLElement)
    ) {
        throw new Error(
            "Toast failed to load.",
        );
    }

    toastEl.classList.remove(
        "toast-success",
        "toast-danger",
    );

    toastEl.classList.add(
        `toast-${type}`,
    );

    titleEl.textContent = title;
    messageEl.textContent = message;

    const toastBootstrap =
        window.bootstrap.Toast.getOrCreateInstance(
            toastEl,
            {
                autohide: false,
            },
        );

    toastBootstrap.show();
}