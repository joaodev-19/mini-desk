function getInitials(name) {
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
    const lastInitial = names.length > 1
        ? lastName.charAt(0)
        : "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
}
export function renderUser(data) {
    const userInitialsEl = document.getElementById('current-user-initials');
    const userFirstNameEl = document.getElementById('current-user-name');
    const userRoleEl = document.getElementById('current-user-role');
    const welcomeUserName = document.getElementById('welcome-user-name');
    userInitialsEl.textContent = getInitials(data.full_name);
    userFirstNameEl.textContent = data.first_name;
    userRoleEl.textContent = data.role_display;
    welcomeUserName.textContent = data.first_name;
}
//# sourceMappingURL=renderUser.js.map