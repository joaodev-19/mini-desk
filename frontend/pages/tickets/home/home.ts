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
} from "./renderListTickets.js";

import {
    renderDashboard,
} from "../renderDashboard.js";

import type { CurrentUser } from "../../../api/users/types.js";

import {
    getCurrentUser,
} from "../../../api/users/api.js";

document.addEventListener('DOMContentLoaded', async () => {
    const elements = {
        welcomeName: document.getElementById('welcome-user-name') as HTMLElement,
        addModal: document.getElementById('new-ticket-modal') as HTMLElement,
        addForm: document.getElementById('new-ticket-form') as HTMLFormElement,
        ticketBody: document.getElementById("recent-tickets-body") as HTMLElement,

        statisticContainer: document.getElementById('statistic-container') as HTMLElement,
    }
    
    const state: {
        tickets: TicketListItem[];
        user: CurrentUser | null;
    } = {
        tickets: [],
        user: null,
    };
    
    function closeModal(modal: HTMLElement): void {
        const modalInstance =
            window.bootstrap.Modal.getOrCreateInstance(modal);
    
        modalInstance.hide();
    }

    async function init(): Promise<void> {
        const ticketResponse = await listTickets();
        const userResponse = await getCurrentUser();
        
        state.tickets = ticketResponse.data;
        state.user = userResponse.data;
    
        renderDashboard(elements.statisticContainer, state.tickets);
        renderTicketsList(elements.ticketBody, state.tickets);
    }
    
    elements.addForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const submitResponse = await handleCreateTicketSubmit(elements.addForm);
    
        if (submitResponse.status === 'success') {
            elements.addForm.reset();
            closeModal(elements.addModal);

            await Promise.all([
                init(),
                refreshSidebarTicketCount(),
            ]);
        }
    
    });

    await init();
})
