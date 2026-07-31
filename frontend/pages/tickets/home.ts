import { initializeSidebar } from "../../components/layout/sidebar.js";

import {
    handleCreateTicketSubmit,
} from "../../shared/utils/form.js";

import {
    getTicket,
    listTickets,
} from "../../api/tickets/api.js";

import type {
    TicketListItem,
} from "../../api/tickets/types.js";

import {
    renderTicketsList
} from "./renderListTickets.js";

document.addEventListener('DOMContentLoaded', async () => {
    initializeSidebar();
    
    const elements = {
        addModal: document.getElementById('new-ticket-modal') as HTMLElement,
        addForm: document.getElementById('new-ticket-form') as HTMLFormElement,
        ticketBody: document.getElementById("recent-tickets-body") as HTMLElement,
    }
    
    const state: {
        tickets: TicketListItem[];
    } = {
        tickets: [],
    };
    
    function closeModal(modal: HTMLElement): void {
        const modalInstance =
            window.bootstrap.Modal.getOrCreateInstance(modal);
    
        modalInstance.hide();
    }
    
    async function init(): Promise<void> {
        const response = await listTickets();
        
        state.tickets = response.data;
    
        renderTicketsList(elements.ticketBody, state.tickets);
    }
    
    elements.addForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const submitResponse = await handleCreateTicketSubmit(elements.addForm);
    
        if (submitResponse.status === 'success') {
            elements.addForm.reset();
            closeModal(elements.addModal);

            await init();
        }
    
    });

    await init();
})
