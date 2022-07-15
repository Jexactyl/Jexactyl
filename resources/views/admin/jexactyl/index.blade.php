{{-- Pterodactyl CHINA - Panel --}}
{{-- Simplified Chinese Translation Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com> --}}

{{-- This software is licensed under the terms of the MIT license. --}}
{{-- https://opensource.org/licenses/MIT --}}
@extends('layouts.admin')
@include('partials/admin.jexactyl.nav', ['activeTab' => 'index'])

@section('title')
    Jexactyl 设置
@endsection

@section('content-header')
    <h1>Jexactyl 设置<small>为面板配置 Jexactyl 特定的设置。</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li class="active">Jexactyl</li>
    </ol>
@endsection

@section('content')
    @yield('jexactyl::nav')
    <div class="row">
        <div class="col-xs-12">
            <div class="box
                @if($version->isLatestPanel())
                    box-success
                @else
                    box-danger
                @endif
            ">
                <div class="box-header with-border">
                    <h3 class="box-title">软件发布 <small>验证 Jexactyl 是否为最新。</small></h3>
                </div>
                <div class="box-body">
                    @if ($version->isLatestPanel())
                        您正在运行 Jexactyl <code>{{ config('app.version') }}</code>.
                    @else
                        Jexactyl 不是最新的。最新版本是 <a href="https://github.com/Jexactyl-CN/Jexactyl/releases/v{{ $version->getPanel() }}" target="_blank"><code>{{ $version->getPanel() }}</code></a>.
                    @endif
                </div>
            </div>
        </div>
    </div>
@endsection
