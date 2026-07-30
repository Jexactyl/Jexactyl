import { ModelWithRelationships, Model, UUID } from '@definitions';
import { OrderType } from '@/api/routes/account/billing/orders/types';
import { type Database } from '@definitions/server';

type BillingExceptionType = 'payment' | 'deployment' | 'storefront';
type OrderStatus = 'pending' | 'expired' | 'failed' | 'processed';
export type DiscountCodeType = 'percentage' | 'numeric';

interface NodePorts {
    http: {
        listen: number;
        public: number;
    };
    sftp: {
        listen: number;
        public: number;
    };
}

export interface Allocation extends Model {
    id: number;
    ip: string;
    port: number;
    alias: string | null;
    isAssigned: boolean;
    relationships: {
        node?: Node;
        server?: Server | null;
    };
    getDisplayText(): string;
}

export interface Node extends Model {
    id: number;
    uuid: UUID;
    isPublic: boolean;
    databaseHostId: number;
    name: string;
    description: string | null;
    fqdn: string;
    ports: NodePorts;
    scheme: 'http' | 'https';
    isBehindProxy: boolean;
    isMaintenanceMode: boolean;
    memory: number;
    memoryOverallocate: number;
    disk: number;
    diskOverallocate: number;
    uploadSize: number;
    daemonBase: string;
    createdAt: Date;
    updatedAt: Date;
    relationships: Record<string, unknown>;
}

/**
 * Legacy "list/detail" representation of a node, as returned by the node
 * management list and single-node fetch endpoints. Distinct from `Node`,
 * which is the representation embedded in server relationships.
 */
export interface NodeEntry {
    id: number;
    uuid: string;
    public: boolean;
    name: string;
    description: string | null;
    databaseHostId: number | null;
    fqdn: string;
    listenPortHTTP: number;
    publicPortHTTP: number;
    listenPortSFTP: number;
    publicPortSFTP: number;
    scheme: string;
    behindProxy: boolean;
    maintenanceMode: boolean;
    memory: number;
    memoryOverallocate: number;
    disk: number;
    diskOverallocate: number;
    uploadSize: number;
    daemonBase: string;
    deployable: boolean;
    deployableFree: boolean;
    createdAt: Date;
    updatedAt: Date;

    memoryUsedPercent?: number;
    diskUsedPercent?: number;
    allocationsUsedPercent?: number;

    relations: {
        databaseHost: DatabaseEntry | undefined;
    };
}

/**
 * Legacy "list/detail" representation of an allocation, as returned by the
 * node allocation management endpoints. Distinct from `Allocation`.
 */
export interface AllocationEntry {
    id: number;
    ip: string;
    port: number;
    alias: string | null;
    serverId: number | null;
    assigned: boolean;

    relations: {
        server?: ServerEntry;
    };

    getDisplayText(): string;
}

interface ServerLimits {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
    threads: string | null;
    oomKiller: boolean;
}

export interface ServerVariable extends EggVariable {
    serverValue: string;
}

/**
 * Defines a single server instance that is returned from the Panel's admin
 * API endpoints.
 */
export interface Server extends Model {
    id: number;
    uuid: UUID;
    externalId: string | null;
    identifier: string;
    name: string;
    description: string;
    status: string;
    ownerId: number;
    nodeId: number;
    allocationId: number;
    eggId: number;
    nestId: number;
    limits: ServerLimits;
    featureLimits: {
        databases: number;
        allocations: number;
        backups: number;
        subusers: number;
    };
    container: {
        startup: string | null;
        image: string;
        environment: Record<string, string>;
    };
    renewalDate?: Date | undefined;
    billingProductId?: number;
    createdAt: Date;
    updatedAt: Date;
    relationships: {
        allocations?: Allocation[];
        nest?: Nest;
        egg?: Egg;
        node?: Node;
        user?: User;
        variables?: ServerVariable[];
        databases?: Database[];
        product?: Product;
    };
}

