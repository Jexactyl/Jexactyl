/* eslint-disable camelcase */
import { FractalResponseData, FractalResponseList } from '@/api/http';
import * as Models from '@definitions/admin/models';
import {
    Allocation,
    AllocationEntry,
    CustomLink,
    Node,
    NodeEntry,
    Server,
    ServerEntry,
    ServerVariable,
    ServerVariableEntry,
    Egg,
    EggEntry,
    EggVariable,
    EggVariableEntry,
    Nest,
    NestEntry,
    DatabaseEntry,
    MountEntry,
    WebhookEvent,
} from '@definitions/admin/models';
import { type Database } from '@definitions/server';

const isList = (data: FractalResponseList | FractalResponseData): data is FractalResponseList => data.object === 'list';

function transform<T, M = undefined>(
    data: undefined,
    transformer: (callback: FractalResponseData) => T,
    missing?: M,
): undefined;
function transform<T, M>(
    data: FractalResponseData | undefined,
    transformer: (callback: FractalResponseData) => T,
    missing?: M,
): T | M | undefined;
function transform<T, M>(
    data: FractalResponseList | undefined,
    transformer: (callback: FractalResponseData) => T,
    missing?: M,
): T[] | undefined;
function transform<T>(
    data: FractalResponseData | FractalResponseList | undefined,
    transformer: (callback: FractalResponseData) => T,
    missing = undefined,
) {
    if (data === undefined) return undefined;

    if (isList(data)) {
        return data.data.map(transformer);
    }

    return !data ? missing : transformer(data);
}

export default class Transformers {
    static toServer = ({ attributes }: FractalResponseData): Server => {
        const { oom_killer, ...limits } = attributes.limits;
        const { allocations, egg, nest, node, user, variables, databases, product } = attributes.relationships || {};

        return {
            id: attributes.id,
            uuid: attributes.uuid,
            externalId: attributes.external_id,
            identifier: attributes.identifier,
            name: attributes.name,
            description: attributes.description,
            status: attributes.status,
            ownerId: attributes.owner_id,
            nodeId: attributes.node_id,
            allocationId: attributes.allocation_id,
            eggId: attributes.egg_id,
            nestId: attributes.nest_id,
            limits: { ...limits, oomKiller: oom_killer },
            featureLimits: attributes.feature_limits,
            container: attributes.container,
            renewalDate: attributes.renewal_date ? new Date(attributes.renewal_date) : undefined,
            billingProductId: attributes.billing_product_id,
            createdAt: new Date(attributes.created_at),
            updatedAt: new Date(attributes.updated_at),
            relationships: {
                allocations: transform(allocations as FractalResponseList | undefined, this.toAllocation),
                nest: transform(nest as FractalResponseData | undefined, this.toNest),
                egg: transform(egg as FractalResponseData | undefined, this.toEgg),
                node: transform(node as FractalResponseData | undefined, this.toNode),
                user: transform(user as FractalResponseData | undefined, this.toUser),
                variables: transform(variables as FractalResponseList | undefined, this.toServerEggVariable),
                databases: transform(databases as FractalResponseList | undefined, this.toServerDatabase),
                product:
                    product && product.object !== 'null_resource'
                        ? transform(product as FractalResponseData | undefined, this.toProduct)
                        : undefined,
            },
        };
    };

    static toNode = ({ attributes }: FractalResponseData): Node => {
        return {
            id: attributes.id,
            uuid: attributes.uuid,
            isPublic: attributes.public,
            databaseHostId: attributes.database_host_id,
            name: attributes.name,
            description: attributes.description,
            fqdn: attributes.fqdn,
            sftpAlias: attributes.sftp_alias,
            ports: {
                http: {
                    public: attributes.publicPortHttp,
                    listen: attributes.listenPortHttp,
                },
                sftp: {
                    public: attributes.publicPortSftp,
                    listen: attributes.listenPortSftp,
                },
            },
            scheme: attributes.scheme,
            isBehindProxy: attributes.behindProxy,
            isMaintenanceMode: attributes.maintenance_mode,
            memory: attributes.memory,
            memoryOverallocate: attributes.memory_overallocate,
            disk: attributes.disk,
            diskOverallocate: attributes.disk_overallocate,
            uploadSize: attributes.upload_size,
            daemonBase: attributes.daemonBase,
            createdAt: new Date(attributes.created_at),
            updatedAt: new Date(attributes.updated_at),
            relationships: {},
        };
    };

