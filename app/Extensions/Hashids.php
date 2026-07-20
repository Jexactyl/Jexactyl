<?php

namespace Everest\Extensions;

use Illuminate\Support\Arr;
use Hashids\Hashids as VendorHashids;
use Everest\Contracts\Extensions\HashidsInterface;

class Hashids extends VendorHashids implements HashidsInterface
{
    public function decodeFirst(string $encoded, ?string $default = null): mixed
    {
        $result = $this->decode($encoded);

        return Arr::first($result, null, $default);
    }
}
