import {
    handleCreateTicketSubmit,
} from "../../../shared/utils/form.js";

import {
    refreshSidebarTicketCount,
} from "../../../components/layout/sidebar.js";

import {
    getTicket,
    listTickets,
} from "../../../api/tickets/api.js";

import type {
    TicketListItem,
} from "../../../api/tickets/types.js";

import {
    renderTicketsList,
    initializeTicketRowNavigation,
} from "./renderListTickets.js";

import {
    renderDashboard,
} from "./renderDashboard.js";

import type { CurrentUser } from "../../../api/users/types.js";

import {
    getCurrentUser,
} from "../../../api/users/api.js";

document.addEventListener('DOMContentLoaded', async () => {
    const elements = (() => {
        const welcomeName = document.getElementById('welcome-user-name');
        const addModal = document.getElementById('new-ticket-modal');
        const addForm = document.querySelector<HTMLFormElement>("#new-ticket-form");
        const ticketBody = document.getElementById("recent-tickets-body");
        const statisticContainer = document.getElementById('statistic-container');

        if (
            !welcomeName ||
            !addModal ||
            !addForm ||
            !ticketBody ||
            !statisticContainer
        ) {
            throw new Error(
                "Não foi possível inicializar a home: elementos obrigatórios não encontrados.",
            );
        }

        return { welcomeName, addModal, addForm, ticketBody, statisticContainer };
    })();

    const state: {
        tickets: TicketListItem[];
        user: CurrentUser | null;
    } = {
        tickets: [],
        user: null,
    };

    function closeModal(modal: HTMLElement): void {
        window.bootstrap.Modal.getOrCreateInstance(modal).hide();
    }

    function renderWelcomeName(
        element: HTMLElement,
        user: CurrentUser | null,
    ): void {
        element.textContent = user?.first_name?.trim() || "usuário";
    }

    async function init(): Promise<void> {
        const [ticketResponse, userResponse] = await Promise.all([
            listTickets(),
            getCurrentUser(),
        ]);

        state.tickets = ticketResponse.data;
        state.user = userResponse.data;

        renderDashboard(elements.statisticContainer, state.tickets);
        renderTicketsList(elements.ticketBody, state.tickets);
        initializeTicketRowNavigation(elements.ticketBody);
        renderWelcomeName(elements.welcomeName, state.user);
    }

    elements.addForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitResponse = await handleCreateTicketSubmit(elements.addForm);

        if (
            submitResponse.status === "success" ||
            submitResponse.status === "warning"
        ) {
            elements.addForm.reset();
            closeModal(elements.addModal);

            await Promise.all([
                init(),
                refreshSidebarTicketCount(),
            ]);
        }
    });

    await init();
});