    static toUserRole = ({ attributes }: FractalResponseData): Models.UserRole => ({
        id: attributes.id,
        name: attributes.name,
        description: attributes.description,
        permissions: attributes.permissions,
        color: attributes.color,
    });

    static toAdminRolePermission = ({ attributes }: FractalResponseData): Models.AdminRolePermission => ({
        key: attributes.key,
        description: attributes.description,
    });

    static toApiKey = ({ attributes }: FractalResponseData): Models.ApiKey => ({
        id: attributes.id,
        identifier: attributes.identifier,
        description: attributes.description,
        allowed_ips: attributes.allowed_ips,
        created_at: new Date(attributes.created_at),
        last_used_at: new Date(attributes.last_used_at),
    });

    static toTicket = ({ attributes }: FractalResponseData): Models.Ticket => ({
        id: attributes.id,
        title: attributes.title,
        status: attributes.status,
        user: attributes.user,
        assigned_to: attributes.assigned_to,
        created_at: new Date(attributes.created_at),
        updated_at: attributes.updated_at ? new Date(attributes.updated_at) : null,
        relationships: {
            messages: transform(attributes.relationships?.messages as FractalResponseList, this.toTicketMessage),
        },
    });

    static toTicketMessage = ({ attributes }: FractalResponseData): Models.TicketMessage => ({
        id: attributes.id,
        message: attributes.message,
        author: attributes.author,
        created_at: new Date(attributes.created_at),
        updated_at: attributes.updated_at ? new Date(attributes.updated_at) : null,
    });

    static toOrder = ({ attributes: data }: FractalResponseData): Models.Order => ({
        id: data.id,
        name: data.name,
        user_id: data.user_id,
        description: data.description,
        total: data.total,
        status: data.status,
        product_id: data.product_id,
        type: data.type,
        threat_index: data.threat_index,
        created_at: new Date(data.created_at),
        updated_at: data.updated_at ? new Date(data.updated_at) : null,
    });

    static toProduct = ({ attributes }: FractalResponseData): Models.Product => ({
        id: attributes.id,
        uuid: attributes.uuid,
        categoryId: attributes.category_id,
        categoryUuid: attributes.category_uuid,
        name: attributes.name,
        icon: attributes.icon,
        price: attributes.price,
        description: attributes.description,

        limits: {
            cpu: attributes.limits.cpu,
            memory: attributes.limits.memory,
            disk: attributes.limits.disk,
            backup: attributes.limits.backup,
            database: attributes.limits.database,
            allocation: attributes.limits.allocation,
        },

        createdAt: new Date(attributes.created_at),
        updatedAt: new Date(attributes.updated_at),

        relationships: {
            category:
                attributes.relationships?.category?.object === 'category'
                    ? this.toCategory(attributes.relationships.category as FractalResponseData)
                    : undefined,
        },
    });

    static toCategory = ({ attributes }: FractalResponseData): Models.Category =>
        ({
            id: attributes.id,
            uuid: attributes.uuid,
            name: attributes.name,
            icon: attributes.icon,
            description: attributes.description,
            visible: attributes.visible,
            nestId: attributes.nest_id,
            eggId: attributes.egg_id,

            createdAt: new Date(attributes.created_at),
            updatedAt: new Date(attributes.updated_at),

            relationships: {
                products: ((attributes.relationships?.products as FractalResponseList | undefined)?.data || []).map(
                    Transformers.toProduct,
                ),
            },
        } as Models.Category);

    static toUser = ({ attributes }: FractalResponseData): Models.User => {
        return {
            id: attributes.id,
            uuid: attributes.uuid,
            externalId: attributes.external_id,
            username: attributes.username,
            email: attributes.email,
            language: attributes.language,
            admin_role_id: attributes.admin_role_id || null,
            roleName: attributes.role_name,
            state: attributes.state || null,
            isRootAdmin: attributes.root_admin,
            isUsingTwoFactor: attributes['2fa'] || false,
            avatarUrl: attributes.avatar_url,
            createdAt: new Date(attributes.created_at),
            updatedAt: new Date(attributes.updated_at),
            relationships: {
                role: transform(attributes.relationships?.role as FractalResponseData, this.toUserRole) || null,
            },
        };
    };

