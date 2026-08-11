function createTicketAttachmentItem(file) {
    if (!file || file.size === 0) {
        throw new Error("Não foi possível renderizar o arquivo enviado.");
    }
    const container = document.createElement('article');
    container.classList.add('ticket-attachment-item');
}
export function renderTicketAttachments(files, container) {
    if (!files || files.length === 0) {
        const emptyTextParagraph = document.createElement('p');
        emptyTextParagraph.textContent = "Nenhum anexo enviado até o momento.";
        emptyTextParagraph.classList.add("empty-text");
        container.replaceChildren(emptyTextParagraph);
    }
}
//# sourceMappingURL=renderTicketAttachments.js.map