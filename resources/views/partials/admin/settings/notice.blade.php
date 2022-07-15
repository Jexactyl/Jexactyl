@section('settings::notice')
    @if(config('pterodactyl.load_environment_only', false))
        <div class="row">
            <div class="col-xs-12">
                <div class="alert alert-danger">
                    您的面板当前配置为仅从环境中读取设置. 你需要将 .env 环境文件中的参数更改为 <code>APP_ENVIRONMENT_ONLY=false</code> 来保证程序动态加载设置.
                </div>
            </div>
        </div>
    @endif
@endsection
