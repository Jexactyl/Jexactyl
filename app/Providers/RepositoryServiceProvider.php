<?php

namespace Everest\Providers;

use Illuminate\Support\ServiceProvider;
use Everest\Repositories\Eloquent\EggRepository;
use Everest\Repositories\Eloquent\NestRepository;
use Everest\Repositories\Eloquent\NodeRepository;
use Everest\Repositories\Eloquent\TaskRepository;
use Everest\Repositories\Eloquent\UserRepository;
use Everest\Repositories\Eloquent\ApiKeyRepository;
use Everest\Repositories\Eloquent\ServerRepository;
use Everest\Repositories\Eloquent\SessionRepository;
use Everest\Repositories\Eloquent\SubuserRepository;
use Everest\Repositories\Eloquent\DatabaseRepository;
use Everest\Repositories\Eloquent\LocationRepository;
use Everest\Repositories\Eloquent\ScheduleRepository;
use Everest\Repositories\Eloquent\SettingsRepository;
use Everest\Repositories\Eloquent\AllocationRepository;
use Everest\Contracts\Repository\EggRepositoryInterface;
use Everest\Repositories\Eloquent\EggVariableRepository;
use Everest\Contracts\Repository\NestRepositoryInterface;
use Everest\Contracts\Repository\NodeRepositoryInterface;
use Everest\Contracts\Repository\TaskRepositoryInterface;
use Everest\Contracts\Repository\UserRepositoryInterface;
use Everest\Repositories\Eloquent\DatabaseHostRepository;
use Everest\Contracts\Repository\ApiKeyRepositoryInterface;
use Everest\Contracts\Repository\ServerRepositoryInterface;
use Everest\Repositories\Eloquent\ServerVariableRepository;
use Everest\Contracts\Repository\SessionRepositoryInterface;
use Everest\Contracts\Repository\SubuserRepositoryInterface;
use Everest\Contracts\Repository\DatabaseRepositoryInterface;
use Everest\Contracts\Repository\LocationRepositoryInterface;
use Everest\Contracts\Repository\ScheduleRepositoryInterface;
use Everest\Contracts\Repository\SettingsRepositoryInterface;
use Everest\Contracts\Repository\AllocationRepositoryInterface;
use Everest\Contracts\Repository\EggVariableRepositoryInterface;
use Everest\Contracts\Repository\DatabaseHostRepositoryInterface;
use Everest\Contracts\Repository\ServerVariableRepositoryInterface;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register all the repository bindings.
     */
    public function register(): void
    {
        // Eloquent Repositories
        $this->app->bind(AllocationRepositoryInterface::class, AllocationRepository::class);
        $this->app->bind(ApiKeyRepositoryInterface::class, ApiKeyRepository::class);
        $this->app->bind(DatabaseRepositoryInterface::class, DatabaseRepository::class);
        $this->app->bind(DatabaseHostRepositoryInterface::class, DatabaseHostRepository::class);
        $this->app->bind(EggRepositoryInterface::class, EggRepository::class);
        $this->app->bind(EggVariableRepositoryInterface::class, EggVariableRepository::class);
        $this->app->bind(LocationRepositoryInterface::class, LocationRepository::class);
        $this->app->bind(NestRepositoryInterface::class, NestRepository::class);
        $this->app->bind(NodeRepositoryInterface::class, NodeRepository::class);
        $this->app->bind(ScheduleRepositoryInterface::class, ScheduleRepository::class);
        $this->app->bind(ServerRepositoryInterface::class, ServerRepository::class);
        $this->app->bind(ServerVariableRepositoryInterface::class, ServerVariableRepository::class);
        $this->app->bind(SessionRepositoryInterface::class, SessionRepository::class);
        $this->app->bind(SettingsRepositoryInterface::class, SettingsRepository::class);
        $this->app->bind(SubuserRepositoryInterface::class, SubuserRepository::class);
        $this->app->bind(TaskRepositoryInterface::class, TaskRepository::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
    }
}
