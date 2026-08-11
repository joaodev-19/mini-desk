import {
    getTicket,
} from "../../../api/tickets/api.js";

import type {
    ChatItem,
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
    renderAttachmentPreview,
    renderConversation,
} from "./renderTicketChat.js";

import {
    fillForm,
    handleReplySubmit,
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

        const ticketReplyForm = 
            document.querySelector<HTMLFormElement>(
                "#ticket-reply-form"
            );

        const fileInput =
            document.querySelector<HTMLInputElement>(
                "#reply-file",
            );

        const preview =
            document.getElementById(
                "reply-attachment-preview",
            );

        const previewImage =
            document.querySelector<HTMLImageElement>(
                "#reply-attachment-image",
            );

        const fileIcon =
            document.getElementById(
                "reply-attachment-file-icon",
            );

        const fileName =
            document.getElementById(
                "reply-attachment-name",
            );

        const fileSize =
            document.getElementById(
                "reply-attachment-size",
            );

        const removeButton =
            document.querySelector<HTMLButtonElement>(
                "#reply-attachment-remove",
            );

        if (
            !fileInput ||
            !preview ||
            !previewImage ||
            !fileIcon ||
            !fileName ||
            !fileSize ||
            !removeButton
        ) {
            throw new Error(
                "Não foi possível inicializar o campo de anexo.",
            );
        }

        if (
            !detailPage ||
            !summaryCard ||
            !metaCard ||
            !ticketActionsContainer ||
            !chatContainer || 
            !ticketReplyForm
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
            ticketReplyForm,

            fileInput,
            preview,
            previewImage,
            fileIcon,
            fileName,
            fileSize,
            removeButton,
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

        const chatItems: ChatItem[] = [
            ...state.ticket.comments.map((comment) => ({
                type: "comment" as const,
                data: comment,
            })),
            

            ...state.ticket.files.map((attachment) => ({
                type: "attachment" as const,
                data: attachment,
            })),
        ];

        chatItems.sort(
            (a, b) =>
                new Date(a.data.created_at).getTime() -
                new Date(b.data.created_at).getTime(),
        );

        renderConversation(
            elements.chatContainer,
            chatItems,
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

    elements.ticketReplyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!state.ticket) {
            return;
        }

        const replyResponse = await handleReplySubmit(
            state.ticket.id, 
            elements.ticketReplyForm
        );

        if (
            replyResponse.status === "error"
        ) {
            showToast(
                "Erro ao enviar resposta",
                replyResponse.message,
                "danger"
            );

            return;
        }

        if (
            replyResponse.comment
        ) {
            state.ticket = {
                ...state.ticket,
                comments: [
                    ...state.ticket.comments,
                    replyResponse.comment,
                ],
            };
        }

        if (replyResponse.attachment) {
            state.ticket = {
                ...state.ticket,
                files: [
                    ...state.ticket.files,
                    replyResponse.attachment,
                ],
            };
        }

        elements.ticketReplyForm.reset();

        renderPage();

        showToast(
            "Resposta enviada",
            replyResponse.message,
            "success"
        );
    });

    let previewUrl: string | null = null;

    function clearAttachmentPreview(): void {
        elements.fileInput.value = "";

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            previewUrl = null;
        }

        elements.previewImage.src = "";
        elements.previewImage.hidden = true;

        elements.fileIcon.hidden = false;

        elements.fileName.textContent = "";
        elements.fileSize.textContent = "";

        elements.preview.classList.add("d-none");
    }

    elements.fileInput.addEventListener(
        "change",
        () => {
            const file =
                elements.fileInput.files?.[0];

            if (!file) {
                clearAttachmentPreview();
                return;
            }

            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

            previewUrl =
                renderAttachmentPreview(
                    file,
                    {
                        container: elements.preview,
                        image: elements.previewImage,
                        fileIcon: elements.fileIcon,
                        fileName: elements.fileName,
                        fileSize: elements.fileSize,
                    },
                );
        },
    );

    elements.removeButton.addEventListener(
        "click",
        () => {
            clearAttachmentPreview();
        },
    );
});