    static toEgg = ({ attributes }: FractalResponseData): Egg => ({
        id: attributes.id,
        uuid: attributes.uuid,
        nestId: attributes.nest_id,
        author: attributes.author,
        name: attributes.name,
        description: attributes.description,
        features: attributes.features,
        dockerImages: attributes.docker_images,
        configFiles: attributes.config?.files,
        configStartup: attributes.config?.startup,
        configStop: attributes.config?.stop,
        configFrom: attributes.config?.extends,
        startup: attributes.startup,
        copyScriptFrom: attributes.copy_script_from,
        scriptContainer: attributes.script?.container,
        scriptEntry: attributes.script?.entry,
        scriptIsPrivileged: attributes.script?.privileged,
        scriptInstall: attributes.script?.install,
        createdAt: new Date(attributes.created_at),
        updatedAt: new Date(attributes.updated_at),
        relationships: {
            nest: transform(attributes.relationships?.nest as FractalResponseData, this.toNest),
            variables: transform(attributes.relationships?.variables as FractalResponseList, this.toEggVariable),
        },
    });

    static toEggVariable = ({ attributes }: FractalResponseData): EggVariable => ({
        id: attributes.id,
        eggId: attributes.egg_id,
        name: attributes.name,
        description: attributes.description,
        environmentVariable: attributes.env_variable,
        defaultValue: attributes.default_value,
        isUserViewable: attributes.user_viewable,
        isUserEditable: attributes.user_editable,
        // isRequired: attributes.required,
        rules: attributes.rules,
        createdAt: new Date(attributes.created_at),
        updatedAt: new Date(attributes.updated_at),
        relationships: {},
    });

    static toServerEggVariable = (data: FractalResponseData): ServerVariable => ({
        ...this.toEggVariable(data),
        serverValue: data.attributes.server_value,
    });

    static toAllocation = ({ attributes }: FractalResponseData): Allocation => ({
        id: attributes.id,
        ip: attributes.ip,
        port: attributes.port,
        alias: attributes.alias || null,
        isAssigned: attributes.assigned,
        relationships: {
            node: transform(attributes.relationships?.node as FractalResponseData, this.toNode),
            server: transform(attributes.relationships?.server as FractalResponseData, this.toServer),
        },
        getDisplayText(): string {
            const raw = `${this.ip}:${this.port}`;

            return !this.alias ? raw : `${this.alias} (${raw})`;
        },
    });

    static toNest = ({ attributes }: FractalResponseData): Nest => ({
        id: attributes.id,
        uuid: attributes.uuid,
        author: attributes.author,
        name: attributes.name,
        description: attributes.description,
        createdAt: new Date(attributes.created_at),
        updatedAt: new Date(attributes.updated_at),
        relationships: {
            eggs: transform(attributes.relationships?.eggs as FractalResponseList, this.toEgg),
        },
    });

    static toServerDatabase = ({ attributes }: FractalResponseData): Database => ({
        id: attributes.id,
        name: attributes.name,
        databaseHostId: attributes.database_host_id,
        username: attributes.username,
        connectionString: attributes.remote,
        allowConnectionsFrom: '',
    });

    static toBillingException = ({ attributes }: FractalResponseData): Models.BillingException => ({
        id: attributes.id,
        uuid: attributes.uuid,
        description: attributes.description,
        title: attributes.title,
        exception_type: attributes.exception_type,
        created_at: new Date(attributes.created_at),
        updated_at: new Date(attributes.last_used_at),
    });

    static toDiscountCode = ({ attributes }: FractalResponseData): Models.DiscountCode => ({
        id: attributes.id,
        code: attributes.code,
        description: attributes.description,
        type: attributes.type,
        value: attributes.value,
        uses: attributes.uses,
        active: attributes.active,
        expires_at: attributes.expires_at ? new Date(attributes.expires_at) : null,
        created_at: new Date(attributes.created_at),
        updated_at: attributes.updated_at ? new Date(attributes.updated_at) : null,
    });

    static toWebhookEvent = ({ attributes }: FractalResponseData): WebhookEvent => ({
        id: attributes.id,
        key: attributes.key,
        description: attributes.description,
        enabled: attributes.enabled,
        createdAt: new Date(attributes.created_at),
        updatedAt: attributes.updated_at ? new Date(attributes.updated_at) : null,
    });

    static toCustomLink = ({ attributes: data }: FractalResponseData): CustomLink => ({
        id: data.id,
        name: data.name,
        url: data.url,
        visible: data.visible,
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : null,
    });

