import { request } from "../../core/https.js";
import type { HttpRequestConfig, ApiResponse } from "../../shared/types/httpTypes.js";

import type {
    TicketListItem,
    TicketDetail,
    CreateTicketRequest,
    UpdateTicketContentRequest,
    UpdateTicketSupportRequest,
    CreateCommentRequest,
    CreateAttachmentRequest,
    TicketComment,
    TicketAttachment,
} from "./types.js";

const BASE_URL = '/api/tickets/';


export function listTickets(): Promise<ApiResponse<TicketListItem[]>> {
    const config: HttpRequestConfig = {
        url: BASE_URL,
        method: 'GET',
    }
    return request<TicketListItem[]>(
        config
    )
}

export function myListTickets(): Promise<ApiResponse<TicketListItem[]>> {
    const config: HttpRequestConfig = {
        url: `${BASE_URL}mine/`,
        method: 'GET',
    }
    return request<TicketListItem[]>(
        config
    )
}

export function getTicket(id: number): Promise<ApiResponse<TicketDetail>> {
    const config: HttpRequestConfig = {
        url: `${BASE_URL}${id}/`,
        method: 'GET',
    }

    return request<TicketDetail>(config);
}

export function createTicket(data: CreateTicketRequest): Promise<ApiResponse<TicketDetail>> {
    const config: HttpRequestConfig<CreateTicketRequest> = {
        url: BASE_URL,
        method: 'POST',
        data: data,
    }

    return request<TicketDetail>(config);
}

export function updateTicketContent(
        id: number, data: UpdateTicketContentRequest
    ): Promise<ApiResponse<TicketDetail>> {

    const config: HttpRequestConfig<UpdateTicketContentRequest> = {
        url: `${BASE_URL}${id}/content/`,
        method: 'PATCH',
        data: data,
    }

    return request<TicketDetail>(config);
}

export function updateTicketSupport(
    id: number, data: UpdateTicketSupportRequest
    ): Promise<ApiResponse<TicketDetail>> {

    const config: HttpRequestConfig<UpdateTicketSupportRequest> = {
        url: `${BASE_URL}${id}/support/`,
        method: 'PATCH',
        data: data,
    }

    return request<TicketDetail>(config);
}

export function createTicketComment(
    id: number, data: CreateCommentRequest
    ): Promise<ApiResponse<TicketComment>> {

        const config: HttpRequestConfig<CreateCommentRequest> = {
            url: `${BASE_URL}${id}/comment/`,
            method: 'POST',
            data: data,
        }

        return request<TicketComment>(config);
    }


    
export function createTicketAttachment(
    id: number, data: CreateAttachmentRequest
    ): Promise<ApiResponse<TicketAttachment>> {

        const formData = new FormData();
        formData.append('file', data.file);

        const config: HttpRequestConfig = {
            url: `${BASE_URL}${id}/attachment/`,
            method: 'POST',
            data: formData,
        }

        return request<TicketAttachment>(config);
    }


export function deleteTicket(id: number): Promise<ApiResponse<null>> {
    const config: HttpRequestConfig = {
        url: `${BASE_URL}${id}/`,
        method: 'DELETE',
    }

    return request<null>(config);
}

export function deleteAttachment(
    attachmentId: number,
): Promise<ApiResponse<null>> {
    const config: HttpRequestConfig = {
        url: `${BASE_URL}attachments/${attachmentId}/`,
        method: "DELETE",
    };
    return request<null>(config);
}