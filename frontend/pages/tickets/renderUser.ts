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

export function renderUser(data: CurrentUser): void {
    const userInitialsEl = document.getElementById('current-user-initials') as HTMLElement;
    const userFirstNameEl = document.getElementById('current-user-name') as HTMLElement;
    const userRoleEl = document.getElementById('current-user-role') as HTMLElement;
    const welcomeUserName = document.getElementById('welcome-user-name') as HTMLElement;

    userInitialsEl.textContent = getInitials(data.full_name);
    userFirstNameEl.textContent = data.first_name;
    userRoleEl.textContent = data.role_display;
    welcomeUserName.textContent = data.first_name;
}