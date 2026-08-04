import { listTickets } from "../../api/tickets/api.js";
export function initializeSidebar() {
    const menuButton = document.getElementById("menu-button");
    const sidebarClose = document.getElementById("sidebar-close");
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    if (!menuButton || !sidebarClose || !sidebarOverlay) {
        return;
    }
    function openSidebar() {
        document.body.classList.add("sidebar-open");
    }
    function closeSidebar() {
        document.body.classList.remove("sidebar-open");
    }
    menuButton.addEventListener("click", openSidebar);
    sidebarClose.addEventListener("click", closeSidebar);
    sidebarOverlay.addEventListener("click", closeSidebar);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });
}
export async function refreshSidebarTicketCount() {
    const ticketCountEl = document.getElementById("sidebar-ticket-count");
    if (!ticketCountEl) {
        return;
    }
    const response = await listTickets();
    ticketCountEl.textContent = String(response.data.length);
}
//# sourceMappingURL=sidebar.js.map