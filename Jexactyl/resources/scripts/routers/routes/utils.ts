import type { ComponentType, ElementType } from 'react';

export interface RouteDefinition {
    route: string;
    path: string;
    name?: string;
    component: ComponentType;
    end?: boolean;
    icon?: ElementType;
    condition?: Condition;
}

export interface ServerRouteDefinition extends RouteDefinition {
    category?: 'general' | 'data' | 'configuration' | null;
    permission?: string | string[];
}

export interface AdminRouteDefinition extends RouteDefinition {
    category?: 'general' | 'modules' | 'appearance' | 'management' | 'services';
    advanced?: boolean;
}

export const normalize = (route: string): string => route.replace(/[:*].*$/, '').replace(/\/+$/, '');

type Condition<T = any> = (flags: T) => boolean;

export function route<T extends ComponentType>(
    route: string,
    component: T,
    opts: Partial<RouteDefinition | ServerRouteDefinition | AdminRouteDefinition> = {},
): RouteDefinition {
    return {
        route,
        path: opts.path ?? normalize(route),
        component,
        ...opts,
    };
}
