export type RoleOptions = 'clients' | 'support';

export interface CurrentUser {
    'id': number,

    'username': string,
    'first_name': string,
    'last_name': string,
    'full_name': string,
    
    'email': string,

    'role': RoleOptions,
    'role_display': string,
}

export interface LoginRequest {
    'username': string,
    'password': string,
}