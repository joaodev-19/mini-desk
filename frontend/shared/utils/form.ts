import type { 
    CreateTicketRequest,
    CreateCommentRequest,
    CreateAttachmentRequest,
    ModuleChoices,
    CreateTicketResult,
 } from "../../api/tickets/types.js";

 import {
    createTicket,
    createTicketComment,
    createTicketAttachment,

 } from "../../api/tickets/api.js";

export async function handleCreateTicketSubmit(form: HTMLFormElement): Promise<CreateTicketResult> {

    const formData = new FormData(form);

    const title = formData.get('title');
    const description = formData.get('description');
    const module = formData.get('module');
    const file = formData.get('file');

    if (
        typeof title !== 'string' ||
        typeof description !== 'string' ||
        typeof module !== 'string'
    ) {
        throw new Error('Dados inválidos no formulário.');
    }

    const newTicket: CreateTicketRequest = {
        title,
        description,
        module: module as ModuleChoices,
    }

    try {
        const createTicketResponse = await createTicket(newTicket);
        const ticketId = createTicketResponse.data.id;

        if (file instanceof File && file.size > 0) {
            const newAttachment: CreateAttachmentRequest = {
                file
            }

            try {
                await createTicketAttachment(ticketId, newAttachment);
    
                return {
                    status: 'success',
                    message: 'Chamado e anexo criados com sucesso.',
                    ticketId: ticketId,
                };
            } catch (error) {
                return {
                    status: 'warning',
                    message: 'Chamado criado, mas o anexo falhou.',
                    ticketId: ticketId,
                };
            }
        }

        return {
            status: "success",
            message: 'Chamado criado com sucesso.',
            ticketId
        }
    } catch (error) {
        return {
            status: 'error',
            message: 'Não foi possível criar o chamado.',
        };
    }
}