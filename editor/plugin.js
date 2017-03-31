/**
 * @author Chetan Sachdev <mail@chetansachdev.com>
 * @listens atpreview:show
 */
EkstepEditor.basePlugin.extend({
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
    previewURL: 'https://dev.ekstep.in/assets/public/preview/preview.html?webview=true',
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
        EkstepEditorAPI.addEventListener("atpreview:show", instance.initPreview, instance);
        setTimeout(function() {
            Mousetrap.bind(['ctrl+enter', 'command+enter'], function() {
                // alert("Command + Enter");
                instance.initPreview(undefined, instance);
            });
            Mousetrap.bind(['ctrl+shift+enter', 'command+shift+enter'], function() {
                // instance.initPreview(undefined, instance);
            });
            alert("Events registered!!");
        }, 1000);

        this.canvasOffset = EkstepEditorAPI.jQuery('#canvas').offset();

        var templatePath = EkstepEditorAPI.resolvePluginResource(this.manifest.id, this.manifest.ver, "editor/ecmlpreview.html");
        EkstepEditorAPI.getService('popup').loadNgModules(templatePath);
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
            this.contentBody.theme.startStage = EkstepEditorAPI.getCurrentStage().id;
        }
        this.showPreview();
    },
    /**     
     *   @memberof preview
     */
    showPreview: function() {
        console.log(this.previewURL);
        var instance = this;
        var contentService = EkstepEditorAPI.getService('content');
        var meta = EkstepEditorAPI.getService('content').getContentMeta(EkstepEditorAPI.getContext('contentId'));
        var modalController = function($scope) {
            $scope.$on('ngDialog.opened', function() {

                var $element = jQuery('input[type="range"]');
                var $output = jQuery('output');
                function updateOutput(el, val) {
                    el.textContent = val;
                }
                $element.rangeslider({
                    polyfill: false,
                    onInit: function() {
                        updateOutput($output[0], this.value);
                    }
                }).on('input', function() {
                    updateOutput($output[0], this.value);
                });

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

                var previewContentIframe = EkstepEditorAPI.jQuery('#previewContentIframe')[0];
                previewContentIframe.src = instance.previewURL;
                meta.contentMeta = _.isUndefined(meta.contentMeta) ? null : meta.contentMeta;
                changePosition(instance.canvasOffset.left, instance.canvasOffset.top);
                previewContentIframe.onload = function() {
                    previewContentIframe.contentWindow.setContentData(meta.contentMeta, instance.contentBody, { "showStartPage": true, "showEndPage": true });
                };
            });
        };

        EkstepEditorAPI.getService('popup').open({
            template: 'partials.ecmlpreview.html',
            controller: ['$scope', modalController],
            showClose: false,
            width: 900,
            className: 'ngdialog-theme-plain'
        });

    }
});

//# sourceURL=previewplugin.js
