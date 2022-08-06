@section('jexactyl::nav')
    <div class="row">
        <div class="col-xs-12">
            <div class="nav-tabs-custom">
                <ul class="nav nav-tabs">
                    <li @if($activeTab === 'index')class="active"@endif><a href="{{ route('admin.index') }}">主页</a></li>
                    <li @if($activeTab === 'mail')class="active"@endif><a href="{{ route('admin.jexactyl.mail') }}">邮箱设置</a></li>
                    <li @if($activeTab === 'advanced')class="active"@endif><a href="{{ route('admin.jexactyl.advanced') }}">高级设置</a></li>
                    <li style="margin-left: 5px; margin-right: 5px;"><a>-</a></li>
                    <li @if($activeTab === 'store')class="active"@endif><a href="{{ route('admin.jexactyl.store') }}">商店</a></li>
                    <li @if($activeTab === 'registration')class="active"@endif><a href="{{ route('admin.jexactyl.registration') }}">用户注册</a></li>
                    <li @if($activeTab === 'server')class="active"@endif><a href="{{ route('admin.jexactyl.server') }}">服务器设置</a></li>
                    <li @if($activeTab === 'referrals')class="active"@endif><a href="{{ route('admin.jexactyl.referrals') }}">推广</a></li>
                </ul>
            </div>
        </div>
    </div>
@endsection
