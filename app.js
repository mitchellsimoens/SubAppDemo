Ext.Loader.setConfig({
    enabled        : true,
    paths          : {
        'Ext.ux'  : 'assets/ux',
        'Ext.app' : 'assets/ux/app'
    }
});

Ext.state.Manager.setProvider(
    new Ext.state.CookieProvider({
        expires: new Date(new Date().getTime()+(1000*60*60*24*7)) //7 days from now
    })
);

Ext.create('Ext.app.Application', {
    name : 'JS',

    autoCreateViewport : true,

    controllers: [
        'JS.controller.Main'
    ]
});
