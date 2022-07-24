{{-- Pterodactyl CHINA - Panel --}}
{{-- Simplified Chinese Translation Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com> --}}

{{-- This software is licensed under the terms of the MIT license. --}}
{{-- https://opensource.org/licenses/MIT --}}
@extends('layouts.admin')
@include('partials/admin.jexactyl.nav', ['activeTab' => 'renewal'])

@section('title')
    Jexactyl 续订
@endsection

@section('content-header')
    <h1>Jexactyl 续订<small>配置 Jexactyl 的服务器续订系统。</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li class="active">Jexactyl</li>
    </ol>
@endsection

@section('content')
    @yield('jexactyl::nav')
    <div class="row">
        <div class="col-xs-12">
            <form action="{{ route('admin.jexactyl.renewal') }}" method="POST">
                <div class="box
                    @if($enabled == 'true')
                        box-success
                    @else
                        box-danger
                    @endif
                ">
                    <div class="box-header with-border">
                        <i class="fa fa-clock-o"></i> <h3 class="box-title">服务器续订 <small>配置服务器续订设置。</small></h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">续订系统</label>
                                <div>
                                    <select name="enabled" class="form-control">
                                        <option @if ($enabled == 'false') selected @endif value="false">禁用</option>
                                        <option @if ($enabled == 'true') selected @endif value="true">启用</option>
                                    </select>
                                    <p class="text-muted"><small>设置用户使用多长时间才需要重新付费订阅。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">默认续订计时器</label>
                                <div>
                                    <div class="input-group">
                                        <input type="text" id="default" name="default" class="form-control" value="{{ $default }}" />
                                        <span class="input-group-addon">天</span>
                                    </div>
                                    <p class="text-muted"><small>设置服务器实例在其首次订阅到期之前的天数。</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">续订费用</label>
                                <div>
                                    <div class="input-group">
                                        <input type="text" id="cost" name="cost" class="form-control" value="{{ $cost }}" />
                                        <span class="input-group-addon">积分</span>
                                    </div>
                                    <p class="text-muted"><small>设置续订所需的积分额度。</small></p>
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
