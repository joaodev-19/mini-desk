import { renderTicketsList, } from "./renderMyListTickets.js";
export function updateResultCount(element, amount) {
    element.textContent =
        amount === 1
            ? "1 chamado"
            : `${amount} chamados`;
}
export function renderTicketListView(elements, tickets) {
    renderTicketsList(elements.tableBody, tickets);
    updateResultCount(elements.resultCount, tickets.length);
}
//# sourceMappingURL=renderTicketListView.js.map