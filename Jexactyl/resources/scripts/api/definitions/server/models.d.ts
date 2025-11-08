import { Model } from '@definitions';
import { type SubuserPermission } from '@/state/server/subusers';
import { ServerStatus } from '@/api/routes/server';

interface Server {
    id: string;
    internalId: number | string;
    uuid: string;
    groupId?: number | null;
    name: string;
    node: string;
    isNodeUnderMaintenance: boolean;
    status: ServerStatus;
    sftpDetails: {
        ip: string;
        port: number;
    };
    invocation: string;
    dockerImage: string;
    description: string | null;
    limits: {
        memory: number;
        swap: number;
        disk: number;
        io: number;
        cpu: number;
        threads: string;
    };
    eggFeatures: string[];
    billingProductId?: number;
    renewalDate?: Date | undefined;
    featureLimits: {
        databases: number;
        allocations: number;
        backups: number;
        subusers: number;
    };
    isTransferring: boolean;
    variables: EggVariable[];
    allocations: Allocation[];
}

interface ServerStats extends Model {
    status: ServerPowerState;
    isSuspended: boolean;
    memoryUsageInBytes: number;
    cpuUsagePercent: number;
    diskUsageInBytes: number;
    networkRxInBytes: number;
    networkTxInBytes: number;
    uptime: number;
}

export type ServerPowerState = 'offline' | 'starting' | 'running' | 'stopping';

interface Backup extends Model {
    uuid: string;
    isSuccessful: boolean;
    isLocked: boolean;
    name: string;
    ignoredFiles: string;
    checksum: string;
    bytes: number;
    createdAt: Date;
    completedAt: Date | null;
}

interface ServerGroup extends Model {
    id: number;
    name: string;
    color?: string;
}

interface EggVariable extends Model {
    name: string;
    description: string;
    envVariable: string;
    defaultValue: string;
    serverValue: string | null;
    isEditable: boolean;
    rules: string[];
}

interface Database extends Model {
    id: string;
    name: string;
    username: string;
    databaseHostId: number;
    connectionString: string;
    allowConnectionsFrom: string;
    password?: string;
}

interface Subuser extends Model {
    uuid: string;
    username: string;
    email: string;
    image: string;
    twoFactorEnabled: boolean;
    createdAt: Date;
    permissions: SubuserPermission[];

    can(permission: SubuserPermission): boolean;
}

interface Allocation extends Model {
    id: number;
    ip: string;
    alias: string | null;
    port: number;
    notes: string | null;
    isDefault: boolean;
}

interface FileObject extends Model {
    key: string;
    name: string;
    mode: string;
    modeBits: string;
    size: number;
    isFile: boolean;
    isSymlink: boolean;
    mimetype: string;
    createdAt: Date;
    modifiedAt: Date;
    isArchiveType: () => boolean;
    isEditable: () => boolean;
}

interface Schedule extends Model {
    id: number;
    name: string;
    cron: {
        dayOfWeek: string;
        month: string;
        dayOfMonth: string;
        hour: string;
        minute: string;
    };
    isActive: boolean;
    isProcessing: boolean;
    onlyWhenOnline: boolean;
    lastRunAt: Date | null;
    nextRunAt: Date | null;
    createdAt: Date;
    updatedAt: Date;

    tasks: Task[];
}

interface Task extends Model {
    id: number;
    sequenceId: number;
    action: string;
    payload: string;
    timeOffset: number;
    isQueued: boolean;
    continueOnFailure: boolean;
    createdAt: Date;
    updatedAt: Date;
}
