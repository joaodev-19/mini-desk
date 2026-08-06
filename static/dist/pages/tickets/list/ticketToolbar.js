import { applyTicketFilters, } from "./ticketFilters.js";
function getRequiredControl(toolbar, selector) {
    const control = toolbar.querySelector(selector);
    if (!control) {
        throw new Error(`Controle obrigatório não encontrado: ${selector}`);
    }
    return control;
}
function getToolbarControls(toolbar) {
    return {
        search: getRequiredControl(toolbar, '[name="search"]'),
        status: getRequiredControl(toolbar, '[name="status"]'),
        module: getRequiredControl(toolbar, '[name="module"]'),
        order: getRequiredControl(toolbar, '[name="order"]'),
    };
}
function getFilterValues(controls) {
    return {
        search: controls.search.value,
        status: controls.status.value,
        module: controls.module.value,
        order: controls.order.value,
    };
}
function isTicketFilterControl(target) {
    if (!(target instanceof HTMLInputElement) &&
        !(target instanceof HTMLSelectElement)) {
        return false;
    }
    return [
        "search",
        "status",
        "module",
        "order",
    ].includes(target.name);
}
export function initializeTicketToolbar(options) {
    const { toolbar, getTickets, onFilteredTickets, } = options;
    const controls = getToolbarControls(toolbar);
    function refresh() {
        const filters = getFilterValues(controls);
        const visibleTickets = applyTicketFilters(getTickets(), filters);
        onFilteredTickets(visibleTickets);
    }
    function handleToolbarInteraction(event) {
        const target = event.target;
        if (!isTicketFilterControl(target)) {
            return;
        }
        if (target instanceof HTMLInputElement &&
            event.type !== "input") {
            return;
        }
        if (target instanceof HTMLSelectElement &&
            event.type !== "change") {
            return;
        }
        refresh();
    }
    toolbar.addEventListener("input", handleToolbarInteraction);
    toolbar.addEventListener("change", handleToolbarInteraction);
    return {
        refresh,
        destroy() {
            toolbar.removeEventListener("input", handleToolbarInteraction);
            toolbar.removeEventListener("change", handleToolbarInteraction);
        },
    };
}
//# sourceMappingURL=ticketToolbar.js.map