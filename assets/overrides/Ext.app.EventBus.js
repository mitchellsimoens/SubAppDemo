Ext.override(Ext.app.EventBus, {
    uncontrol: function(controllerArray) {
        var me  = this,
            bus = me.bus,
            deleteThis, idx;

        Ext.iterate(bus, function(ev, controllers) {
            Ext.iterate(controllers, function(query, controller) {
                deleteThis = false;

                Ext.iterate(controller, function(controlName) {
                    idx = controllerArray.indexOf(controlName);

                    if (idx >= 0) {
                        deleteThis = true;
                    }
                });

                if (deleteThis) {
                    delete controllers[query];
                }
            });
        });
    }
});