export interface Egg extends Model {
    id: number;
    uuid: UUID;
    nestId: number;
    author: string;
    name: string;
    description: string | null;
    features: string[] | null;
    dockerImages: Record<string, string>;
    configFiles: Record<string, any> | null;
    configStartup: Record<string, any> | null;
    configStop: string | null;
    configFrom: number | null;
    startup: string;
    scriptContainer: string;
    copyScriptFrom: number | null;
    scriptEntry: string;
    scriptIsPrivileged: boolean;
    scriptInstall: string | null;
    createdAt: Date;
    updatedAt: Date;
    relationships: {
        nest?: Nest;
        variables?: EggVariable[];
    };
}

export interface EggVariable extends Model {
    id: number;
    eggId: number;
    name: string;
    description: string;
    environmentVariable: string;
    defaultValue: string;
    isUserViewable: boolean;
    isUserEditable: boolean;
    // isRequired: boolean;
    rules: string;
    createdAt: Date;
    updatedAt: Date;
    relationships: Record<string, unknown>;
}

export interface Nest extends Model {
    id: number;
    uuid: UUID;
    author: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    relationships: {
        eggs?: Egg[];
    };
}

export interface WebhookEvent {
    id: number;
    key: string;
    description: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt?: Date | null;
}

export interface CustomLink {
    id: number;
    name: string;
    url: string;
    visible: boolean;
    createdAt: Date;
    updatedAt?: Date | null;
}

/**
 * Legacy "list/detail" representation of a server, as returned by the server
 * management list and single-server fetch endpoints. Distinct from `Server`.
 */
export interface ServerEntry {
    id: number;
    externalId: string | null;
    uuid: string;
    identifier: string;
    name: string;
    description: string;
    status: string;

    limits: {
        memory: number;
        swap: number;
        disk: number;
        io: number;
        cpu: number;
        threads: string | null;
        oomKiller: boolean;
    };

    featureLimits: {
        databases: number;
        allocations: number;
        backups: number;
        subusers: number;
    };

    ownerId: number;
    nodeId: number;
    allocationId: number;
    nestId: number;
    eggId: number;

    container: {
        startup: string;
        image: string;
        environment: Map<string, string>;
    };

    createdAt: Date;
    updatedAt: Date;

    relations: {
        allocations?: AllocationEntry[];
        egg?: EggEntry;
        node?: NodeEntry;
        user?: User;
        variables: ServerVariableEntry[];
    };
}

export interface ServerVariableEntry {
    id: number;
    eggId: number;
    name: string;
    description: string;
    envVariable: string;
    defaultValue: string;
    userViewable: boolean;
    userEditable: boolean;
    rules: string;
    required: boolean;
    serverValue: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Legacy "list/detail" representation of an egg, as returned by the egg
 * management endpoints. Distinct from `Egg`.
 */
export interface EggEntry {
    id: number;
    uuid: string;
    nestId: number;
    author: string;
    name: string;
    description: string | null;
    features: string[] | null;
    dockerImages: Record<string, string>;
    configFiles: Record<string, any> | null;
    configStartup: Record<string, any> | null;
    configStop: string | null;
    startup: string;
    scriptContainer: string;
    scriptEntry: string;
    scriptInstall: string | null;
    createdAt: Date;
    updatedAt: Date;
    configFrom?: number | null;
    copyScriptFrom?: number | null;
    scriptIsPrivileged?: boolean;

    relations: {
        nest?: NestEntry;
        servers?: ServerEntry[];
        variables?: EggVariableEntry[];
    };
}

export interface EggVariableEntry {
    id: number;
    eggId: number;
    name: string;
    description: string;
    envVariable: string;
    defaultValue: string;
    userViewable: boolean;
    userEditable: boolean;
    rules: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Legacy "list/detail" representation of a nest, as returned by the nest
 * management endpoints. Distinct from `Nest`.
 */
export interface NestEntry {
    id: number;
    uuid: string;
    author: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;

    relations: {
        eggs: EggEntry[] | undefined;
    };
}

/**
 * Legacy "list/detail" representation of a database host, as returned by the
 * database host management endpoints.
 */
export interface DatabaseEntry {
    id: number;
    name: string;
    host: string;
    port: number;
    username: string;
    maxDatabases: number;
    createdAt: Date;
    updatedAt: Date;

