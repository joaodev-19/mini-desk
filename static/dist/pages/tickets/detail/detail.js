import { getTicket, } from "../../../api/tickets/api.js";
import { getCurrentUser } from "../../../api/users/api.js";
import { renderMetaCard, renderSummaryCard } from "./renderTicketDetails.js";
import { renderWorkflowDropdownItems } from "./renderTicketActions.js";
import { renderConversation } from "./renderTicketChat.js";
import { fillForm, handleUpdateTicketSubmit } from "../../../shared/utils/form.js";
import { closeModal } from "../../../shared/utils/utils.js";
import { showToast } from "../../../shared/utils/toast.js";
document.addEventListener('DOMContentLoaded', async () => {
    const elements = (() => {
        const detailPage = document.getElementById('ticket-detail-page');
        const summaryCard = document.getElementById('ticket-summary-card');
        const metaCard = document.getElementById('ticket-meta-card');
        const ticketActionsContainer = document.getElementById('ticket-detail-actions');
        const workflowItemsContainer = document.getElementById('ticket-workflow-items');
        const chatContainer = document.getElementById('conversation-timeline');
        const editButton = document.getElementById('edit-ticket-button');
        const updateModal = document.getElementById('edit-ticket-modal');
        const updateForm = document.querySelector('#edit-ticket-form');
        const testebtn = document.getElementById('teste');
        if (!detailPage ||
            !summaryCard ||
            !metaCard ||
            !ticketActionsContainer ||
            !chatContainer ||
            !updateModal ||
            !updateForm ||
            !editButton ||
            !testebtn) {
            throw new Error("Não foi possível inicializar a página de detalhamento: elementos obrigatórios não encontrados.");
        }
        ;
        return {
            detailPage,
            summaryCard,
            metaCard,
            ticketActionsContainer,
            workflowItemsContainer,
            chatContainer,
            updateModal,
            updateForm,
            editButton,
            testebtn
        };
    })();
    const state = {
        ticket: null,
        user: null,
    };
    async function init() {
        const ticketId = Number(elements.detailPage.dataset.ticketId);
        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            throw new Error("O ID do chamado é inválido.");
        }
        const [ticketResponse, userResponse] = await Promise.all([
            getTicket(ticketId),
            getCurrentUser(),
        ]);
        state.ticket = ticketResponse.data;
        state.user = userResponse.data;
        renderSummaryCard(elements.summaryCard, state.ticket);
        renderMetaCard(elements.metaCard, state.ticket);
        if (state.user.role === 'support' &&
            elements.workflowItemsContainer) {
            renderWorkflowDropdownItems(elements.workflowItemsContainer, state.ticket.status);
        }
        renderConversation(elements.chatContainer, state.ticket.comments, state.user);
    }
    await init();
    elements.editButton.addEventListener("click", () => {
        if (!state.ticket) {
            return;
        }
        fillForm(state.ticket, elements.updateForm);
    });
    elements.updateModal.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (state.ticket) {
            const submitResponse = await handleUpdateTicketSubmit(state.ticket.id, elements.updateForm);
            if (submitResponse.status === "success") {
                elements.updateForm.reset();
                closeModal(elements.updateModal);
                init();
            }
        }
    });
    elements.testebtn.addEventListener('click', () => {
        showToast('teste', 'teste');
    });
});
//# sourceMappingURL=detail.js.map