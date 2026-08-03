export function initializeSidebar(data) {
    const menuButton = document.getElementById("menu-button");
    const sidebarClose = document.getElementById("sidebar-close");
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    const ticketCountEl = document.getElementById("sidebar-ticket-count");
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
    ticketCountEl.textContent = String(data.length);
}
//# sourceMappingURL=sidebar.js.map