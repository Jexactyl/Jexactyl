<?php

namespace Everest\Http\Controllers\Api\Application\Users;

use Everest\Models\User;
use Illuminate\Support\Arr;
use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Everest\Exceptions\DisplayException;
use Illuminate\Database\Eloquent\Builder;
use Everest\Services\Users\UserUpdateService;
use Everest\Services\Users\UserCreationService;
use Everest\Services\Users\UserDeletionService;
use Everest\Transformers\Api\Application\UserTransformer;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Http\Requests\Api\Application\Users\GetUserRequest;
use Everest\Http\Requests\Api\Application\Users\GetUsersRequest;
use Everest\Http\Requests\Api\Application\Users\StoreUserRequest;
use Everest\Http\Requests\Api\Application\Users\DeleteUserRequest;
use Everest\Http\Requests\Api\Application\Users\UpdateUserRequest;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class UserController extends ApplicationApiController
{
    /**
     * UserController constructor.
     */
    public function __construct(
        private UserCreationService $creationService,
        private UserDeletionService $deletionService,
        private UserUpdateService $updateService
    ) {
        parent::__construct();
    }

    /**
     * Handle request to list all users on the panel. Returns a JSON-API representation
     * of a collection of users including any defined relations passed in
     * the request.
     */
    public function index(GetUsersRequest $request): array
    {
        $perPage = (int) $request->query('per_page', '20');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $users = QueryBuilder::for(User::query())
            ->allowedFilters([
                'username',
                'email',
                AllowedFilter::exact('id'),
                AllowedFilter::exact('uuid'),
                AllowedFilter::exact('external_id'),
                AllowedFilter::callback('*', function (Builder $builder, $value) {
                    foreach (Arr::wrap($value) as $datum) {
                        $datum = '%' . $datum . '%';
                        $builder->orWhere(function (Builder $builder) use ($datum) {
                            $builder->where('uuid', 'LIKE', $datum)
                                ->orWhere('username', 'LIKE', $datum)
                                ->orWhere('email', 'LIKE', $datum)
                                ->orWhere('external_id', 'LIKE', $datum);
                        });
                    }
                }),
            ])
            ->allowedSorts(['id', 'uuid', 'username', 'email', 'admin_role_id', 'use_totp', 'root_admin', 'state', 'created_at'])
            ->paginate($perPage);

        return $this->fractal->collection($users)
            ->transformWith(UserTransformer::class)
            ->toArray();
    }

    /**
     * Handle a request to view a single user. Includes any relations that
     * were defined in the request.
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function view(GetUserRequest $request, User $user): array
    {
        return $this->fractal->item($user)
            ->transformWith(UserTransformer::class)
            ->toArray();
    }

    /**
     * Update an existing user on the system and return the response. Returns the
     * updated user model response on success. Supports handling of token revocation
     * errors when switching a user from an admin to a normal user.
     *
     * Revocation errors are returned under the 'revocation_errors' key in the response
     * meta. If there are no errors this is an empty array.
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function update(UpdateUserRequest $request, User $user): array
    {
        if (
            !$request->user()->root_admin &&
            (
                $request->input('root_admin') ||
                $request->input('admin_role_id') !== $user->admin_role_id
            )
        ) {
            throw new DisplayException('You must be a root administrator to grant another user permissions.');
        }

        if (!$request->user()->root_admin && ($user->root_admin && !$request->input('root_admin'))) {
            throw new DisplayException('You cannot remove rootAdmin without the same level of permission.');
        }

        $this->updateService->setUserLevel(User::USER_LEVEL_ADMIN);
        $user = $this->updateService->handle($user, $request->validated());

        Activity::event('admin:users:update')
            ->property('user', $user)
            ->property('new_data', $request->all())
            ->description('A user was updated')
            ->log();

        return $this->fractal->item($user)
            ->transformWith(UserTransformer::class)
            ->toArray();
    }

    /**
     * Store a new user on the system. Returns the created user and a HTTP/201
     * header on successful creation.
     *
     * @throws \Exception
     * @throws \Everest\Exceptions\Model\DataValidationException
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->creationService->handle($request->validated());

        Activity::event('admin:users:create')
            ->property('user', $user)
            ->description('A user was created')
            ->log();

        return $this->fractal->item($user)
            ->transformWith(UserTransformer::class)
            ->respond(201);
    }

    /**
     * Toggles the suspension state of a user account.
     *
     * @throws \Throwable
     */
    public function suspend(User $user): Response
    {
        if ($user->root_admin) {
            throw new \Exception('You cannot suspend an administrator.');
        }

        $user->update(['state' => $user->isSuspended() ? '' : 'suspended']);

        Activity::event('admin:users:suspend')
            ->property('user', $user)
            ->description('A user was suspended')
            ->log();

        return $this->returnNoContent();
    }

    /**
     * Handle a request to delete a user from the Panel. Returns a HTTP/204 response
     * on successful deletion.
     *
     * @throws \Everest\Exceptions\DisplayException
     */
    public function delete(DeleteUserRequest $request, User $user): Response
    {
        $this->deletionService->handle($user);

        Activity::event('admin:users:delete')
            ->property('user', $user)
            ->description('A user was deleted')
            ->log();

        return $this->returnNoContent();
    }
}
