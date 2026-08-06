function normalizeSearch(value) {
    return value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}
export function filterBySearch(tickets, search) {
    const normalizedSearch = normalizeSearch(search);
    if (!normalizedSearch) {
        return [...tickets];
    }
    return tickets.filter((ticket) => {
        const ticketId = ticket.id.toString();
        const ticketTitle = normalizeSearch(ticket.title);
        return (ticketId.includes(normalizedSearch) ||
            ticketTitle.includes(normalizedSearch));
    });
}
export function filterByStatus(tickets, status) {
    if (!status) {
        return [...tickets];
    }
    return tickets.filter((ticket) => ticket.status === status);
}
export function filterByModule(tickets, module) {
    if (!module) {
        return [...tickets];
    }
    return tickets.filter((ticket) => ticket.module === module);
}
function getTimestamp(value) {
    if (!value) {
        return 0;
    }
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp)
        ? 0
        : timestamp;
}
export function orderTickets(tickets, order) {
    const orderedTickets = [...tickets];
    switch (order) {
        case "oldest":
            return orderedTickets.sort((first, second) => getTimestamp(first.created_at) -
                getTimestamp(second.created_at));
        case "updated":
            return orderedTickets.sort((first, second) => getTimestamp(second.updated_at) -
                getTimestamp(first.updated_at));
        case "recent":
        default:
            return orderedTickets.sort((first, second) => getTimestamp(second.created_at) -
                getTimestamp(first.created_at));
    }
}
export function applyTicketFilters(tickets, filters) {
    let visibleTickets = filterBySearch(tickets, filters.search);
    visibleTickets = filterByStatus(visibleTickets, filters.status);
    visibleTickets = filterByModule(visibleTickets, filters.module);
    visibleTickets = orderTickets(visibleTickets, filters.order);
    return visibleTickets;
}
//# sourceMappingURL=ticketFilters.js.map