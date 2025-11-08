import { FractalResponseData, FractalResponseList } from '@/api/http';
import { transform } from '@definitions/helpers';
import * as Models from '@definitions/account/models';

export default class Transformers {
    static toSSHKey = ({ attributes }: FractalResponseData): Models.SSHKey => {
        return {
            name: attributes.name,
            public_key: attributes.public_key,
            fingerprint: attributes.fingerprint,
            created_at: new Date(attributes.created_at),
        };
    };

    static toApiKey = ({ attributes }: FractalResponseData): Models.ApiKey => ({
        id: attributes.id,
        identifier: attributes.identifier,
        description: attributes.description,
        allowedIps: attributes.allowed_ips,
        createdAt: attributes.created_at ? new Date(attributes.created_at) : null,
        lastUsedAt: attributes.last_used_at ? new Date(attributes.last_used_at) : null,
    });

    static toTicket = ({ attributes }: FractalResponseData): Models.Ticket => {
        const { messages } = attributes.relationships || {};

        return {
            id: attributes.id,
            title: attributes.title,
            status: attributes.status,
            createdAt: new Date(attributes.created_at),
            updatedAt: attributes.updatedAt ? new Date(attributes.updated_at) : null,
            relationships: {
                messages: transform(messages as FractalResponseList, this.toTicketMessage, null),
            },
        };
    };

    static toTicketMessage = ({ attributes }: FractalResponseData): Models.TicketMessage => ({
        id: attributes.id,
        author: attributes.author,
        message: attributes.message,
        createdAt: new Date(attributes.created_at),
        updatedAt: attributes.updated_at ? new Date(attributes.updated_at) : null,
    });

    static toUser = ({ attributes }: FractalResponseData): Models.User => {
        return {
            uuid: attributes.uuid,
            username: attributes.username,
            email: attributes.email,
            image: attributes.image,
            twoFactorEnabled: attributes['2fa_enabled'],
            permissions: attributes.permissions || [],
            createdAt: new Date(attributes.created_at),
            can(permission): boolean {
                return this.permissions.includes(permission);
            },
        };
    };

    static toActivityLog = ({ attributes }: FractalResponseData): Models.ActivityLog => {
        const { actor } = attributes.relationships || {};

        return {
            id: attributes.id,
            batch: attributes.batch,
            event: attributes.event,
            ip: attributes.ip,
            isApi: attributes.is_api,
            description: attributes.description,
            properties: attributes.properties,
            hasAdditionalMetadata: attributes.has_additional_metadata ?? false,
            timestamp: new Date(attributes.timestamp),
            relationships: {
                actor: transform(actor as FractalResponseData, this.toUser, null),
            },
        };
    };
}

export class MetaTransformers {}
