/**
 * @author Chetan Sachdev <mail@chetansachdev.com>
 * @listens ecmlpreview:show
 */
org.ekstep.contenteditor.basePlugin.extend({
    /**
     *   @member type {String} plugin title
     *   @memberof ecmlpreview
     *
     */
    type: 'preview',
    canvasOffset: undefined,
    /**
     *   @member previewURL {String} reverse proxy URL
     *   @memberof ecmlpreview
     *
     */
    previewURL: '/content/preview/preview.html?webview=true',
    /**
     *   @member contentBody {Object} content body for preview
     *   @memberof Preview
     *
     */
    contentBody: undefined,
    /**
     *   registers events
     *   @memberof preview
     *
     */
    initialize: function() {
        var instance = this;
        org.ekstep.contenteditor.api.addEventListener("ecmlpreview:show", instance.initPreview, this);
        setTimeout(function() {
            Mousetrap.bind(['ctrl+enter', 'command+enter'], function(){
                instance.launchPreview(true)
            });
            Mousetrap.bind(['ctrl+shift+enter', 'command+shift+enter'], function(){
                instance.launchPreview(false)
            });
            alert("Events registered!!");
        }, 1000);

        this.canvasOffset = org.ekstep.contenteditor.api.jQuery('#canvas').offset();

        var templatePath = org.ekstep.contenteditor.api.resolvePluginResource(this.manifest.id, this.manifest.ver, "editor/ecmlpreview.html");
        org.ekstep.contenteditor.api.getService('popup').loadNgModules(templatePath);
    },
    launchPreview: function(currentStage) {
        org.ekstep.contenteditor.api.getCanvas().deactivateAll().renderAll();
        org.ekstep.pluginframework.eventManager.dispatchEvent("ecmlpreview:show", { contentBody: org.ekstep.contenteditor.stageManager.toECML(), 'currentStage': currentStage });
        // org.ekstep.contenteditor.api.dispatchEvent('config:settings:show', { id: org.ekstep.contenteditor.api.getCurrentStage().id });
    },
    /**
     *
     *   @param event {Object} event object from event bus.
     *   @param data {Object} ecml
     *   @memberof preview
     */
    initPreview: function(event, data) {
        var instance = this;
        instance.contentBody = data.contentBody;
        if (data.currentStage) {
            this.contentBody.theme.startStage = org.ekstep.contenteditor.api.getCurrentStage().id;
        }
        this.showPreview();
    },
    /**     
     *   @memberof preview
     */
    showPreview: function() {
        console.log(this.previewURL);
        var instance = this;
        var contentService = org.ekstep.contenteditor.api.getService('content');
        var meta = org.ekstep.contenteditor.api.getService('content').getContentMeta(org.ekstep.contenteditor.api.getContext('contentId'));
        var modalController = function($scope) {
            $scope.$on('ngDialog.opened', function() {

                var $element = $('input[type="range"]');
                var $handle;

                $element.rangeslider({
                    polyfill: false,
                    onInit: function() {
                        $handle = $('.rangeslider__handle', this.$range);
                        updateHandle($handle[0], this.value);
                    },
                    onSlide: function(position, value) {
                        jQuery('.preview').css('opacity', value);
                    }
                }).on('input', function() {
                    updateHandle($handle[0], this.value);
                });

                function updateHandle(el, val) {
                    el.textContent = val;
                }

                var marginX = 140;
                var marginY = 48;
                var changePosition = function(l, t) {
                    xVal = l - marginX;
                    yVal = t - marginY;
                    jQuery('.frame').offset({
                        left: xVal,
                        top: yVal
                    });
                }

                var previewContentIframe = org.ekstep.contenteditor.api.jQuery('#previewContentIframe')[0];
                previewContentIframe.src = instance.previewURL;
                meta.contentMeta = _.isUndefined(meta.contentMeta) ? null : meta.contentMeta;
                changePosition(instance.canvasOffset.left, instance.canvasOffset.top);
                previewContentIframe.onload = function() {
                    var configuration = {};
                    var userData = {};
                    userData.etags = ecEditor.getContext('etags') || [];
                    configuration.context = {
                    	'mode':'edit',
                    	'contentId':ecEditor.getContext('contentId'),
                    	'sid':ecEditor.getContext('sid'),
                    	'uid': ecEditor.getContext('uid'), 
	                    'channel': ecEditor.getContext('channel') || "in.ekstep", 
	                    'pdata': ecEditor.getContext('pdata') || {id: "in.ekstep", pid: "", ver: "1.0"}, 
	                    'app': userData.etags.app || [], 
	                    'dims': userData.etags.dims || [], 
	                    'partner': userData.etags.partner || []
                    }; 
                    if (ecEditor.getConfig('previewConfig')) {
                    	configuration.config = ecEditor.getConfig('previewConfig');
                	} else {
                    	configuration.config = {showEndpage:true};
                	}
                    configuration.metadata = meta.contentMeta; configuration.data = instance.contentBody;
                    previewContentIframe.contentWindow.initializePreview(configuration);
                };
            });
        };

        org.ekstep.contenteditor.api.getService('popup').open({
            template: 'partials.ecmlpreview.html',
            controller: ['$scope', modalController],
            showClose: false,
            width: 900,
            className: 'ngdialog-theme-plain'
        });

    }
});

//# sourceURL=previewplugin.js
