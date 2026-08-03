import { logoutUser } from "../../api/users/api.js";
export function initializeTopbar() {
    const logoutButton = document.getElementById('logout-button');
    logoutButton?.addEventListener('click', async () => {
        await logoutUser();
        window.location.href = "/users/login/";
    });
}
//# sourceMappingURL=topbar.js.map