import type {
    TicketListItem,
} from "../../../api/tickets/types.js";

import {
    formatDateTime,
} from "../../../shared/utils/utils.js";


export function renderTicketsList(
    tableBody: HTMLElement,
    data: TicketListItem[],
): void {
    tableBody.replaceChildren();

    const fragment = document.createDocumentFragment();

    if (data.length === 0) {
        const row = document.createElement("tr");
        row.classList.add("ticket-empty-row");

        const messageCell = document.createElement("td");
        messageCell.colSpan = 5;
        messageCell.classList.add("ticket-empty-cell");
        messageCell.textContent =
            "Nenhum chamado foi encontrado.";

        row.appendChild(messageCell);
        tableBody.appendChild(row);

        return;
    }

    data.forEach((ticket) => {
        const row = document.createElement("tr");

        row.classList.add("ticket-row");
        row.dataset.href = `/tickets/${ticket.id}/`;

        /* ==================================================
           Chamado
        ================================================== */

        const ticketCell = document.createElement("td");
        ticketCell.dataset.label = "Chamado";

        const ticketLink = document.createElement("a");
        ticketLink.classList.add("ticket-main-link");
        ticketLink.href = `/tickets/${ticket.id}/`;
        ticketLink.setAttribute(
            "aria-label",
            `Abrir chamado ${ticket.id}: ${ticket.title}`,
        );

        const ticketIdentification = document.createElement("div");
        ticketIdentification.classList.add(
            "ticket-identification",
        );

        const ticketCode = document.createElement("span");
        ticketCode.classList.add("ticket-code");
        ticketCode.textContent = `Chamado #${ticket.id}`;

        const ticketTitle = document.createElement("strong");
        ticketTitle.classList.add("ticket-title");
        ticketTitle.textContent = ticket.title;

        const ticketDescription = document.createElement("p");
        ticketDescription.classList.add("ticket-description");
        ticketDescription.textContent = ticket.description;

        ticketIdentification.append(
            ticketCode,
            ticketTitle,
            ticketDescription,
        );

        ticketLink.appendChild(ticketIdentification);
        ticketCell.appendChild(ticketLink);


        /* ==================================================
           Módulo
        ================================================== */

        const moduleCell = document.createElement("td");
        moduleCell.dataset.label = "Módulo";

        const moduleTag = document.createElement("span");
        moduleTag.classList.add("module-tag");
        moduleTag.textContent = ticket.module_display;

        moduleCell.appendChild(moduleTag);


        /* ==================================================
           Status
        ================================================== */

        const statusCell = document.createElement("td");
        statusCell.dataset.label = "Status";

        const statusBadge = document.createElement("span");

        statusBadge.classList.add(
            "status-badge",
            `status-${ticket.status}`,
        );

        statusBadge.textContent = ticket.status_display;

        statusCell.appendChild(statusBadge);


        /* ==================================================
           Criado em
        ================================================== */

        const createdAtCell = document.createElement("td");
        createdAtCell.dataset.label = "Criado em";

        const createdAtTime = document.createElement("time");
        createdAtTime.classList.add("ticket-date");
        createdAtTime.dateTime = ticket.created_at;
        createdAtTime.textContent = formatDateTime(
            ticket.created_at,
        );

        createdAtCell.appendChild(createdAtTime);


        /* ==================================================
           Atualizado
        ================================================== */

        const updatedAtCell = document.createElement("td");
        updatedAtCell.dataset.label = "Atualizado";

        const updatedAtTime = document.createElement("time");
        updatedAtTime.classList.add("ticket-date");

        const updatedAt =
            ticket.updated_at || ticket.created_at;

        updatedAtTime.dateTime = updatedAt;
        updatedAtTime.textContent = formatDateTime(updatedAt);

        updatedAtCell.appendChild(updatedAtTime);

        /* ==================================================
           Montagem da linha
        ================================================== */

        row.append(
            ticketCell,
            moduleCell,
            statusCell,
            createdAtCell,
            updatedAtCell,
        );

        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
}


export function initializeTicketRowNavigation(
    tableBody: HTMLElement,
): void {
    tableBody.addEventListener("click", (event) => {
        const target = event.target;

        if (!(target instanceof HTMLElement)) {
            return;
        }

        // Links e outros controles continuam com seus comportamentos próprios.
        if (
            target.closest(
                "a, button, input, select, textarea, label",
            )
        ) {
            return;
        }

        const row = target.closest<HTMLTableRowElement>(
            ".ticket-row[data-href]",
        );

        const href = row?.dataset.href;

        if (!href) {
            return;
        }

        window.location.assign(href);
    });
}