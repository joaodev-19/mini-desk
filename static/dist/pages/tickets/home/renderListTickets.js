import { iconsMap } from "../../../shared/utils/maps.js";
import { formatDateTime, } from "../../../shared/utils/utils.js";
export function renderTicketsList(tableBody, data) {
    tableBody.replaceChildren();
    const fragment = document.createDocumentFragment();
    if (data.length === 0) {
        const row = document.createElement("tr");
        row.classList.add("ticket-empty-row");
        const messageCell = document.createElement("td");
        messageCell.colSpan = 5;
        messageCell.classList.add("ticket-empty-cell");
        messageCell.textContent =
            "Nenhum chamado foi iniciado ainda.";
        row.appendChild(messageCell);
        tableBody.appendChild(row);
        return;
    }
    data.forEach((ticket) => {
        const ticketUrl = `/tickets/${ticket.id}/`;
        const row = document.createElement("tr");
        row.classList.add("ticket-row");
        row.dataset.ticketId = ticket.id.toString();
        row.dataset.href = ticketUrl;
        /* ==================================================
           Chamado
        ================================================== */
        const ticketCell = document.createElement("td");
        ticketCell.dataset.label = "Chamado";
        const ticketIdentification = document.createElement("div");
        ticketIdentification.classList.add("ticket-identification");
        const ticketCode = document.createElement("span");
        ticketCode.classList.add("ticket-code");
        ticketCode.textContent = `Chamado #${ticket.id}`;
        const ticketTitle = document.createElement("strong");
        ticketTitle.classList.add("ticket-title");
        ticketTitle.textContent = ticket.title;
        const ticketDescription = document.createElement("p");
        ticketDescription.classList.add("ticket-description");
        ticketDescription.textContent = ticket.description;
        ticketIdentification.append(ticketCode, ticketTitle, ticketDescription);
        ticketCell.appendChild(ticketIdentification);
        /* ==================================================
           Módulo
        ================================================== */
        const moduleCell = document.createElement("td");
        moduleCell.dataset.label = "Módulo";
        const icon = document.createElement("i");
        const iconClass = iconsMap[ticket.module];
        icon.classList.add(...iconClass.split(" "));
        const moduleTag = document.createElement("span");
        moduleTag.classList.add("module-tag");
        moduleTag.textContent = ticket.module_display;
        moduleTag.dataset.module = ticket.module;
        moduleTag.appendChild(icon);
        moduleCell.appendChild(moduleTag);
        /* ==================================================
           Status
        ================================================== */
        const statusCell = document.createElement("td");
        statusCell.dataset.label = "Status";
        const statusBadge = document.createElement("span");
        statusBadge.classList.add("status-badge", `status-${ticket.status}`);
        statusBadge.textContent = ticket.status_display;
        statusCell.appendChild(statusBadge);
        /* ==================================================
           Atualizado
        ================================================== */
        const updatedAtCell = document.createElement("td");
        updatedAtCell.dataset.label = "Atualizado";
        const updatedAtTime = document.createElement("time");
        updatedAtTime.classList.add("ticket-date");
        const updatedAt = ticket.updated_at || ticket.created_at;
        updatedAtTime.dateTime = updatedAt;
        updatedAtTime.textContent = formatDateTime(updatedAt);
        updatedAtCell.appendChild(updatedAtTime);
        /* ==================================================
           Criado por
        ================================================== */
        const creatorCell = document.createElement("td");
        creatorCell.dataset.label = "Criado por";
        const creatorTag = document.createElement("span");
        creatorTag.classList.add("creator-tag");
        creatorTag.textContent = ticket.created_by;
        creatorCell.appendChild(creatorTag);
        /* ==================================================
           Montagem
        ================================================== */
        row.append(ticketCell, moduleCell, statusCell, updatedAtCell, creatorCell);
        fragment.appendChild(row);
    });
    tableBody.appendChild(fragment);
}
export function initializeTicketRowNavigation(tableBody) {
    tableBody.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        if (target.closest("a, button, input, select, textarea, label")) {
            return;
        }
        const row = target.closest(".ticket-row[data-href]");
        const href = row?.dataset.href;
        if (!href) {
            return;
        }
        window.location.assign(href);
    });
}
//# sourceMappingURL=renderListTickets.js.map