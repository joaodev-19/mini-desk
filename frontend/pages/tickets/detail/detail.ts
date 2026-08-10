import {
    getTicket,
} from "../../../api/tickets/api.js";

import type {
    TicketDetail,
} from "../../../api/tickets/types.js";

import {
    getCurrentUser,
} from "../../../api/users/api.js";

import type {
    CurrentUser,
} from "../../../api/users/types.js";

import {
    renderMetaCard,
    renderSummaryCard,
} from "./renderTicketDetails.js";

import {
    renderTicketContentActions,
    renderWorkflowDropdownItems,
} from "./renderTicketActions.js";

import {
    renderConversation,
} from "./renderTicketChat.js";

import {
    fillForm,
    handleUpdateTicketSubmit,
} from "../../../shared/utils/form.js";

import {
    closeModal,
} from "../../../shared/utils/utils.js";

import {
    showToast,
} from "../../../shared/utils/toast.js";


document.addEventListener("DOMContentLoaded", async () => {
    const elements = (() => {
        const detailPage =
            document.getElementById(
                "ticket-detail-page",
            );

        const summaryCard =
            document.getElementById(
                "ticket-summary-card",
            );

        const metaCard =
            document.getElementById(
                "ticket-meta-card",
            );

        const ticketActionsContainer =
            document.getElementById(
                "ticket-detail-actions",
            );

        const workflowItemsContainer =
            document.getElementById(
                "ticket-workflow-items",
            );

        const chatContainer =
            document.getElementById(
                "conversation-timeline",
            );

        const updateModal =
            document.getElementById(
                "edit-ticket-modal",
            );

        const updateForm =
            document.querySelector<HTMLFormElement>(
                "#edit-ticket-form",
            );

        if (
            !detailPage ||
            !summaryCard ||
            !metaCard ||
            !ticketActionsContainer ||
            !chatContainer
        ) {
            throw new Error(
                "Não foi possível inicializar a página de detalhamento.",
            );
        }

        return {
            detailPage,
            summaryCard,
            metaCard,
            ticketActionsContainer,
            workflowItemsContainer,
            chatContainer,
            updateModal,
            updateForm,
        };
    })();


    const state: {
        ticket: TicketDetail | null;
        user: CurrentUser | null;
    } = {
        ticket: null,
        user: null,
    };

    function renderPage(): void {
        if (
            !state.ticket ||
            !state.user
        ) {
            return;
        }

        renderSummaryCard(
            elements.summaryCard,
            state.ticket,
        );

        renderMetaCard(
            elements.metaCard,
            state.ticket,
        );

        renderTicketContentActions(
            elements.ticketActionsContainer,
            state.ticket,
            state.user,
        );

        if (
            state.user.role === "support" &&
            elements.workflowItemsContainer
        ) {
            renderWorkflowDropdownItems(
                elements.workflowItemsContainer,
                state.ticket.status,
            );
        }

        renderConversation(
            elements.chatContainer,
            state.ticket.comments,
            state.user,
        );
    }


    async function init(): Promise<void> {
        const ticketId =
            Number(
                elements.detailPage.dataset.ticketId,
            );

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0
        ) {
            throw new Error(
                "O ID do chamado é inválido.",
            );
        }

        const [
            ticketResponse,
            userResponse,
        ] = await Promise.all([
            getTicket(ticketId),
            getCurrentUser(),
        ]);

        state.ticket =
            ticketResponse.data;

        state.user =
            userResponse.data;

        renderPage();
    }

    await init();

    elements.ticketActionsContainer.addEventListener(
        "click",
        (event) => {
            const target =
                event.target;

            if (
                !(target instanceof HTMLElement)
            ) {
                return;
            }

            const actionButton =
                target.closest<HTMLButtonElement>(
                    "[data-action]",
                );

            if (!actionButton) {
                return;
            }

            if (
                actionButton.dataset.action !==
                "edit-ticket"
            ) {
                return;
            }

            if (
                !state.ticket ||
                !elements.updateForm
            ) {
                return;
            }

            fillForm(
                state.ticket,
                elements.updateForm,
            );
        },
    );

    if (
        elements.updateForm &&
        elements.updateModal
    ) {
        elements.updateForm.addEventListener(
            "submit",
            async (event) => {
                event.preventDefault();

                if (!state.ticket) {
                    return;
                }

                const submitResponse =
                    await handleUpdateTicketSubmit(
                        state.ticket.id,
                        elements.updateForm!,
                    );

                if (
                    submitResponse.status ===
                    "error"
                ) {
                    showToast(
                        "Erro ao atualizar",
                        submitResponse.message,
                        "danger",
                    );

                    return;
                }

                state.ticket =
                    submitResponse.ticket;

                renderPage();

                closeModal(
                    elements.updateModal!,
                );

                showToast(
                    "Chamado atualizado",
                    submitResponse.message,
                    "success",
                );
            },
        );
    }
});