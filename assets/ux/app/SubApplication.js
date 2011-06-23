/**
 * @class Ext.app.SubApplication
 * @extend Ext.app.Controller
 *
 * @author Mitchell Simoens <mitchell.simoens@sencha.com>
 * @docauthor Mitchell Simoens <mitchell.simoens@sencha.com>
 *
 * This class is used to dynamically load "sub applications". Ext.Loader is great for development
 * but a production way to dynamically load files is needed. This class will load CSS and JS files
 * when created. This class does not care if the fiels are compressed or minified. JS files wil
 * automatically be destroyed once all JS files are loaded. CSS files are automatically destroyed
 * when the SubApplication detects the "main view" has been destroyed.
 *
 * The "main view" is the view that usually encapsulates the "sub application". Example: Ext.window.Window
 * that holds all the other views would be considered the "main view". You should return this "main view"
 * in the launch method in order to properly destroy the Ext.app.SubApplication instance so it can clean
 * all the controllers and dependencies.
 *
 *     var applcation = me.application;
 *
 *     new Ext.app.SubApplication({
 *         app          : me.application,
 *         className    : 'Sencha.forum.view.Window',
 *         loadMask     : true,
 *         loadingText  : 'Loading Forum Window...',
 *
 *         controllers : [
 *             'Sencha.forum.controller.Base'
 *         ],
 *
 *         dependencies : {
 *             css : [
 *                 'apps/forum/css/app.css'
 *             ],
 *             js  : [
 *                 'apps/forum/controller/Base.js',
 *                 'apps/forum/model/Post.js',
 *                 'apps/forum/store/Posts.js',
 *                 'apps/forum/view/Window.js'
 *             ]
 *         },
 *
 *         launch: function() {
 *             var win = Ext.create(className, {
 *                 app : application
 *             }).show();
 *
 *             return win; //return the "main view"
 *         }
 *     });
 *
 * Even though you can keep your JS files separate, it is very recommended to compress and minify all
 * into one file. Same for CSS files. The next example would be the same Ext.app.SubApplication:
 *
 *     var applcation = me.application;
 *
 *     new Ext.app.SubApplication({
 *         app          : me.application,
 *         className    : 'Sencha.forum.view.Window',
 *         loadMask     : true,
 *         loadingText  : 'Loading Forum Window...',
 *
 *         controllers : [
 *             'Sencha.forum.controller.Base'
 *         ],
 *
 *         dependencies : {
 *             css : [
 *                 'apps/forum/forum-all.css'
 *             ],
 *             js  : [
 *                 'apps/forum/forum-all.js'
 *             ]
 *         },
 *
 *         launch: function() {
 *             var win = Ext.create(className, {
 *                 app : application
 *             }).show();
 *
 *             return win; //return the "main view"
 *         }
 *     });
 *
 * The class that matches the className config property should be last class whether or not you are
 * loading files separately or in a build file. The reason for this is Ext.app.SubApplication checks
 * Ext.ClassManager to see if the className provided is loaded. If it is not, it will check every 50ms.
 * If it is loaded, then all JS files have been loaded and Ext.app.SubApplication can then proceed
 * with it's launch.
 *
 */

