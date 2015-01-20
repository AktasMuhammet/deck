'use strict';



angular.module('deckApp')
  .config(function ($logProvider, statesProvider) {
    statesProvider.setStates();
    $logProvider.debugEnabled(true);
  })
  .config(function(uiSelectConfig) {
    uiSelectConfig.theme = 'select2';
  })
  .config(function($tooltipProvider) {
    $tooltipProvider.options({
      appendToBody: true
    });
    $tooltipProvider.setTriggers({
      'mouseenter focus': 'mouseleave blur'
    });
  })
  .config(function($modalProvider) {
    $modalProvider.options.backdrop = 'static';
    $modalProvider.options.keyboard = false;
  })
  .config(function(RestangularProvider, settings) {
    RestangularProvider.setBaseUrl(settings.gateUrl);
  })
  .config(function($httpProvider){
    $httpProvider.interceptors.push('ajaxErrorInterceptor');
  })
  .config(function($provide) {
    $provide.decorator('$exceptionHandler', function ($delegate, $analytics) {
      return function (exception, cause) {
        var action = 'msg: ' + exception.message + ' url: ' + window.location;
        var label = exception.stack.toString();

        $analytics.eventTrack(action, {category: 'JavaScript Error', label: label, noninteraction: true});
        $delegate(exception, cause);
      };
    });
  })
;
