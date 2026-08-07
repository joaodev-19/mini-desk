import {
    getTicket,
} from "../../../api/tickets/api.js";
import type { TicketDetail } from "../../../api/tickets/types.js";
import { getCurrentUser } from "../../../api/users/api.js";
import type { CurrentUser } from "../../../api/users/types.js";
import { renderMetaCard, renderSummaryCard, renderTicketActions } from "./renderTicketDetails.js";

document.addEventListener('DOMContentLoaded', async () => {
    const elements = (() => {
        const detailPage = document.getElementById('ticket-detail-page');
        const summaryCard = document.getElementById('ticket-summary-card');
        const metaCard = document.getElementById('ticket-meta-card');
        const ticketActionsContainer = document.getElementById('ticket-detail-actions');

        if (
            !detailPage ||
            !summaryCard ||
            !metaCard ||
            !ticketActionsContainer
        ) {
            throw new Error("Não foi possível inicializar a página de detalhamento: elementos obrigatórios não encontrados.");
        };

        return {
            detailPage, summaryCard, metaCard, ticketActionsContainer
        };
    })();

    const state: {
        ticket: TicketDetail | null;
        user: CurrentUser | null;
    } = {
        ticket: null,
        user: null,
    }

    async function init(): Promise<void> {
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
        renderTicketActions(elements.ticketActionsContainer, state.ticket);
    }
    
    await init();
});
