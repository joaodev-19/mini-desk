import { initializeSidebar, refreshSidebarTicketCount } from "./components/layout/sidebar.js";
import { initializeTopbar } from "./components/layout/topbar.js";

async function initApp(): Promise<void> {
    initializeSidebar();
    initializeTopbar();

    await refreshSidebarTicketCount();
}

void initApp();