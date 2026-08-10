import { getCurrentUser, logoutUser } from "../../api/users/api.js";
import { getInitials } from "../../shared/utils/utils.js";
export async function renderUser() {
    const data = await getCurrentUser();
    const user = data.data;
    const userInitialsEl = document.getElementById('current-user-initials');
    const userFirstNameEl = document.getElementById('current-user-name');
    const userRoleEl = document.getElementById('current-user-role');
    userInitialsEl.textContent = getInitials(user.full_name);
    userFirstNameEl.textContent = user.first_name;
    userRoleEl.textContent = user.role_display;
}
export async function initializeTopbar() {
    const logoutButton = document.getElementById('logout-button');
    logoutButton?.addEventListener('click', async () => {
        await logoutUser();
        window.location.href = "/users/login/";
    });
    await renderUser();
}
//# sourceMappingURL=topbar.js.map