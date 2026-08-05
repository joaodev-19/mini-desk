import type {
    TicketListItem,
} from "../../../api/tickets/types.js";

import {
    formatDateTime
} from "../../../shared/utils/utils.js";

export function renderTicketsList(
    tableBody: HTMLElement, 
    data: TicketListItem[]): void {

    tableBody.replaceChildren();

    const fragment = document.createDocumentFragment();

    data.forEach(ticket => {
        const row = document.createElement('tr');
        row.dataset.action = 'open-detail';
        row.classList.add('clickable-row');

        const Tticket = document.createElement('td');
        Tticket.dataset.label = "Chamado"

        const ticketDiv = document.createElement('div');
        ticketDiv.classList.add('ticket-identification');

        const ticketSpan = document.createElement('span');
        ticketSpan.classList.add('ticket-code');
        ticketSpan.textContent = `${ticket.id}`;

        const ticketStrong = document.createElement('strong');
        ticketStrong.textContent = ticket.title;

        ticketDiv.appendChild(ticketSpan);
        ticketDiv.appendChild(ticketStrong);
        Tticket.appendChild(ticketDiv);

        const Tmodule = document.createElement('td');
        Tmodule.dataset.label = "Módulo";

        const moduleSpan = document.createElement('span');
        moduleSpan.classList.add('module-tag');
        moduleSpan.textContent = ticket.module_display;

        Tmodule.appendChild(moduleSpan);

        const Tstatus = document.createElement('td');
        Tstatus.dataset.label = 'Status'

        const statusSpan = document.createElement('span');
        statusSpan.classList.add('status-badge', `status-${ticket.status}`);
        statusSpan.textContent = ticket.status_display;

        Tstatus.appendChild(statusSpan);

        const Tupdate = document.createElement('td');
        Tupdate.dataset.label = 'Atualizado';

        const updateSpan = document.createElement('span');
        updateSpan.classList.add('ticket-date');
        updateSpan.textContent = 
            formatDateTime(ticket.updated_at) ? 
            formatDateTime(ticket.updated_at) : 
            formatDateTime(ticket.created_at);

        Tupdate.appendChild(updateSpan);

        const Tcreator = document.createElement('td');
        Tcreator.dataset.label = 'Criado_por';

        const creatorSpan = document.createElement('span');
        creatorSpan.classList.add('module-tag');
        creatorSpan.textContent = ticket.created_by;

        Tcreator.appendChild(creatorSpan);

        row.appendChild(Tticket);
        row.appendChild(Tmodule);
        row.appendChild(Tstatus);
        row.appendChild(Tupdate);
        row.appendChild(Tcreator);

        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
}