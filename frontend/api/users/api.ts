import { request } from "../../core/https.js";
import type { HttpRequestConfig, ApiResponse } from "../../shared/types/httpTypes.js";

import type {
    CurrentUser,
    LoginRequest,
} from "./types.js";

const BASE_URL = 'api/users/me/';

export async function getCurrentUser(): Promise<ApiResponse<CurrentUser>> {
    const config: HttpRequestConfig = {
        url: BASE_URL,
        method: 'GET',
    }

    return request<CurrentUser>(config);
}