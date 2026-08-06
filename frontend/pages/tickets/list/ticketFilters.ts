import type {
    ModuleChoices,
    StatusChoices,
    TicketListItem,
} from "../../../api/tickets/types.js";


export type TicketOrder =
    | "recent"
    | "oldest"
    | "updated";


export type TicketFilters = {
    search: string;
    status: StatusChoices | "";
    module: ModuleChoices | "";
    order: TicketOrder;
};


function normalizeSearch(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}


export function filterBySearch(
    tickets: readonly TicketListItem[],
    search: string,
): TicketListItem[] {
    const normalizedSearch = normalizeSearch(search);

    if (!normalizedSearch) {
        return [...tickets];
    }

    return tickets.filter((ticket) => {
        const ticketId = ticket.id.toString();
        const ticketTitle = normalizeSearch(ticket.title);

        return (
            ticketId.includes(normalizedSearch) ||
            ticketTitle.includes(normalizedSearch)
        );
    });
}


export function filterByStatus(
    tickets: readonly TicketListItem[],
    status: StatusChoices | "",
): TicketListItem[] {
    if (!status) {
        return [...tickets];
    }

    return tickets.filter(
        (ticket) => ticket.status === status,
    );
}


export function filterByModule(
    tickets: readonly TicketListItem[],
    module: ModuleChoices | "",
): TicketListItem[] {
    if (!module) {
        return [...tickets];
    }

    return tickets.filter(
        (ticket) => ticket.module === module,
    );
}


function getTimestamp(
    value: string | null | undefined,
): number {
    if (!value) {
        return 0;
    }

    const timestamp = Date.parse(value);

    return Number.isNaN(timestamp)
        ? 0
        : timestamp;
}


export function orderTickets(
    tickets: readonly TicketListItem[],
    order: TicketOrder,
): TicketListItem[] {
    const orderedTickets = [...tickets];

    switch (order) {
        case "oldest":
            return orderedTickets.sort(
                (first, second) =>
                    getTimestamp(first.created_at) -
                    getTimestamp(second.created_at),
            );

        case "updated":
            return orderedTickets.sort(
                (first, second) =>
                    getTimestamp(second.updated_at) -
                    getTimestamp(first.updated_at),
            );

        case "recent":
        default:
            return orderedTickets.sort(
                (first, second) =>
                    getTimestamp(second.created_at) -
                    getTimestamp(first.created_at),
            );
    }
}


export function applyTicketFilters(
    tickets: readonly TicketListItem[],
    filters: TicketFilters,
): TicketListItem[] {
    let visibleTickets = filterBySearch(
        tickets,
        filters.search,
    );

    visibleTickets = filterByStatus(
        visibleTickets,
        filters.status,
    );

    visibleTickets = filterByModule(
        visibleTickets,
        filters.module,
    );

    visibleTickets = orderTickets(
        visibleTickets,
        filters.order,
    );

    return visibleTickets;
}