    getAddress(): string;
}

/**
 * Legacy "list/detail" representation of a mount, as returned by the mount
 * management endpoints.
 */
export interface MountEntry {
    id: number;
    uuid: string;
    name: string;
    description?: string;
    source: string;
    target: string;
    readOnly: boolean;
    userMountable: boolean;
    createdAt: Date;
    updatedAt: Date;

    relations: {
        eggs: EggEntry[] | undefined;
        nodes: NodeEntry[] | undefined;
        servers: ServerEntry[] | undefined;
    };
}

export interface User extends ModelWithRelationships {
    id: number;
    uuid: UUID;
    externalId: string;
    username: string;
    email: string;
    language: string;
    admin_role_id: number | null;
    roleName: string;
    isRootAdmin: boolean;
    isUsingTwoFactor: boolean;
    avatarUrl: string;
    state: string;
    createdAt: Date;
    updatedAt: Date;
    relationships: {
        role: UserRole | null;
        // TODO: just use an API call, this is probably a bad idea for performance.
        servers?: Server[];
    };
}

interface UserRole extends ModelWithRelationships {
    id: number;
    name: string;
    description: string;
    color?: string | null;
    permissions: string[];
}

interface ApiKeyPermission extends Model {
    r_allocations: string;
    r_database_hosts: string;
    r_eggs: string;
    r_locations: string;
    r_nests: string;
    r_nodes: string;
    r_server_databases: string;
    r_servers: string;
    r_users: string;
}

interface ApiKey extends Model {
    id?: number;
    identifier: string;
    description: string;
    allowed_ips: string[];
    created_at: Date | null;
    last_used_at: Date | null;
}

interface BillingException extends Model {
    id: number;
    uuid: string;
    exception_type: BillingExceptionType;
    order_id?: number;
    title: string;
    description: string;
    created_at: Date;
    updated_at?: Date | null;
}

interface Ticket extends Model {
    id: number;
    title: string;
    user: User;
    assigned_to?: User | undefined;
    status: TicketStatus;
    created_at: Date;
    updated_at?: Date | null;
    relationships: {
        messages?: TicketMessage[];
    };
}

interface TicketMessage extends Model {
    id: number;
    message: string;
    author: User;
    created_at: Date;
    updated_at?: Date | null;
}

interface BillingAnalytics extends Model {
    orders: Order[];
    products: Product[];
    categories: Category[];
}

interface Order extends Model {
    id: number;
    name: string;
    user_id: number;
    description: string;
    total: number;
    status: OrderStatus;
    product_id: number;
    type: OrderType;
    threat_index: number;
    created_at: Date;
    updated_at?: Date | null;
}

interface DiscountCode extends Model {
    id: number;
    code: string;
    description: string;
    type: DiscountCodeType;
    value: number;
    uses?: number | null;
    expires_at?: Date | null;
    active: boolean;
    created_at: Date;
    updated_at?: Date | null;
}

interface Product extends Model {
    id: number;
    uuid: string;
    categoryId: number;
    categoryUuid: string;

    name: string;
    icon?: string;
    price: number;
    description: string;

    limits: {
        cpu: number;
        memory: number;
        disk: number;
        backup: number;
        database: number;
        allocation: number;
    };

    createdAt: Date;
    updatedAt?: Date | null;

    relationships: {
        category?: Category;
    };
}

interface Category extends Model {
    id: number;
    uuid: string;
    name: string;
    icon: string;
    description: string;
    visible: boolean;
    nestId: number;
    eggId: number | null;

    createdAt: Date;
    updatedAt?: Date | null;

    relationships: {
        products?: Product[];
    };
}

interface AdminRolePermission extends Model {
    key: string;
    description: string;
}

interface ServerPreset extends Model {
    id: number;
    name: string;
    description: string;

    cpu: number;
    memory: number;
    disk: number;
    nest_id?: number;
    egg_id?: number;

    created_at: Date;
    updated_at?: Date | null;
}
