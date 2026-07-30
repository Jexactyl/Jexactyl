<?php

namespace Everest\Transformers\Api\Client;

use Everest\Models\Server;
use Everest\Models\Billing\Order;
use League\Fractal\Resource\Item;
use Everest\Models\Billing\Invoice;
use Everest\Transformers\Api\Transformer;
use League\Fractal\Resource\NullResource;

class OrderTransformer extends Transformer
{
    protected array $availableIncludes = ['server', 'invoice'];

    public function getResourceName(): string
    {
        return Order::RESOURCE_NAME;
    }

    /**
     * Transform this model into a representation that can be consumed by a client.
     */
    public function transform(Order $model): array
    {
        return [
            'id' => $model->id,
            'name' => $model->name,
            'description' => $model->description,
            'total' => $model->total,
            'status' => $model->status,
            'product_id' => $model->product_id,
            'type' => $model->type ?? '?',
            'server_id' => $model->server_id,
            'metadata' => $model->metadata,
            'created_at' => $model->created_at->toIso8601String(),
            'updated_at' => $model->updated_at->toIso8601String(),
        ];
    }

    /**
     * Return a generic array of data about the server associated.
     */
    public function includeServer(Order $model): Item|NullResource
    {
        if (!$model->server instanceof Server) {
            return $this->null();
        }

        return $this->item($model->server, new ServerTransformer());
    }

    /**
     * Return the invoice generated for this order, if one exists yet.
     */
    public function includeInvoice(Order $model): Item|NullResource
    {
        if (!$model->invoice instanceof Invoice) {
            return $this->null();
        }

        return $this->item($model->invoice, new InvoiceTransformer());
    }
}