Ext.define('Ext.app.SubApplication', {
    extend: 'Ext.app.Controller',

    requires: [
        'Ext.ModelManager',
        'Ext.data.Model',
        'Ext.data.StoreManager',
        'Ext.ComponentManager',
        'Ext.app.EventBus'
    ],

    /**
      * @cfg {Ext.app.Application} app Reference to the global Ext.app.Application instance
      */
    /**
      * @cfg {String} id ID of the SubApplication.
      */

    /**
      * @cfg {Array} controllers Array of Controller names to create.
      */
    /**
      * @cfg {Object} dependencies Object holding Arrays for CSS and JS files to load.
      * JS files will automatically be destroyed once all JS files are loaded.
      * CSS files will be automatically destroyed when SubApplication is destroyed
      */
    dependencies      : {
        css : [],
        js  : []
    },
    /**
      * @cfg {Boolean/Ext.LoadMask} loadMask true to use a Ext.LoadMask while loading dependencies.
      * Can also accept a config Object of Ext.LoadMask
      */
    loadMask          : true,
    /**
      * @cfg {String} loadingCls CSS name(s) to apply to the message div of Ext.LoadMask
      */
    loadingCls        : '',
    /**
      * @cfg {String} loadingText Text to show in the Ext.LoadMask
      */
    loadingText       : 'Loading...',
    /**
      * @cfg {Boolean} loadingUseMsg true to show a message in the Ext.LoadMask
      */
    loadingUseMsg     : true,
    /**
      * @cfg {Number}removeJSFileDelay Time in milliseconds to delay destroying JS files after all have been loaded
      */
    removeJSFileDelay : 100,

    scope             : undefined,

    /**
       * Function that will be called before the launch function but after all dependencies
       * have been loaded and Controllers created.
       * @property beforelaunch
       * @type Function
       */
    beforeLaunch : Ext.emptyFn,
     /**
       * Function that will be called after everything has been set up. Use this function
       * to create the SubApplication views.
       * NOTE: Return the main view as SubApplication will listen for it's destroy event to destroy the SubApplication.
       * @property launch
       * @type Function
       * @return {Ext.Component} Return the main view as SubApplication will listen for it's destroy event to destroy
       * the SubApplication.
       */
    launch       : Ext.emptyFn,

    constructor: function(config){
        config = config || {};

        var me          = this,
            app         = config.app,
            controllers = Ext.Array.from(config.controllers);

        Ext.apply(config, {
            documentHead : Ext.getHead(),
            id           : config.id,

            eventbus     : app.eventbus,

            //private
            //holds loaded JS files to remove after loading file
            loadedJS     : Ext.create('Ext.util.MixedCollection'),
            //private
            //holds loaded CSS files to remove on destruction
            loadedCSS    : Ext.create('Ext.util.MixedCollection'),
        });

        me.callParent(arguments);

        Ext.apply(me, {
            appControllers : controllers,
            controllers    : Ext.create('Ext.util.MixedCollection')
        });

        me.init();
    },

    init: function() {
        var me           = this,
            dependencies = me.dependencies,
            css          = dependencies.css,
            js           = dependencies.js,
            loadMask     = me.loadMask,
            cfg;

        if (loadMask) {
            cfg = Ext.isObject(loadMask) ? loadMask : {
                    msg    : me.loadingText,
                    msgCls : me.loadingCls,
                    useMsg : me.loadingUseMsg
                };

            me.loadMask = loadMask = Ext.create('Ext.LoadMask', Ext.getBody(), cfg);
            loadMask.show();
        }

        Ext.each(css, function(file) {
            me.loadCSSFile(file);
        });

        Ext.each(js, function(file) {
            me.loadJSFile(file);
        });
    },

    loadCSSFile: function(file) {
        var me   = this,
            head = me.documentHead,
            css  = document.createElement('link');

        Ext.apply(css, {
            href : file,
            rel  : 'stylesheet',
            type : 'text/css'
        });

        head.appendChild(css);

        me.loadedCSS.add(Ext.get(css));
    },

    loadJSFile: function(file) {
        var me     = this,
            head   = me.documentHead,
            script = document.createElement('script');

        Ext.apply(script, {
            src  : file,
            type : 'text/javascript',

            onload : Ext.Function.createDelayed(me.handleFileLoad, me.removeJSFileDelay, me, [script]),
            onreadystatechange : function() {
                if (this.readyState === 'loaded' || this.readyState === 'complete') {
                    me.handleFileLoad(script);
                }
            }
        });

        head.appendChild(script);
    },

    handleFileLoad: function(script) {
        script.onload = null;
        script.onreadystatechange = null;
        script.onerror = null;

        var me       = this,
            loadedJS = me.loadedJS;

        loadedJS.add(Ext.get(script));

        me.checkJSDependencyState();
    },

    checkJSDependencyState: function() {
        var me           = this,
            dependencies = me.dependencies,
            js           = dependencies.js,
            jsLen        = js.length,
            loadedJS     = me.loadedJS,
            loadedLen    = loadedJS.getCount();

        if (jsLen === loadedLen) {
            loadedJS.each(function(file) {
                me.removeFile(file);

                loadedJS.remove(file);
            });

            me.onBeforeLaunch();
        }
    },

    addController: function(controller, skipInit) {
        if (Ext.isDefined(controller.name)) {
            var name = controller.name;
            delete controller.name;

            controller.id = controller.id || name;

            controller = Ext.create(name, controller);
        }

        var me          = this,
            controllers = me.controllers;

        controllers.add(controller);

        if (!skipInit) {
            controller.init();
        }

        return controller;
    },

    removeController: function(controller, removeListeners) {
        removeListeners = removeListeners || true;

        var me          = this,
            controllers = me.controllers;

        controllers.remove(controller);

        if (removeListeners) {
            var bus = me.eventbus;

            bus.uncontrol([controller.id]);
        }
    },

    addSubApplication: function(subapp) {
        var me      = this,
            app     = me.app,
            subapps = app.subApplications;

        subapps.add(subapp);

        return subapp;
    },

    removeSubApplication: function(subapp) {
        var me      = this,
            app     = me.app,
            subapps = app.subApplications;

        subapps.remove(subapp);
    },

    removeFile: function(file) {
        Ext.destroy(file);
    },

    onBeforeLaunch: function() {
        var me          = this,
            app         = me.app,
            controllers = me.appControllers,
            loadMask    = me.loadMask,
            controller, subapp;

        if (app) {
            Ext.each(controllers, function(controlName) {
                controller = {
                    application : app,
                    name        : controlName
                };

                controller = me.addController(controller);
            });

            delete me.appControllers;

            Ext.applyIf(app, {
                subApplications : Ext.create('Ext.util.MixedCollection')
            });

            subapp = me.addSubApplication(me);
        }

        me.beforeLaunch.call(me.scope || me);

        if (loadMask) {
            loadMask.hide();
        }

        var cmp = me.launch.call(me.scope || me);

        if (cmp) {
            me.cmp = cmp;
            cmp.on('destroy', me.handleSubAppDestroy, me);
        }
    },

    handleSubAppDestroy: function(cmp) {
        var me             = this,
            app            = me.app,
            bus            = app.eventbus,
            appControllers = app.controllers,
            controllers    = me.controllers,
            cssFiles       = me.loadedCSS,
            deleteThis     = false,
            appController, idx;

        controllers.each(function(controller) {
            me.removeController(controller);
        });

        cssFiles.each(function(file) {
            me.removeFile(file);

            cssFiles.remove(file);
        });

        me.removeSubApplication(me);

        me.loadedCSS = null;
        me.loadedJS  = null;
        me = null;
    }
});
