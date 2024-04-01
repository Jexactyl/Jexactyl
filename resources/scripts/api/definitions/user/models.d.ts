import { Model, UUID } from '@/api/definitions';
import { SubuserPermission } from '@/state/server/subusers';

interface User extends Model {
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
    publicKey: string;
    fingerprint: string;
    createdAt: Date;
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

interface ActivityLog extends Model<'actor'> {
    id: string;
    batch: UUID | null;
    event: string;
    ip: string | null;
    isApi: boolean;
    description: string | null;
    properties: Record<string, string | unknown>;
    hasAdditionalMetadata: boolean;
    timestamp: Date;
    relationships: {
        actor: User | null;
    };
}
