import type { StatusChoices, TicketDetail } from "../../../api/tickets/types";
import type { CurrentUser } from "../../../api/users/types";

type WorkflowItem = {
    icon: string;
    label: string;
    desc: string;
};

type WorkflowAction =
    | "start"
    | "wait_user"
    | "resume"
    | "resolve"
    | "close"
    | "reopen";

const workflowItemsMap: Record<
    WorkflowAction,
    WorkflowItem
> = {
    start: {
        icon: "bi bi-play-circle",
        label: "Iniciar atendimento",
        desc: "Assumir e iniciar a análise do chamado.",
    },

    wait_user: {
        icon: "bi bi-hourglass-split",
        label: "Aguardar cliente",
        desc: "Solicitar mais informações ao cliente.",
    },

    resume: {
        icon: "bi bi-arrow-repeat",
        label: "Retomar atendimento",
        desc: "Continuar a análise do chamado.",
    },

    resolve: {
        icon: "bi bi-check2-circle",
        label: "Concluir chamado",
        desc: "Marcar atendimento como concluído.",
    },

    close: {
        icon: "bi bi-lock",
        label: "Fechar chamado",
        desc: "Encerrar definitivamente o atendimento.",
    },

    reopen: {
        icon: "bi bi-arrow-counterclockwise",
        label: "Reabrir chamado",
        desc: "Retornar o chamado ao atendimento.",
    },
};

const allowedActionsByStatus = {
    open: [
        "start",
    ],

    in_analysis: [
        "wait_user",
        "resolve",
    ],

    waiting_user: [
        "resume",
        "resolve",
    ],

    resolved: [
        "close",
        "reopen",
    ],

    closed: [
        "reopen",
    ],
} satisfies Record<StatusChoices, WorkflowAction[]>;

const statusByWorkflowAction: Record<
    WorkflowAction,
    StatusChoices
> = {
    start: "in_analysis",
    wait_user: "waiting_user",
    resume: "in_analysis",
    resolve: "resolved",
    close: "closed",
    reopen: "open",
};

export function createDropdownItem(action: WorkflowAction, status: StatusChoices): HTMLElement {
    const item = workflowItemsMap[action];

    const container = document.createElement('li');

    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.classList.add('dropdown-item', 'workflow-dropdown-item');
    actionBtn.dataset.action = action;
    actionBtn.dataset.status = status;

    const spanIcon = document.createElement('span');
    spanIcon.classList.add('workflow-action-icon');

    const icon = document.createElement('i');
    icon.classList.add(...item.icon.split(" "));
    spanIcon.appendChild(icon);

    const spanContent = document.createElement('span');
    spanContent.classList.add('workflow-action-content');

    const label = document.createElement('strong');
    const titleLabel = item.label;
    label.textContent = titleLabel;

    const desc = document.createElement('small');
    const descLabel = item.desc;
    desc.textContent = descLabel;

    spanContent.appendChild(label);
    spanContent.appendChild(desc);

    actionBtn.appendChild(spanIcon);
    actionBtn.appendChild(spanContent);

    container.appendChild(actionBtn);

    return container;
}

export function renderWorkflowDropdownItems(
    container: HTMLElement,
    currentStatus: StatusChoices): void {
    const allowedActions = allowedActionsByStatus[currentStatus];
    
    const fragment = document.createDocumentFragment();
    
    allowedActions.forEach((action) => {
        const targetStatus = statusByWorkflowAction[action];
        const item = (createDropdownItem(action, targetStatus));

        fragment.appendChild(item);
    });

    container.replaceChildren(fragment);
}

export function renderTicketContentActions(
    container: HTMLElement,
    ticket: TicketDetail,
    user: CurrentUser,
): void {
    const fragment =
        document.createDocumentFragment();

    if (
        user.role === 'client' &&
        ticket.status === "open"
    ) {
        const editButton =
            document.createElement("button");

        editButton.type = "button";

        editButton.setAttribute("data-bs-toggle","modal");
        editButton.setAttribute("data-bs-target", "#edit-ticket-modal",);

        editButton.classList.add(
            "secondary-button",
        );

        editButton.dataset.action =
            "edit-ticket";

        editButton.textContent =
            "Editar chamado";

        fragment.appendChild(editButton);
    }

    container.replaceChildren(fragment);
}