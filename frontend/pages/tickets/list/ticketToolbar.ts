import type {
    ModuleChoices,
    StatusChoices,
    TicketListItem,
} from "../../../api/tickets/types.js";

import {
    applyTicketFilters,
} from "./ticketFilters.js";

import type {
    TicketFilters,
    TicketOrder,
} from "./ticketFilters.js";


type TicketToolbarOptions = {
    toolbar: HTMLElement;

    getTickets: () => readonly TicketListItem[];

    onFilteredTickets: (
        tickets: TicketListItem[],
    ) => void;
};


export type TicketToolbarController = {
    refresh: () => void;
    destroy: () => void;
};


type TicketToolbarControls = {
    search: HTMLInputElement;
    status: HTMLSelectElement;
    module: HTMLSelectElement;
    order: HTMLSelectElement;
};


function getRequiredControl<
    T extends HTMLInputElement | HTMLSelectElement
>(
    toolbar: HTMLElement,
    selector: string,
): T {
    const control = toolbar.querySelector<T>(selector);

    if (!control) {
        throw new Error(
            `Controle obrigatório não encontrado: ${selector}`,
        );
    }

    return control;
}


function getToolbarControls(
    toolbar: HTMLElement,
): TicketToolbarControls {
    return {
        search: getRequiredControl<HTMLInputElement>(
            toolbar,
            '[name="search"]',
        ),

        status: getRequiredControl<HTMLSelectElement>(
            toolbar,
            '[name="status"]',
        ),

        module: getRequiredControl<HTMLSelectElement>(
            toolbar,
            '[name="module"]',
        ),

        order: getRequiredControl<HTMLSelectElement>(
            toolbar,
            '[name="order"]',
        ),
    };
}


function getFilterValues(
    controls: TicketToolbarControls,
): TicketFilters {
    return {
        search: controls.search.value,

        status:
            controls.status.value as StatusChoices | "",

        module:
            controls.module.value as ModuleChoices | "",

        order:
            controls.order.value as TicketOrder,
    };
}


function isTicketFilterControl(
    target: EventTarget | null,
): target is HTMLInputElement | HTMLSelectElement {
    if (
        !(target instanceof HTMLInputElement) &&
        !(target instanceof HTMLSelectElement)
    ) {
        return false;
    }

    return [
        "search",
        "status",
        "module",
        "order",
    ].includes(target.name);
}


export function initializeTicketToolbar(
    options: TicketToolbarOptions,
): TicketToolbarController {
    const {
        toolbar,
        getTickets,
        onFilteredTickets,
    } = options;

    const controls = getToolbarControls(toolbar);


    function refresh(): void {
        const filters = getFilterValues(controls);

        const visibleTickets = applyTicketFilters(
            getTickets(),
            filters,
        );

        onFilteredTickets(visibleTickets);
    }


    function handleToolbarInteraction(
        event: Event,
    ): void {
        const target = event.target;

        if (!isTicketFilterControl(target)) {
            return;
        }

        if (
            target instanceof HTMLInputElement &&
            event.type !== "input"
        ) {
            return;
        }

        if (
            target instanceof HTMLSelectElement &&
            event.type !== "change"
        ) {
            return;
        }

        refresh();
    }


    toolbar.addEventListener(
        "input",
        handleToolbarInteraction,
    );

    toolbar.addEventListener(
        "change",
        handleToolbarInteraction,
    );


    return {
        refresh,

        destroy(): void {
            toolbar.removeEventListener(
                "input",
                handleToolbarInteraction,
            );

            toolbar.removeEventListener(
                "change",
                handleToolbarInteraction,
            );
        },
    };
}