<?php

namespace Everest\Http\Controllers\Api\Application\Links;

use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Everest\Models\CustomLink;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Everest\Http\Requests\Api\Application\Links;
use Everest\Transformers\Api\Application\LinkTransformer;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class LinkController extends ApplicationApiController
{
    /**
     * LinkController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get all links.
     */
    public function index(Links\GetLinksRequest $request): array
    {
        $perPage = (int) $request->query('per_page', '20');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $links = QueryBuilder::for(CustomLink::query())
            ->allowedFilters(...[
                AllowedFilter::exact('id'),
                'name',
                'url',
                'visible',
            ])
            ->allowedSorts(...['id', 'visible', 'name'])
            ->paginate($perPage);

        return $this->transform($links, LinkTransformer::class);
    }

    /**
     * Create a new link.
     */
    public function store(Links\StoreLinkRequest $request): array
    {
        $link = CustomLink::create([
            'url' => $request['url'],
            'name' => $request['name'],
            'visible' => (bool) $request['visible'],
        ]);

        Activity::event('admin:link:create')
            ->subject($link)
            ->property('name', $link->name)
            ->property('url', $link->url)
            ->description('New custom link for client UI was made')
            ->log();

        return $this->transform($link, LinkTransformer::class);
    }

    /**
     * Update a selected link.
     */
    public function update(Links\UpdateLinkRequest $request, int $id): array
    {
        $link = CustomLink::findOrFail($id);

        $link->update([
            'url' => $request['url'],
            'name' => $request['name'],
            'visible' => (bool) $request['visible'],
        ]);

        Activity::event('admin:link:update')
            ->subject($link)
            ->property('name', $link->name . ' => ' . $request['name'])
            ->property('url', $link->url . ' => ' . $request['url'])
            ->description('An existing custom link was updated')
            ->log();

        return $this->transform($link, LinkTransformer::class);
    }

    /**
     * Delete a selected link.
     */
    public function delete(Links\DeleteLinkRequest $request, int $id): Response
    {
        $link = CustomLink::findOrFail($id);

        $link->delete();

        Activity::event('admin:link:delete')
            ->subject($link)
            ->property('name', $link->name)
            ->property('url', $link->url)
            ->description('An existing custom link was deleted')
            ->log();

        return $this->returnNoContent();
    }
}
