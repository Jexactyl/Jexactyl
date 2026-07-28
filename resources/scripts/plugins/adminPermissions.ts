export function hasAdminPermission(userPermissions: string[], required?: string | string[]): boolean {
    if (!required) return true;
    if (userPermissions[0] === '*') return true;

    return (Array.isArray(required) ? required : [required]).some(
        permission =>
            // Allows checking for any permission matching a name, for example users.*
            // will return if the user has any permission under the users.XYZ namespace.
            (permission.endsWith('.*') && userPermissions.some(p => p.startsWith(permission.split('.')?.[0] ?? ''))) ||
            // Otherwise just check if the entire permission exists in the array or not.
            userPermissions.indexOf(permission) >= 0,
    );
}
