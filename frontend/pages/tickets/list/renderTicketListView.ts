import type {
    TicketListItem,
} from "../../../api/tickets/types.js";

import {
    renderTicketsList,
} from "./renderMyListTickets.js";


export type TicketListViewElements = {
    tableBody: HTMLElement;
    resultCount: HTMLElement;
};


export function updateResultCount(
    element: HTMLElement,
    amount: number,
): void {
    element.textContent =
        amount === 1
            ? "1 chamado"
            : `${amount} chamados`;
}


export function renderTicketListView(
    elements: TicketListViewElements,
    tickets: TicketListItem[],
): void {
    renderTicketsList(
        elements.tableBody,
        tickets,
    );

    updateResultCount(
        elements.resultCount,
        tickets.length,
    );
}