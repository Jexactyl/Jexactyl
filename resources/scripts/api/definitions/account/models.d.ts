import { Model, UUID } from '@definitions';
import { SubuserPermission } from '@/state/server/subusers';

interface User extends Model {
    id?: number;
    uuid: string;
    username: string;
    email: string;
    image: string;
    twoFactorEnabled: boolean;
    createdAt: Date;
    permissions: SubuserPermission[];
    can(permission: SubuserPermission): boolean;
}

interface SSHKey extends Model {
    name: string;
    public_key: string;
    fingerprint: string;
    created_at: Date;
}

interface Passkey extends Model {
    uuid: string;
    name: string;
    lastUsedAt: Date | null;
    createdAt: Date;
}

interface ApiKey extends Model {
    id?: number;
    identifier: string;
    description: string;
    allowedIps: string[];
    createdAt: Date | null;
    lastUsedAt: Date | null;
}

interface Ticket extends Model {
    id: number;
    title: string;
    status: 'resolved' | 'unresolved' | 'pending' | 'in-progress';
    createdAt: Date;
    updatedAt: Date | null;
    relationships: {
        messages: TicketMessage[] | null;
    };
}

interface TicketMessage extends Model {
    id: number;
    message: string;
    author: User;
    createdAt: Date;
    updatedAt?: Date | null;
}

interface ActivityLogSubject {
    type: string;
    id: number;
    identifier: string | null;
}

interface ActivityLog extends Model<'actor'> {
    id: string;
    logId: number | null;
    batch: UUID | null;
    event: string;
    ip: string | null;
    isApi: boolean;
    description: string | null;
    properties: Record<string, string | unknown>;
    hasAdditionalMetadata: boolean;
    subjects: ActivityLogSubject[];
    timestamp: Date;
    relationships: {
        actor: User | null;
    };
}
