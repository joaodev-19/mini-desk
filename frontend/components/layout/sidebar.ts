export function initializeSidebar(): void {
    const menuButton = document.getElementById("menu-button") as HTMLElement;
    const sidebarClose = document.getElementById("sidebar-close") as HTMLElement;
    const sidebarOverlay = document.getElementById("sidebar-overlay") as HTMLElement;

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