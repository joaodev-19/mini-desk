const menuButton = document.getElementById("menu-button");
const sidebarClose = document.getElementById("sidebar-close");
const sidebarOverlay = document.getElementById("sidebar-overlay");
function openSidebar() {
    document.body.classList.add("sidebar-open");
}
function closeSidebar() {
    document.body.classList.remove("sidebar-open");
}
menuButton?.addEventListener("click", openSidebar);
sidebarClose?.addEventListener("click", closeSidebar);
sidebarOverlay?.addEventListener("click", closeSidebar);
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeSidebar();
    }
});
export {};
//# sourceMappingURL=home.js.map