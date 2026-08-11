import type { TicketAttachment } from "../../../api/tickets/types";

function createTicketAttachmentItem(
    file: File
) : HTMLElement {
    if (!file || file.size === 0) {
        throw new Error("Não foi possível renderizar o arquivo enviado.");
    }

    const container = document.createElement('article');
    container.classList.add('ticket-attachment-item');
    

}

export function renderTicketAttachments(
    files: TicketAttachment[],
    container: HTMLElement
): void {
    if (!files || files.length === 0) {
        const emptyTextParagraph = document.createElement('p');
        emptyTextParagraph.textContent = "Nenhum anexo enviado até o momento.";
        emptyTextParagraph.classList.add("empty-text");

        container.replaceChildren(emptyTextParagraph);
    }
}