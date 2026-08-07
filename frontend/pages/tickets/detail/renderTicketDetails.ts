import type { StatusChoices, TicketDetail } from "../../../api/tickets/types";
import { formatDateTime } from "../../../shared/utils/utils.js";

function renderStatusBadge(
    element: HTMLElement,
    status: StatusChoices,
    statusDisplay: string,
): void {
    element.textContent = statusDisplay;

    element.classList.remove(
        "status-open",
        "status-in_analysis",
        "status-waiting_user",
        "status-resolved",
        "status-closed",
    )

    element.classList.add(
        `status-${status}`,
    );
}

export function renderSummaryCard(
    container: HTMLElement,
    data: TicketDetail
): void {
    const ticketTitle = container.querySelector("#ticket-detail-title");
    const ticketCode = container.querySelector("#ticket-detail-code");
    const ticketDescription = container.querySelector("#ticket-detail-description");
    const ticketStatus = container.querySelector<HTMLElement>("#ticket-detail-status");
    const ticketModule = container.querySelector("#ticket-detail-module");

    if (!ticketTitle ||
        !ticketCode ||
        !ticketDescription ||
        !ticketStatus ||
        !ticketModule
    ) {
        throw new Error("Não foi possível inicializar os elementos do cartão de resumo.");
    }

    ticketTitle.textContent = data.title;
    ticketCode.textContent = 
    
    `Chamado #${data.id.toString().padStart(2, "0")}`;
    ticketDescription.textContent = data.description;
    ticketModule.textContent = data.module_display;

    renderStatusBadge(
        ticketStatus,
        data.status,
        data.status_display,
    )
}

export function renderMetaCard(
    container: HTMLElement,
    data: TicketDetail
): void {
    const ticketCreatedBy = container.querySelector("#ticket-detail-created-by");
    const ticketAssignedTo = container.querySelector("#ticket-detail-assigned-to");
    const ticketCreatedAt = container.querySelector("#ticket-detail-created-at");
    const ticketUpdatedAt = container.querySelector("#ticket-detail-updated-at");
    const ticketResolvedAt = container.querySelector("#ticket-detail-resolved-at");

    if (!ticketCreatedBy ||
        !ticketAssignedTo ||
        !ticketCreatedAt ||
        !ticketUpdatedAt ||
        !ticketResolvedAt
    ) {
        throw new Error("Não foi possível inicializar os elementos do cartão de informações.");
    }

    ticketCreatedBy.textContent = data.created_by ;
    ticketAssignedTo.textContent = data.assigned_to ? data.assigned_to : "Esperando suporte iniciar atendimento";
    ticketCreatedAt.textContent = formatDateTime(data.created_at);
    ticketUpdatedAt.textContent = formatDateTime(data.updated_at);
    const resolvedAtLabel = data.resolved_at ? formatDateTime(data.resolved_at) : "Chamado em aberto";
    ticketResolvedAt.textContent = resolvedAtLabel;
}

export function renderTicketActions(
    container: HTMLElement,
    data: TicketDetail,
): void {
    const isEditingAllowed = data.status === "open";
    const isStartAllowed = data.status === "open";

    const editButton = container.querySelector<HTMLButtonElement>("#edit-ticket-button");
    const startButton = container.querySelector<HTMLButtonElement>("#start-ticket-button");

    editButton?.classList.toggle("d-none", !isEditingAllowed);
    startButton?.classList.toggle("d-none", !isStartAllowed);
}