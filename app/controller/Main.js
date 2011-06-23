Ext.define('JS.controller.Main', {
    extend : 'Ext.app.Controller',

    init: function() {
        var me = this;

        me.control({
            'mainview button' : {
                click : me.handleButtonClick
            }
        });
    },

    handleButtonClick: function(btn) {
        var me     = this,
            app    = me.application,
            subapp = new Ext.app.SubApplication({
                app          : app,
                id           : 'JSApp.test.view.Main',
                loadMask     : true,
                loadingText  : 'Loading Test...',

                controllers : [
                    'JSApp.test.controller.Main'
                ],

                dependencies : {
                    css : [
                        'apps/test/css/main.css'
                    ],
                    js  : [
                        'apps/test/controller/Main.js',
                        'apps/test/view/Main.js'
                    ]
                },

                launch: function() {
                    var win = Ext.create('JSApp.test.view.Main', {
                        app : me
                    });
                    win.show();

                    return win;
                }
            });
    }
});
