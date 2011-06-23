Ext.define('JSApp.test.view.Main', {
    extend : 'Ext.window.Window',
    alias  : 'widget.mainwin',

    cls    : 'test-main-win',
    height : 300,
    modal  : true,
    width  : 400,

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            html  : 'This window was dynamically loaded!',
            title : 'Dynamic Sub App'
        });

        me.callParent();
    }
});
