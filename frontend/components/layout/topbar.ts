import { getCurrentUser, logoutUser } from "../../api/users/api.js";

import type { CurrentUser } from "../../api/users/types.js";

function getInitials(name: string): string {
    const names = name.trim().split(/\s+/);

    if (!names[0]) {
        throw new Error("O nome está vazio.");
    }

    const firstName = names[0];

    if (!firstName) {
        throw new Error("O nome está vazio.");
    }

    const firstInitial = firstName.charAt(0);

    const lastName = names[names.length - 1] ?? firstName;

    const lastInitial =
        names.length > 1
            ? lastName.charAt(0)
            : "";

    return `${firstInitial}${lastInitial}`.toUpperCase();
}

export async function renderUser(): Promise<void> {
    const data = await getCurrentUser();

    const user: CurrentUser = data.data;

    const userInitialsEl = document.getElementById('current-user-initials') as HTMLElement;
    const userFirstNameEl = document.getElementById('current-user-name') as HTMLElement;
    const userRoleEl = document.getElementById('current-user-role') as HTMLElement;


    userInitialsEl.textContent = getInitials(user.full_name);
    userFirstNameEl.textContent = user.first_name;
    userRoleEl.textContent = user.role_display;
}

export async function initializeTopbar(): Promise<void> {
    const logoutButton = document.getElementById('logout-button');

    logoutButton?.addEventListener('click', async () => {
        await logoutUser();

        window.location.href = "/users/login/";
    });

    await renderUser();
}