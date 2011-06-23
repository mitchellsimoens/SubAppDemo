Ext.define('JSApp.test.controller.Main', {
    extend : 'Ext.app.Controller',

    stores : [], //doesn't work
    models : [], //doesn't work

    init: function() {
        var me = this;

        me.control({
            'mainwin' : {
                beforerender : me.handleMainBeforeRender
            }
        });
    },

    handleMainBeforeRender: function(win) {
        console.log('Main Before Render');
    }
});
