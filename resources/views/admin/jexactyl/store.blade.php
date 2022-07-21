{{-- Pterodactyl CHINA - Panel --}}
{{-- Simplified Chinese Translation Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com> --}}

{{-- This software is licensed under the terms of the MIT license. --}}
{{-- https://opensource.org/licenses/MIT --}}
@extends('layouts.admin')
@include('partials/admin.jexactyl.nav', ['activeTab' => 'store'])

@section('title')
    Jexactyl 设置
@endsection

@section('content-header')
    <h1>Jexactyl 商店<small>配置 Jexactyl 商店。</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li class="active">Jexactyl</li>
    </ol>
@endsection

@section('content')
    @yield('jexactyl::nav')
    <div class="row">
        <div class="col-xs-12">
            <form action="{{ route('admin.jexactyl.store') }}" method="POST">
                <div class="box
                    @if($enabled == 'true')
                        box-success
                    @else
                        box-danger
                    @endif
                ">
                    <div class="box-header with-border">
                        <h3 class="box-title">Jexactyl 商店<small>配置是否为商店启用某些选项。</small></h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">商店启用</label>
                                <div>
                                    <select name="store:enabled" class="form-control">
                                        <option @if ($enabled == 'false') selected @endif value="false">禁用</option>
                                        <option @if ($enabled == 'true') selected @endif value="true">启用</option>
                                    </select>
                                    <p class="text-muted"><small>确定用户是否可以访问商店用户界面。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">PayPal 启用</label>
                                <div>
                                    <select name="store:paypal:enabled" class="form-control">
                                        <option @if ($paypal_enabled == 'false') selected @endif value="false">禁用</option>
                                        <option @if ($paypal_enabled == 'true') selected @endif value="true">启用</option>
                                    </select>
                                    <p class="text-muted"><small>决定用户是否可以使用 PayPal 购买积分。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Stripe 启用</label>
                                <div>
                                    <select name="store:stripe:enabled" class="form-control">
                                        <option @if ($stripe_enabled == 'false') selected @endif value="false">禁用</option>
                                        <option @if ($stripe_enabled == 'true') selected @endif value="true">启用</option>
                                    </select>
                                    <p class="text-muted"><small>决定用户是否可以使用 Stripe 购买积分。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">币种名称</label>
                                <div>
                                    <select name="store:currency" class="form-control">
                                        <option @if ($currency == 'CNY') selected @endif value="CNY">CNY (人民币)</option>
                                        <option @if ($currency == 'EUR') selected @endif value="EUR">EUR (欧元)</option>
                                        <option @if ($currency == 'USD') selected @endif value="USD">USD (美元)</option>
                                        <option @if ($currency == 'JPY') selected @endif value="JPY">JPY (日元)</option>
                                        <option @if ($currency == 'GBP') selected @endif value="EUR">GBP (英镑)</option>
                                        <option @if ($currency == 'CAD') selected @endif value="CAD">CAD (加币)</option>
                                        <option @if ($currency == 'AUD') selected @endif value="AUD">AUD (澳元)</option>
                                    </select>
                                    <p class="text-muted"><small>用于 Jexactyl 的币种名称，这只是积分的名称。（默认：JCR）</small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="box box-info">
                    <div class="box-header with-border">
                        <h3 class="box-title">挂机收入 <small>配置被动积分赚取的设置。</small></h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">启用</label>
                                <div>
                                    <select name="earn:enabled" class="form-control">
                                        <option @if ($earn_enabled == 'false') selected @endif value="false">禁用</option>
                                        <option @if ($earn_enabled == 'true') selected @endif value="true">启用</option>
                                    </select>
                                    <p class="text-muted"><small>确定用户是否可以被动赚取积分。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">每分钟的积分数量</label>
                                <div>
                                    <input type="text" class="form-control" name="earn:amount" value="{{ $earn_amount }}" />
                                    <p class="text-muted"><small>每分钟AFK的用户应该得到的积分额度。</small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="box box-info">
                    <div class="box-header with-border">
                        <h3 class="box-title">资源价格 <small>为资源设置具体定价。</small></h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">每 50% 的 CPU 成本</label>
                                <div>
                                    <input type="text" class="form-control" name="store:cost:cpu" value="{{ $cpu }}" />
                                    <p class="text-muted"><small>用于计算 50% CPU 的总成本。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">每 1GB 内存的成本</label>
                                <div>
                                    <input type="text" class="form-control" name="store:cost:memory" value="{{ $memory }}" />
                                    <p class="text-muted"><small>用于计算 1GB 内存的总成本。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">每 1GB 存储空间的成本</label>
                                <div>
                                    <input type="text" class="form-control" name="store:cost:disk" value="{{ $disk }}" />
                                    <p class="text-muted"><small>用于计算 1GB 存储空间的总成本。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">每 1 个服务器实例的成本</label>
                                <div>
                                    <input type="text" class="form-control" name="store:cost:slot" value="{{ $slot }}" />
                                    <p class="text-muted"><small>用于计算 1 个服务器实例的总成本。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">每 1 个网络分配的成本</label>
                                <div>
                                    <input type="text" class="form-control" name="store:cost:port" value="{{ $port }}" />
                                    <p class="text-muted"><small>用于计算 1 个端口的总成本。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">每 1 个服务器备份的成本</label>
                                <div>
                                    <input type="text" class="form-control" name="store:cost:backup" value="{{ $backup }}" />
                                    <p class="text-muted"><small>用于计算 1 个备份的总费用。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">每 1 个服务器数据库的成本</label>
                                <div>
                                    <input type="text" class="form-control" name="store:cost:database" value="{{ $database }}" />
                                    <p class="text-muted"><small>用于计算 1 个数据库的总成本。</small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="box box-info">
                    <div class="box-header with-border">
                        <h3 class="box-title">资源限制 <small>设置服务器可以部署的每种资源的数量限制。</small></h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">CPU 限制</label>
                                <div>
                                    <div class="input-group">
                                        <input type="text" class="form-control" name="store:limit:cpu" value="{{ $limit_cpu }}" />
                                        <span class="input-group-addon">%</span>
                                    </div>
                                    <p class="text-muted"><small>可以部署服务器的最大 CPU 数量。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">内存限制</label>
                                <div>
                                    <div class="input-group">
                                        <input type="text" class="form-control" name="store:limit:memory" value="{{ $limit_memory }}" />
                                        <span class="input-group-addon">MB</span>
                                    </div>
                                    <p class="text-muted"><small>可以部署服务器的最大内存大小。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">存储空间限制</label>
                                <div>
                                    <div class="input-group">
                                        <input type="text" class="form-control" name="store:limit:disk" value="{{ $limit_disk }}" />
                                        <span class="input-group-addon">MB</span>
                                    </div>
                                    <p class="text-muted"><small>可以部署服务器的最大存储空间大小。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">网络分配限制</label>
                                <div>
                                    <div class="input-group">
                                        <input type="text" class="form-control" name="store:limit:port" value="{{ $limit_port }}" />
                                        <span class="input-group-addon">个端口</span>
                                    </div>
                                    <p class="text-muted"><small>可以部署服务器的最大端口（分配）数量。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">备份限制</label>
                                <div>
                                    <div class="input-group">
                                        <input type="text" class="form-control" name="store:limit:backup" value="{{ $limit_backup }}" />
                                        <span class="input-group-addon">个备份</span>
                                    </div>
                                    <p class="text-muted"><small>可以部署服务器的最大备份量。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">数据库限制</label>
                                <div>
                                    <div class="input-group">
                                        <input type="text" class="form-control" name="store:limit:database" value="{{ $limit_database }}" />
                                        <span class="input-group-addon">个数据库</span>
                                    </div>
                                    <p class="text-muted"><small>可以部署服务器的最大数据库数量。</small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    <button type="submit" name="_method" value="PATCH" class="btn btn-sm btn-primary pull-right">保存更改</button>
                </div>
            </form>
        </div>
    </div>
@endsection
