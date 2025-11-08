import type { StyledComponent } from 'styled-components';

/**
 * Given a valid six character HEX color code, converts it into its associated
 * RGBA value with a user controllable alpha channel.
 */
function hexToRgba(hex: string, alpha = 1): string {
    // noinspection RegExpSimplifiable
    if (!/#?([a-fA-F0-9]{2}){3}/.test(hex)) {
        return hex;
    }

    // noinspection RegExpSimplifiable
    const [r, g, b] = hex.match(/[a-fA-F0-9]{2}/g)!.map(v => parseInt(v, 16));

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const randomInt = (low: number, high: number) => Math.floor(Math.random() * (high - low) + low);

const cleanDirectoryPath = (path: string) => path.replace(/(\/(\/*))|(^$)/g, '/');

/**
 * URL-encodes the segments of a path.
 * This allows to use the path as part of a URL while preserving the slashes.
 * @param path the path to encode
 */
function encodePathSegments(path: string): string {
    return path
        .split('/')
        .map(s => encodeURIComponent(s))
        .join('/');
}

function hashToPath(hash: string): string {
    return hash.length > 0 ? decodeURIComponent(hash.substring(1)) : '/';
}

const withSubComponents = <C extends StyledComponent<any, any>, P extends Record<string, any>>(
    component: C,
    properties: P,
): C & P => {
    Object.keys(properties).forEach((key: keyof P) => {
        (component as any)[key] = properties[key];
    });

    return component as C & P;
};

export { hexToRgba, randomInt, cleanDirectoryPath, encodePathSegments, hashToPath, withSubComponents };
