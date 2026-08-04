import { initializeSidebar, refreshSidebarTicketCount } from "./components/layout/sidebar.js";
import { initializeTopbar } from "./components/layout/topbar.js";
async function initApp() {
    initializeSidebar();
    initializeTopbar();
    await refreshSidebarTicketCount();
}
void initApp();
//# sourceMappingURL=app.js.map