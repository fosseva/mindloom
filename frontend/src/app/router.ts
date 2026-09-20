export type Screen = 'dashboard' | 'decks' | 'learn' | 'profile';

export function authenticatedScreenFromPath(): Screen {
    const path = window.location.pathname.replace(/^\//, '');
    return path === 'decks' || path === 'learn' || path === 'profile' ? path : 'dashboard';
}

export function replacePath(path: '/login' | '/dashboard'): void {
    if (window.location.pathname !== path) {
        window.history.replaceState({}, '', path);
    }
}

export function pushScreen(screen: Screen): void {
    window.history.pushState({}, '', `/${screen}`);
}
