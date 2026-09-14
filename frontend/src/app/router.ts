export type Screen = 'dashboard' | 'decks' | 'learn';

export function authenticatedScreenFromPath(): Screen {
    const path = window.location.pathname.replace(/^\//, '');
    return path === 'decks' || path === 'learn' ? path : 'dashboard';
}

export function replacePath(path: '/login' | '/dashboard'): void {
    if (window.location.pathname !== path) {
        window.history.replaceState({}, '', path);
    }
}

export function pushScreen(screen: Screen): void {
    window.history.pushState({}, '', `/${screen}`);
}
