import { request } from "../../core/https.js";
const BASE_URL = 'api/users/me/';
export async function getCurrentUser() {
    const config = {
        url: BASE_URL,
        method: 'GET',
    };
    return request(config);
}
//# sourceMappingURL=api.js.map