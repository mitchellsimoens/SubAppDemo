Ext.define('JSApp.test.controller.Main', {
    extend : 'Ext.app.Controller',

    stores : ['JSApp.test.store.Test'],
    models : ['JSApp.test.model.Test'],

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
