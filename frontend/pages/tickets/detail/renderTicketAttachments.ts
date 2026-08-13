import type {
    TicketAttachment,
} from "../../../api/tickets/types.js";
import type { CurrentUser } from "../../../api/users/types.js";

import {
    formatDateTime,
} from "../../../shared/utils/utils.js";


const iconsMap: Record<string, string> = {
    png: "bi bi-file-earmark-image",
    jpg: "bi bi-file-earmark-image",
    jpeg: "bi bi-file-earmark-image",
    webp: "bi bi-file-earmark-image",
    gif: "bi bi-file-earmark-image",

    pdf: "bi bi-file-earmark-pdf",

    doc: "bi bi-file-earmark-word",
    docx: "bi bi-file-earmark-word",

    xls: "bi bi-file-earmark-excel",
    xlsx: "bi bi-file-earmark-excel",

    zip: "bi bi-file-earmark-zip",

    txt: "bi bi-file-earmark-text",
};


function getFileName(fileUrl: string): string {
    try {
        const url = new URL(
            fileUrl,
            window.location.origin,
        );

        const fileName =
            url.pathname.split("/").pop();

        return fileName
            ? decodeURIComponent(fileName)
            : "Arquivo";
    } catch {
        return "Arquivo";
    }
}


function getFileExtension(
    fileUrl: string,
): string {
    const fileName =
        getFileName(fileUrl);

    const extension =
        fileName.split(".").pop();

    if (
        !extension ||
        extension === fileName
    ) {
        return "";
    }

    return extension.toLowerCase();
}


export function createTicketAttachmentItem(
    ticketAttachment: TicketAttachment,
    user: CurrentUser,
): HTMLElement {
    const file =
        ticketAttachment.file;

    if (!file) {
        throw new Error(
            "Não foi possível renderizar o arquivo enviado.",
        );
    }


    const fileName =
        getFileName(file);

    const fileExtension =
        getFileExtension(file);

    const iconClass =
        iconsMap[fileExtension] ??
        "bi bi-file-earmark";


    /*
     * <article>
     */
    const container =
        document.createElement("article");

    container.classList.add(
        "ticket-attachment-item",
    );


    /*
     * Ícone
     */
    const divAttachmentIcon =
        document.createElement("div");

    divAttachmentIcon.classList.add(
        "ticket-attachment-icon",
    );

    const attachmentIcon =
        document.createElement("i");

    attachmentIcon.classList.add(
        ...iconClass.split(" "),
    );

    divAttachmentIcon.appendChild(
        attachmentIcon,
    );


    /*
     * Informações
     */
    const divAttachmentInfo =
        document.createElement("div");

    divAttachmentInfo.classList.add(
        "ticket-attachment-info",
    );


    /*
     * Nome / link do arquivo
     */
    const attachmentName =
        document.createElement("a");

    attachmentName.href = file;
    attachmentName.target = "_blank";
    attachmentName.rel =
        "noopener noreferrer";

    attachmentName.classList.add(
        "ticket-attachment-name",
    );

    attachmentName.textContent =
        fileName;


    /*
     * Meta
     */
    const attachmentMeta =
        document.createElement("div");

    attachmentMeta.classList.add(
        "ticket-attachment-meta",
    );


    const uploadedBy =
        document.createElement("span");

    uploadedBy.textContent =
        `Enviado por ${ticketAttachment.uploaded_by.full_name}`;


    const separator =
        document.createElement("span");

    separator.textContent = "•";
    separator.setAttribute(
        "aria-hidden",
        "true",
    );


    const createdAt =
        document.createElement("time");

    const createdAtDate =
        new Date(
            ticketAttachment.created_at,
        );

    createdAt.dateTime =
        createdAtDate.toISOString();

    createdAt.textContent =
        formatDateTime(
            ticketAttachment.created_at,
        );


    attachmentMeta.append(
        uploadedBy,
        separator,
        createdAt,
    );


    divAttachmentInfo.append(
        attachmentName,
        attachmentMeta,
    );


    /*
     * Ações
     */
    const divAttachmentActions =
        document.createElement("div");

    divAttachmentActions.classList.add(
        "ticket-attachment-actions",
    );


    /*
     * Abrir arquivo
     */
    const openAttachment =
        document.createElement("a");

    openAttachment.href = file;
    openAttachment.target = "_blank";
    openAttachment.rel =
        "noopener noreferrer";

    openAttachment.classList.add(
        "attachment-action-button",
    );

    openAttachment.setAttribute(
        "aria-label",
        "Abrir anexo",
    );

    openAttachment.title =
        "Abrir arquivo";


    const openIcon =
        document.createElement("i");

    openIcon.classList.add(
        "bi",
        "bi-box-arrow-up-right",
    );

    openAttachment.appendChild(
        openIcon,
    );


    /*
     * Excluir arquivo
     */
    const deleteAttachment =
        document.createElement("button");

    deleteAttachment.type =
        "button";

    deleteAttachment.classList.add(
        "attachment-action-button",
        "attachment-delete-button",
    );

    deleteAttachment.dataset.action =
        "delete-attachment";

    deleteAttachment.dataset.attachmentId =
        ticketAttachment.id.toString();

    deleteAttachment.setAttribute(
        "aria-label",
        "Excluir anexo",
    );

    deleteAttachment.title =
        "Excluir arquivo";


    const deleteIcon =
        document.createElement("i");

    deleteIcon.classList.add(
        "bi",
        "bi-trash3",
    );

    deleteAttachment.appendChild(
        deleteIcon,
    );


    divAttachmentActions.append(
        openAttachment,
    );

    const canDelete =
        user.role === "support" ||
        ticketAttachment.uploaded_by.id === user.id;

    if (canDelete) {
        divAttachmentActions.appendChild(
            deleteAttachment,
        );
    }


    /*
     * Montagem final
     */
    container.append(
        divAttachmentIcon,
        divAttachmentInfo,
        divAttachmentActions,
    );

    return container;
}


export function renderTicketAttachments(
    files: TicketAttachment[],
    user: CurrentUser,
    container: HTMLElement,
): void {
    if (files.length === 0) {
        const emptyTextParagraph =
            document.createElement("p");

        emptyTextParagraph.textContent =
            "Nenhum anexo enviado até o momento.";

        emptyTextParagraph.classList.add(
            "empty-text",
        );

        container.replaceChildren(
            emptyTextParagraph,
        );

        return;
    }


    const fragment =
        document.createDocumentFragment();

    files.forEach((file) => {
        const attachmentItem =
            createTicketAttachmentItem(
                file,
                user
            );

        fragment.appendChild(
            attachmentItem,
        );
    });


    container.replaceChildren(
        fragment,
    );
}