import { afterEach, expect, it } from 'vitest';
import { authenticatedScreenFromPath, pushScreen } from './router';

afterEach(() => window.history.replaceState({}, '', '/'));

it('recognizes learn as an authenticated screen', () => {
    window.history.replaceState({}, '', '/learn');

    expect(authenticatedScreenFromPath()).toBe('learn');
});

it('navigates the learning screen to the learn path', () => {
    pushScreen('learn');

    expect(window.location.pathname).toBe('/learn');
});

it('does not retain the former practice path', () => {
    window.history.replaceState({}, '', '/practice');

    expect(authenticatedScreenFromPath()).toBe('dashboard');
});
