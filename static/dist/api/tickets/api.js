import { request } from "../../core/https.js";
const BASE_URL = '/api/tickets/';
export function listTickets() {
    const config = {
        url: BASE_URL,
        method: 'GET',
    };
    return request(config);
}
export function myListTickets() {
    const config = {
        url: `${BASE_URL}mine/`,
        method: 'GET',
    };
    return request(config);
}
export function getTicket(id) {
    const config = {
        url: `${BASE_URL}${id}/`,
        method: 'GET',
    };
    return request(config);
}
export function createTicket(data) {
    const config = {
        url: BASE_URL,
        method: 'POST',
        data: data,
    };
    return request(config);
}
export function updateTicketContent(id, data) {
    const config = {
        url: `${BASE_URL}${id}/content/`,
        method: 'PATCH',
        data: data,
    };
    return request(config);
}
export function updateTicketSupport(id, data) {
    const config = {
        url: `${BASE_URL}${id}/support/`,
        method: 'PATCH',
        data: data,
    };
    return request(config);
}
export function updateTicketStatus(id, status) {
    const config = {
        url: ``
    };
}
export function createTicketComment(id, data) {
    const config = {
        url: `${BASE_URL}${id}/comment/`,
        method: 'POST',
        data: data,
    };
    return request(config);
}
export function createTicketAttachment(id, data) {
    const formData = new FormData();
    formData.append('file', data.file);
    const config = {
        url: `${BASE_URL}${id}/attachment/`,
        method: 'POST',
        data: formData,
    };
    return request(config);
}
export function deleteTicket(id) {
    const config = {
        url: `${BASE_URL}${id}/`,
        method: 'DELETE',
    };
    return request(config);
}
export function deleteAttachment(attachmentId) {
    const config = {
        url: `${BASE_URL}attachments/${attachmentId}/`,
        method: "DELETE",
    };
    return request(config);
}
//# sourceMappingURL=api.js.map