    static toServerPreset = ({ attributes }: FractalResponseData): Models.ServerPreset => ({
        id: attributes.id,
        name: attributes.name,
        description: attributes.description,

        cpu: attributes.cpu,
        memory: attributes.memory,
        disk: attributes.disk,

        nest_id: attributes.nest_id,
        egg_id: attributes.egg_id,

        created_at: attributes.created_at,
        updated_at: attributes.updated_at,
    });

    static toNodeEntry = ({ attributes, meta }: FractalResponseData): NodeEntry => ({
        id: attributes.id,
        uuid: attributes.uuid,
        public: attributes.public,
        name: attributes.name,
        description: attributes.description,
        databaseHostId: attributes.database_host_id,
        fqdn: attributes.fqdn,
        sftpAlias: attributes.sftp_alias,
        listenPortHTTP: attributes.listen_port_http,
        publicPortHTTP: attributes.public_port_http,
        listenPortSFTP: attributes.listen_port_sftp,
        publicPortSFTP: attributes.public_port_sftp,
        scheme: attributes.scheme,
        behindProxy: attributes.behind_proxy,
        maintenanceMode: attributes.maintenance_mode,
        memory: attributes.memory,
        memoryOverallocate: attributes.memory_overallocate,
        disk: attributes.disk,
        diskOverallocate: attributes.disk_overallocate,
        uploadSize: attributes.upload_size,
        daemonBase: attributes.daemon_base,
        deployable: attributes.deployable,
        deployableFree: attributes.deployable_free,
        createdAt: new Date(attributes.created_at),
        updatedAt: new Date(attributes.updated_at),

        memoryUsedPercent: meta?.utilization.memory ?? 0,
        diskUsedPercent: meta?.utilization.disk ?? 0,
        allocationsUsedPercent: meta?.utilization.allocations ?? 0,

        relations: {
            databaseHost:
                attributes.relationships?.database_host !== undefined &&
                attributes.relationships?.database_host?.object !== 'null_resource'
                    ? Transformers.toDatabaseEntry(attributes.relationships.database_host as FractalResponseData)
                    : undefined,
        },
    });

    static toAllocationEntry = ({ attributes }: FractalResponseData): AllocationEntry => ({
        id: attributes.id,
        ip: attributes.ip,
        port: attributes.port,
        alias: attributes.alias || null,
        serverId: attributes.server_id,
        assigned: attributes.assigned,

        relations: {
            server:
                attributes.relationships?.server?.object === 'server'
                    ? Transformers.toServerEntry(attributes.relationships.server as FractalResponseData)
                    : undefined,
        },

        getDisplayText(): string {
            if (attributes.alias !== null) {
                return `${attributes.ip}:${attributes.port} (${attributes.alias})`;
            }
            return `${attributes.ip}:${attributes.port}`;
        },
    });

    static toServerVariableEntry = ({ attributes }: FractalResponseData): ServerVariableEntry => ({
        id: attributes.id,
        eggId: attributes.egg_id,
        name: attributes.name,
        description: attributes.description,
        envVariable: attributes.env_variable,
        defaultValue: attributes.default_value,
        userViewable: attributes.user_viewable,
        userEditable: attributes.user_editable,
        rules: attributes.rules,
        required: attributes.required,
        serverValue: attributes.server_value,
        createdAt: new Date(attributes.created_at),
        updatedAt: new Date(attributes.updated_at),
    });

    static toServerEntry = ({ attributes }: FractalResponseData): ServerEntry =>
        ({
            id: attributes.id,
            externalId: attributes.external_id,
            uuid: attributes.uuid,
            identifier: attributes.identifier,
            name: attributes.name,
            description: attributes.description,
            status: attributes.status,

            limits: {
                memory: attributes.limits.memory,
                swap: attributes.limits.swap,
                disk: attributes.limits.disk,
                io: attributes.limits.io,
                cpu: attributes.limits.cpu,
                threads: attributes.limits.threads,
                oomKiller: attributes.limits.oom_killer,
            },

            featureLimits: {
                databases: attributes.feature_limits.databases,
                allocations: attributes.feature_limits.allocations,
                backups: attributes.feature_limits.backups,
                subusers: attributes.feature_limits.subusers,
            },

            ownerId: attributes.owner_id,
            nodeId: attributes.node_id,
            allocationId: attributes.allocation_id,
            nestId: attributes.nest_id,
            eggId: attributes.egg_id,

            container: {
                startup: attributes.container.startup,
                image: attributes.container.image,
                environment: attributes.container.environment,
            },

            createdAt: new Date(attributes.created_at),
            updatedAt: new Date(attributes.updated_at),

            relations: {
                allocations: (
                    (attributes.relationships?.allocations as FractalResponseList | undefined)?.data || []
                ).map(Transformers.toAllocationEntry),
                egg:
                    attributes.relationships?.egg?.object === 'egg'
                        ? Transformers.toEggEntry(attributes.relationships.egg as FractalResponseData)
                        : undefined,
                node:
                    attributes.relationships?.node?.object === 'node'
                        ? Transformers.toNodeEntry(attributes.relationships.node as FractalResponseData)
                        : undefined,
                user:
                    attributes.relationships?.user?.object === 'user'
                        ? Transformers.toUser(attributes.relationships.user as FractalResponseData)
                        : undefined,
                variables: ((attributes.relationships?.variables as FractalResponseList | undefined)?.data || []).map(
                    Transformers.toServerVariableEntry,
                ),
            },
        } as ServerEntry);

