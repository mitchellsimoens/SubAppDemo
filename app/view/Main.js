Ext.define('JS.view.Main', {
    extend : 'Ext.Panel',
    alias  : 'widget.mainview',

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            dockedItems : me.buildDocks(),
            frame : true,
            html  : 'Test Sub App Loading',
        });

        me.callParent();
    },

    buildDocks: function() {
        return [
            {
                xtype : 'toolbar',
                dock  : 'top',
                items : [
                    {
                        text : 'Launch Sub App 1'
                    }
                ]
            }
        ];
    }
});
