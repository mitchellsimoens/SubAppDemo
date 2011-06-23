Ext.define('JS.view.Viewport', {
    extend : 'Ext.container.Viewport',

    uses : [
        'Ext.app.SubApplication',

        'JS.view.Main'
    ],

    layout : 'fit',

    items  : {
        xtype : 'mainview'
    }
});
