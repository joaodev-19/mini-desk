export type ModuleChoices = 'clients' | 'processes' | 'calendar' | 'documents' | 'users' | 'others';

export type StatusChoices = 'open' | 'in_analysis' | 'waiting_user' | 'resolved' | 'closed';

export interface TicketComment {
    id: number;
    author: string;
    content: string;
    created_at: string;
}

export interface TicketAttachment {
    id: number;
    uploaded_by: string;
    file: string;
    created_at: string;
}

export interface TicketListItem {
    id: number;
    title: string;

    module: ModuleChoices;
    module_display: string;

    status: StatusChoices;
    status_display: string;

    created_at: string;
    created_by: string;
    assigned_to: string | null;
}

export interface TicketDetail {
    id: number;
    title: string;
    description: string;

    module: ModuleChoices;
    module_display: string;

    status: StatusChoices;
    status_display: string;

    created_at: string;
    updated_at: string;
    resolved_at: string | null;

    created_by: string;
    assigned_to: string | null;

    comments: TicketComment[];
    files: TicketAttachment[];
}

export interface CreateTicketRequest {
    title: string;
    description: string;
    module: ModuleChoices;
}

export interface CreateCommentRequest{
    content: string;
}

export interface CreateAttachmentRequest{
    file: File;
}

export interface UpdateTicketContentRequest {
    title?: string;
    description?: string;
    module?: ModuleChoices;
}

export interface UpdateTicketSupportRequest {
    status?: StatusChoices;
    assigned_to?: number | string | null;
}