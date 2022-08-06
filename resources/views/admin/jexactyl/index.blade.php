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
                    <i class="fa fa-code-fork"></i> <h3 class="box-title">软件发布 <small>验证 Jexactyl 是否为最新。</small></h3>
                </div>
                <div class="box-body">
                    @if ($version->isLatestPanel())
                        您正在运行 Jexactyl <code>{{ config('app.version') }}</code>.
                    @else
                        Jexactyl 不是最新的。最新版本是 <a href="https://github.com/Jexactyl-CN/jexactyl/releases/v{{ $version->getPanel() }}" target="_blank"></a>.
                    @endif
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-xs-12">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <i class="fa fa-bar-chart"></i> <h3 class="box-title">资源利用率 <small>总资源使用量一览图。</small></h3>
                </div>
                <div class="box-body">
                    <div class="col-xs-12 col-md-3">
                        <canvas id="servers_chart" width="100%" height="50">
                            <p class="text-muted">此图表无可用数据。</p>
                        </canvas>
                    </div>
                    <div class="col-xs-12 col-md-3" style="margin-bottom: 20px;">
                        <canvas id="status_chart" width="100%" height="50">
                            <p class="text-muted">此图表无可用数据。</p>
                        </canvas>
                    </div>
                    <div class="col-xs-12 col-md-3">
                        <canvas id="ram_chart" width="100%" height="50">
                            <p class="text-muted">此图表无可用数据。</p>
                        </canvas>
                    </div>
                    <div class="col-xs-12 col-md-3">
                        <canvas id="disk_chart" width="100%" height="50">
                            <p class="text-muted">此图表无可用数据。</p>
                        </canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-xs-12">
            <div class="col-xs-12 col-md-3">
                <div class="info-box">
                    <span class="info-box-icon"><i class="fa fa-server"></i></span>
                    <div class="info-box-content" style="padding: 23px 10px 0;">
                        <span class="info-box-text">服务器总数</span>
                        <span class="info-box-number">{{ count($servers) }}</span>
                    </div>
                </div>
            </div>
            <div class="col-xs-12 col-md-3">
                <div class="info-box">
                    <span class="info-box-icon"><i class="fa fa-wifi"></i></span>
                    <div class="info-box-content" style="padding: 23px 10px 0;">
                        <span class="info-box-text">分配端口总数</span>
                        <span class="info-box-number">{{ $allocations }}</span>
                    </div>
                </div>
            </div>
            <div class="col-xs-12 col-md-3">
                <div class="info-box">
                    <span class="info-box-icon"><i class="fa fa-pie-chart"></i></span>
                    <div class="info-box-content" style="padding: 23px 10px 0;">
                        <span class="info-box-text">总内存使用量</span>
                        <span class="info-box-number">{{ $used['memory'] }} MB / {{ $available['memory'] }} MB</span>
                    </div>
                </div>
            </div>
            <div class="col-xs-12 col-md-3">
                <div class="info-box">
                    <span class="info-box-icon"><i class="fa fa-hdd-o"></i></span>
                    <div class="info-box-content" style="padding: 23px 10px 0;">
                        <span class="info-box-text">总存储空间使用量</span>
                        <span class="info-box-number">{{ $used['disk'] }} MB / {{ $available['disk'] }} MB </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent
    {!! Theme::js('vendor/chartjs/chart.min.js') !!}
    {!! Theme::js('js/admin/statistics.js') !!}
@endsection
