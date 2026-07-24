export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface HttpRequestConfig<TBody = unknown> {
    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
    data?: TBody;
}

export interface ApiResponse<TData = void> {
    data: TData;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}