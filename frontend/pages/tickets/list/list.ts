import { 
    myListTickets,
 } from "../../../api/tickets/api.js";

import type { TicketListItem } from "../../../api/tickets/types.js";

import {
    getCurrentUser,
} from "../../../api/users/api.js";

import type { CurrentUser } from "../../../api/users/types.js";

import {
    renderTicketsList,
    initializeTicketRowNavigation,
} from "./renderMyListTickets.js";

import {
    initializeTicketToolbar,
} from "./ticketToolbar.js";

import {
    renderTicketListView,
} from "./renderTicketListView.js";


document.addEventListener('DOMContentLoaded', async () => {
    const elements = (() => {
        const ticketResultCount = document.getElementById('tickets-result-count');
        const ticketListBody = document.getElementById('tickets-list-body');
        const ticketsToolbar = document.getElementById('tickets-toolbar');
        

        if (
            !ticketResultCount || 
            !ticketListBody ||
            !ticketsToolbar
        ) {
            throw new Error(
                "Não foi possível inicializar a página de listagem: elementos obrigatórios não encontrados."
            );
        }

        return { ticketResultCount, ticketListBody, ticketsToolbar };
    })();

    const state: {
        tickets: TicketListItem[];
        visibleTickets: TicketListItem[];
        user: CurrentUser | null;
    } = {
        tickets: [],
        visibleTickets: [],
        user: null,
    }

    function renderTicketsLength(countEl: HTMLElement): void {
        countEl.textContent = String(state.tickets.length);
    }

    const toolbarController =
        initializeTicketToolbar({
            toolbar: elements.ticketsToolbar,

            getTickets: () => state.tickets,

            onFilteredTickets: (
                visibleTickets,
            ) => {
                state.visibleTickets =
                    visibleTickets;

                renderTicketListView(
                    {
                        tableBody:
                            elements.ticketListBody,

                        resultCount:
                            elements.ticketResultCount,
                    },

                    state.visibleTickets,
                );
            },
        });

    async function init(): Promise<void> {
        const myTicketsResponse = await myListTickets();
        const userResponse = await getCurrentUser();

        state.tickets = myTicketsResponse.data;
        state.user = userResponse.data;

        renderTicketsList(elements.ticketListBody, state.tickets);
        initializeTicketRowNavigation(elements.ticketListBody);
        renderTicketsLength(elements.ticketResultCount);

        toolbarController.refresh();
    }

    await init();
});