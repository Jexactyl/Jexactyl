{{-- Pterodactyl CHINA - Panel --}}
{{-- Simplified Chinese Translation Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com> --}}

{{-- This software is licensed under the terms of the MIT license. --}}
{{-- https://opensource.org/licenses/MIT --}}
@extends('layouts.admin')
@include('partials/admin.jexactyl.nav', ['activeTab' => 'registration'])

@section('title')
    Jexactyl 设置
@endsection

@section('content-header')
    <h1>用户注册<small>在 Jexactyl 上配置用户注册设置。</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li class="active">Jexactyl</li>
    </ol>
@endsection

@section('content')
@yield('jexactyl::nav')
    <div class="row">
        <div class="col-xs-12">
            <form action="{{ route('admin.jexactyl.registration') }}" method="POST">
                <div class="box
                @if($enabled == 'true')
                    box-success
                @else
                    box-danger
                @endif
                ">
                    <div class="box-header with-border">
                        <i class="fa fa-at"></i> <h3 class="box-title">通过电子邮箱注册 <small>邮箱注册和登录设置。</small></h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">启用</label>
                                <div>
                                    <select name="registration:enabled" class="form-control">
                                        <option @if ($enabled == 'false') selected @endif value="false">禁用</option>
                                        <option @if ($enabled == 'true') selected @endif value="true">启用</option>
                                    </select>
                                    <p class="text-muted"><small>确定用户是否可以使用电子邮箱注册帐户。</small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="box
                @if($discord_enabled == 'true')
                    box-success
                @else
                    box-danger
                @endif
                ">
                    <div class="box-header with-border">
                        <i class="fa fa-comments-o"></i> <h3 class="box-title">通过 Discord 注册 <small>Discord 注册和登录的设置。</small></h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">启用</label>
                                <div>
                                    <select name="discord:enabled" class="form-control">
                                        <option @if ($discord_enabled == 'false') selected @endif value="false">禁用</option>
                                        <option @if ($discord_enabled == 'true') selected @endif value="true">启用</option>
                                    </select>
                                    @if($discord_enabled != 'true')
                                        <p class="text-danger">如果禁用此功能，游客将无法使用 Discord 注册或登录！</p>
                                    @else
                                        <p class="text-muted"><small>确定游客是否可以使用 Discord 注册帐户。</small></p>
                                    @endif
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Discord 客户端 ID</label>
                                <div>
                                    <input type="text" class="form-control" name="discord:id" value="{{ $discord_id }}" />
                                    <p class="text-muted"><small>您的 OAuth 应用程序的客户端 ID。通常为 18-19 个数字。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Discord 客户端密钥</label>
                                <div>
                                    <input type="text" class="form-control" name="discord:secret" value="{{ $discord_secret }}" />
                                    <p class="text-muted"><small>您的 OAuth 应用程序的客户端密钥。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Discord 的重定向 URL</label>
                                <div>
                                    <input type="text" class="form-control" name="discord:redirect" value="{{ $discord_redirect }}" />
                                    <p class="text-muted"><small>Discord 登录成功后重定向到的 URL。将 <code>example.com</code> 更改为您的顶级域名。</small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="box box-info">
                    <div class="box-header with-border">
                        <i class="fa fa-microchip"></i> <h3 class="box-title">默认资源 <small>注册时分配给用户的默认资源。</small></h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">CPU 数量</label>
                                <div>
                                    <input type="text" class="form-control" name="registration:cpu" value="{{ $cpu }}" />
                                    <p class="text-muted"><small>注册时应分配给用户的 CPU 数量（以 % 为单位）。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">内存大小</label>
                                <div>
                                    <input type="text" class="form-control" name="registration:memory" value="{{ $memory }}" />
                                    <p class="text-muted"><small>注册时应给用户的内存大小（以 MB 为单位）。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">存储空间大小</label>
                                <div>
                                    <input type="text" class="form-control" name="registration:disk" value="{{ $disk }}" />
                                    <p class="text-muted"><small>注册时应提供给用户的存储大小（以 MB 为单位）。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">实例槽位</label>
                                <div>
                                    <input type="text" class="form-control" name="registration:slot" value="{{ $slot }}" />
                                    <p class="text-muted"><small>注册时应提供给用户的服务器插槽数量。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">端口分配数量</label>
                                <div>
                                    <input type="text" class="form-control" name="registration:port" value="{{ $port }}" />
                                    <p class="text-muted"><small>注册时应提供给用户的服务器端口数量。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">备份槽位</label>
                                <div>
                                    <input type="text" class="form-control" name="registration:backup" value="{{ $backup }}" />
                                    <p class="text-muted"><small>注册时应提供给用户的服务器备份槽位。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">数据库数量</label>
                                <div>
                                    <input type="text" class="form-control" name="registration:database" value="{{ $database }}" />
                                    <p class="text-muted"><small>在注册时应提供给用户的服务器数据库数量。</small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {!! csrf_field() !!}
                <button type="submit" name="_method" value="PATCH" class="btn btn-default pull-right">保存更改</button>
            </form>
        </div>
    </div>
@endsection
