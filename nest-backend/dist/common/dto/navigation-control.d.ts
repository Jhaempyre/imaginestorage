export declare class NavigationControlDto {
    route: string;
    type: 'push' | 'replace';
    reason?: string;
    params?: Record<string, any>;
    state?: Record<string, any>;
}
