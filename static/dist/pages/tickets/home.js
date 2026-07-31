import { initializeSidebar } from "../../components/layout/sidebar.js";
import { handleCreateTicketSubmit, } from "../../shared/utils/form.js";
import { getTicket, listTickets, } from "../../api/tickets/api.js";
import { renderTicketsList } from "./renderListTickets.js";
document.addEventListener('DOMContentLoaded', async () => {
    initializeSidebar();
    const elements = {
        addModal: document.getElementById('new-ticket-modal'),
        addForm: document.getElementById('new-ticket-form'),
        ticketBody: document.getElementById("recent-tickets-body"),
    };
    const state = {
        tickets: [],
    };
    function closeModal(modal) {
        const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modal);
        modalInstance.hide();
    }
    async function init() {
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
});
//# sourceMappingURL=home.js.map