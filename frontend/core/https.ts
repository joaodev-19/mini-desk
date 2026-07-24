import type { ApiResponse, HttpRequestConfig } from "../shared/types/httpTypes.js";

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2] ?? '') : null;
}

function buildUrl(baseUrl: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(baseUrl, window.location.origin);

    if (!params || Object.keys(params).length === 0){
        return url.toString();
    }
    
    const stringParams = Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
    }, {} as Record<string, string>);

    url.search = new URLSearchParams(stringParams).toString();
    return url.toString();
}

function convertHeaders(headers: Headers): Record<string, string>{
    const result: Record<string, string> = {};

    headers.forEach((value, key) => {
        result[key] = value;
    });

    return result;
}

export async function request<TData, TBody = unknown>(
    config: HttpRequestConfig<TBody>
): Promise<ApiResponse<TData>> {
    const {
        url, method, headers, params, data
    } = config;

    const finalUrl = buildUrl(url, params);

    const requestHeaders: Record<string, string> = {
        Accept: "application/json",
        ...headers,
    };

    const requiresCSRF =
        method === "POST" 
        || method === "PUT" 
        || method === "PATCH" 
        || method === "DELETE";

    if (requiresCSRF) {
        const csrfToken = getCookie('csrftoken');

        if (!csrfToken) {
            throw new Error("Token CSRF was not found. Aborting for security.");
        }
        requestHeaders["X-CSRFToken"] = csrfToken;
    }

    if (method === "GET" && data !== undefined) {
        throw new Error(
            "Get requests shouldn't have a body. Use params."
        );
    }

    let requestBody: BodyInit | undefined;

    if (data instanceof FormData) {
        requestBody = data;
    } else if (data !== undefined) {
        requestBody = JSON.stringify(data);
        requestHeaders["Content-Type"] = "application/json";
    }

    const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        credentials: "same-origin",
    }

    if (requestBody !== undefined) {
        requestOptions.body = requestBody;
    }


    try {
        const response = await fetch(
            finalUrl, requestOptions
        )

        if (!response.ok) {
            throw new Error(`HTTP error status: ${response.status}`);
        }

        if (response.status === 204) {
            return {
                data: null as TData,
                status: response.status,
                statusText: response.statusText,
                headers: convertHeaders(response.headers),
            }
        }

        const responseData = await response.json() as TData;

        return {
            data: responseData,
            status: response.status,
            statusText: response.statusText,
            headers: convertHeaders(response.headers),
        }
    } catch (error) {
        console.error('Request failed:', error instanceof Error ? error.message: error);
        throw error;
    }
}