    static toEggVariableEntry = ({ attributes }: FractalResponseData): EggVariableEntry => ({
        id: attributes.id,
        eggId: attributes.egg_id,
        name: attributes.name,
        description: attributes.description,
        envVariable: attributes.env_variable,
        defaultValue: attributes.default_value,
        userViewable: attributes.user_viewable,
        userEditable: attributes.user_editable,
        rules: attributes.rules,
        createdAt: new Date(attributes.created_at),
        updatedAt: new Date(attributes.updated_at),
    });

    static toEggEntry = ({ attributes }: FractalResponseData): EggEntry => ({
        id: attributes.id,
        uuid: attributes.uuid,
        nestId: attributes.nest_id,
        author: attributes.author,
        name: attributes.name,
        description: attributes.description,
        features: attributes.features,
        dockerImages: attributes.docker_images,
        configFiles: attributes.config?.files,
        configStartup: attributes.config?.startup,
        configStop: attributes.config?.stop,
        configFrom: attributes.config?.extends,
        startup: attributes.startup,
        copyScriptFrom: attributes.copy_script_from,
        scriptContainer: attributes.script?.container,
        scriptEntry: attributes.script?.entry,
        scriptIsPrivileged: attributes.script?.privileged,
        scriptInstall: attributes.script?.install,
        createdAt: new Date(attributes.created_at),
        updatedAt: new Date(attributes.updated_at),

        relations: {
            nest: undefined,
            servers: ((attributes.relationships?.servers as FractalResponseList | undefined)?.data || []).map(
                Transformers.toServerEntry,
            ),
            variables: ((attributes.relationships?.variables as FractalResponseList | undefined)?.data || []).map(
                Transformers.toEggVariableEntry,
            ),
        },
    });

    static toNestEntry = ({ attributes }: FractalResponseData): NestEntry => ({
        id: attributes.id,
        uuid: attributes.uuid,
        author: attributes.author,
        name: attributes.name,
        description: attributes.description,
        createdAt: new Date(attributes.created_at),
        updatedAt: new Date(attributes.updated_at),

        relations: {
            eggs: ((attributes.relationships?.eggs as FractalResponseList | undefined)?.data || []).map(
                Transformers.toEggEntry,
            ),
        },
    });

    static toDatabaseEntry = ({ attributes }: FractalResponseData): DatabaseEntry => ({
        id: attributes.id,
        name: attributes.name,
        host: attributes.host,
        port: attributes.port,
        username: attributes.username,
        maxDatabases: attributes.max_databases,
        createdAt: new Date(attributes.created_at),
        updatedAt: new Date(attributes.updated_at),

        getAddress: () => `${attributes.host}:${attributes.port}`,
    });

    static toMountEntry = ({ attributes }: FractalResponseData): MountEntry => ({
        id: attributes.id,
        uuid: attributes.uuid,
        name: attributes.name,
        description: attributes.description,
        source: attributes.source,
        target: attributes.target,
        readOnly: attributes.read_only,
        userMountable: attributes.user_mountable,
        createdAt: new Date(attributes.created_at),
        updatedAt: new Date(attributes.updated_at),

        relations: {
            eggs: ((attributes.relationships?.eggs as FractalResponseList | undefined)?.data || []).map(
                Transformers.toEggEntry,
            ),
            nodes: ((attributes.relationships?.nodes as FractalResponseList | undefined)?.data || []).map(
                Transformers.toNodeEntry,
            ),
            servers: ((attributes.relationships?.servers as FractalResponseList | undefined)?.data || []).map(
                Transformers.toServerEntry,
            ),
        },
    });
}
