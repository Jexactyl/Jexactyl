@extends('layouts.admin')
@include('partials/admin.jexactyl.nav', ['activeTab' => 'advanced'])

@section('title')
    高级设置
@endsection

@section('content-header')
    <h1>高级设置<small>配置面板的高级设置。</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li class="active">Jexactyl</li>
    </ol>
@endsection

@section('content')
    @yield('jexactyl::nav')
        <form action="{{ route('admin.jexactyl.advanced') }}" method="POST">
            <div class="row">
                <div class="col-xs-12">
                    <div class="box">
                        <div class="box-header with-border">
                            <h3 class="box-title">面板设置</h3>
                        </div>
                        <div class="box-body">
                            <div class="row">
                                <div class="form-group col-md-4">
                                    <label class="control-label">公司名称</label>
                                    <div>
                                        <input type="text" class="form-control" name="app:name" value="{{ old('app:name', config('app.name')) }}" />
                                        <p class="text-muted"><small>这是整个面板以及发送给客户的电子邮箱中使用的名称。</small></p>
                                    </div>
                                </div>
                                <div class="form-group col-md-4">
                                    <label class="control-label">需要动态口令认证</label>
                                    <div>
                                        <div class="btn-group" data-toggle="buttons">
                                            @php
                                                $level = old('pterodactyl:auth:2fa_required', config('pterodactyl.auth.2fa_required'));
                                            @endphp
                                            <label class="btn btn-primary @if ($level == 0) active @endif">
                                                <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="0" @if ($level == 0) checked @endif> 不需要
                                            </label>
                                            <label class="btn btn-primary @if ($level == 1) active @endif">
                                                <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="1" @if ($level == 1) checked @endif> 仅限管理员
                                            </label>
                                            <label class="btn btn-primary @if ($level == 2) active @endif">
                                                <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="2" @if ($level == 2) checked @endif> 所有用户
                                            </label>
                                        </div>
                                        <p class="text-muted"><small>如果启用，任何属于所选分组的帐户都需要启用动态口令认证才能使用面板.</small></p>
                                    </div>
                                </div>
                                <div class="form-group col-md-4">
                                    <label class="control-label">面板 Logo</label>
                                    <div>
                                        <input type="text" class="form-control" name="app:logo" value="{{ $logo }}" />
                                        <p class="text-muted"><small>用于面板前端的Logo。</small></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-12">
                    <div class="box">
                        <div class="box-header with-border">
                            <h3 class="box-title">reCAPTCHA</h3>
                        </div>
                        <div class="box-body">
                            <div class="row">
                                <div class="form-group col-md-4">
                                    <label class="control-label">状态</label>
                                    <div>
                                        <select class="form-control" name="recaptcha:enabled">
                                            <option value="true">启用</option>
                                            <option value="false" @if(old('recaptcha:enabled', config('recaptcha.enabled')) == '0') selected @endif>禁用</option>
                                        </select>
                                        <p class="text-muted small">如果启用，登录表单和密码重置表单将进行静默验证码检查，并在需要时显示可见验证码.</p>
                                    </div>
                                </div>
                                <div class="form-group col-md-4">
                                    <label class="control-label">Site Key</label>
                                    <div>
                                        <input type="text" required class="form-control" name="recaptcha:website_key" value="{{ old('recaptcha:website_key', config('recaptcha.website_key')) }}">
                                    </div>
                                </div>
                                <div class="form-group col-md-4">
                                    <label class="control-label">Secret Key</label>
                                    <div>
                                        <input type="text" required class="form-control" name="recaptcha:secret_key" value="{{ old('recaptcha:secret_key', config('recaptcha.secret_key')) }}">
                                        <p class="text-muted small">用于您的网站与 Google 之间的通信。请务必保密。</p>
                                    </div>
                                </div>
                            </div>
                            @if($warning)
                                <div class="row">
                                    <div class="col-xs-12">
                                        <div class="alert alert-warning no-margin">
                                            您当前正在使用该面板随附的 reCAPTCHA 密钥。为了提高安全性，建议<a href="https://www.google.com/recaptcha/admin">生成新的不可见的 reCAPTCHA 密钥</a>，该密钥专门与您的网站相关联。
                                        </div>
                                    </div>
                                </div>
                            @endif
                        </div>
                    </div>
                    <div class="box">
                        <div class="box-header with-border">
                            <h3 class="box-title">HTTP 连接</h3>
                        </div>
                        <div class="box-body">
                            <div class="row">
                                <div class="form-group col-md-6">
                                    <label class="control-label">连接超时</label>
                                    <div>
                                        <input type="number" required class="form-control" name="pterodactyl:guzzle:connect_timeout" value="{{ old('pterodactyl:guzzle:connect_timeout', config('pterodactyl.guzzle.connect_timeout')) }}">
                                        <p class="text-muted small">在引发错误提示之前等待连接完成的时间（以秒为单位）.</p>
                                    </div>
                                </div>
                                <div class="form-group col-md-6">
                                    <label class="control-label">请求超时</label>
                                    <div>
                                        <input type="number" required class="form-control" name="pterodactyl:guzzle:timeout" value="{{ old('pterodactyl:guzzle:timeout', config('pterodactyl.guzzle.timeout')) }}">
                                        <p class="text-muted small">在引发错误提示之前等待请求完成的时间（以秒为单位）.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="box">
                        <div class="box-header with-border">
                            <h3 class="box-title">自动分配创建</h3>
                        </div>
                        <div class="box-body">
                            <div class="row">
                                <div class="form-group col-md-4">
                                    <label class="control-label">状态</label>
                                    <div>
                                        <select class="form-control" name="pterodactyl:client_features:allocations:enabled">
                                            <option value="false">禁用</option>
                                            <option value="true" @if(old('pterodactyl:client_features:allocations:enabled', config('pterodactyl.client_features.allocations.enabled'))) selected @endif>启用</option>
                                        </select>
                                        <p class="text-muted small">如果启用，用户将可以选择通过前端自动为其服务器创建新分配.</p>
                                    </div>
                                </div>
                                <div class="form-group col-md-4">
                                    <label class="control-label">起始端口</label>
                                    <div>
                                        <input type="number" class="form-control" name="pterodactyl:client_features:allocations:range_start" value="{{ old('pterodactyl:client_features:allocations:range_start', config('pterodactyl.client_features.allocations.range_start')) }}">
                                        <p class="text-muted small">可自动分配范围内的起始端口.</p>
                                    </div>
                                </div>
                                <div class="form-group col-md-4">
                                    <label class="control-label">结束端口</label>
                                    <div>
                                        <input type="number" class="form-control" name="pterodactyl:client_features:allocations:range_end" value="{{ old('pterodactyl:client_features:allocations:range_end', config('pterodactyl.client_features.allocations.range_end')) }}">
                                        <p class="text-muted small">可自动分配范围内的结束端口.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {{ csrf_field() }}
                    <button type="submit" name="_method" value="PATCH" class="btn btn-default pull-right">保存设置</button>
                </div>
            </div>
        </form>
@endsection
