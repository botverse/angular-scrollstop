/**
 * @ngdoc module
 * @name hg.scrollStop.events
 *
 * @description
 * Module containing the service for the scrollstop and start functions.
 */
angular.module('hg.scrollStop.events', [
  'hg.scrollStop.utils'
])


  /**
   * @ngdoc constant
   * @name hg.scrollStop.events:hgScrollLatency
   *
   * @description
   * Latency for the scrolling timeouts.
   */
  .constant('hgScrollLatency', {
    start: 150,
    stop: 150
  })


  /**
   * @ngdoc service
   * @name hg.scrollStop.events:hgEvent
   *
   * @requires $rootScope
   * @requires $timeout
   * @requires hg.scrollSop.events:HgEvent
   * @requires hg.scrollStop.utils:hgUtils
   * @requires hg.scrollStop.events:hgScrollLatency
   *
   * @description
   * This event service provides two functions; scrollstart and scrollstop.
   * Each can execute a callback function and broadcast an event down the scope
   * of the element the event is attached to.
   *
   * ### Usage
   * You can pass an element as the first argument to attach the scroll event
   * to, and a callback function as the second argument.
   *
   * ```js
   * hgScrollEvent.scrollstop(element, function() {
   *   // Callback stuff here.
   * });
   * ```
   *
   * You can just pass a callback function to one of the scroll methods and it
   * will attach the event to $document.
   *
   * ```js
   * hgScrollEvent.scrollstop(function() {
   *   // Callback stuff here.
   * });
   * ```
   * You can supply just an element argument and it will broadcast the scroll
   * event down the scope of that element, and perform no callback.
   *
   * ```js
   * hgScrollEvent.scrollstop(element);
   * ```
   *
   * You can supply no arguments and it will broadcast the scroll events down
   * through the $document scope and perform to callbacks.
   *
   * ```js
   * hgScrollEvent.scrollstop();
   * ```
   *
   * Using the events: Simply add a listener to an element in the scope of the
   * event being broadcast. For example using the above method (with no
   * paramters) add to any directive/controller:
   * ```js
   * ($)scope.$on('scrollstop', function() {
   *   // Callback stuff here.
   * });
   * ```
   *
   * See the directive documentation for attaching functionality directly to
   * elements.
   */
  .service('hgScrollEvent'
      , function($timeout, HgEvent, hgUtils, hgScrollLatency) {

    /**
     * @doc method
     * @methodOf hg.scrollStop.events:hgEvent
     * @name scrollstart
     *
     * @description
     * Fires an event and executes a callback function (if one exists) when
     * scrolling starts.
     *
     * @param {HTMLElement|function} element Either the element to target
     *        for the scroll start event or the callback function.
     * @param {function} fn Callback function.
     */
    this.scrollstart = function(element, fn) {
      var params = hgUtils.checkParams(element, fn)
        , scope
        , timer
        , bindFn
        , unbindFn
        , event
        , eventData = {};

      element = params.element;
      fn = params.fn;
      scope = params.scope;

      // Event
      eventData.name = 'scrollstart';
      eventData.target = element;
      eventData.start = hgUtils.getScrollTop(element);

      // Unbind function.
      unbindFn = function() {
        element.unbind('scroll', bindFn);
      };

      // Bind function.
      bindFn = function() {
        eventData.end = hgUtils.getScrollTop(element);

        if (timer) {
          $timeout.cancel(timer);
        } else {
          event = new HgEvent(eventData);

          scope.$apply(function() {
            fn(event);
            scope.$broadcast(eventData.name, event);
          });
        }

        timer = $timeout(function() {
          timer = null;
          eventData.start = eventData.end;
        }, hgScrollLatency.start);

        // Remove the event when scope is destroyed.
        scope.$on('$destroy', unbindFn);
      };

      // Kick it off.
      element.bind('scroll', bindFn);
    };


    /**
     * @doc method
     * @methodOf hg.scrollStop.events:hgEvent
     * @name scrollstop
     *
     * @description
     * Fires an event and executes a callback function (if one exists) when
     * scrolling stops.
     *
     * @param {HTMLElement|function} element Either the element to target
     *        for the scroll stop event or the callback function.
     * @param {function} fn Callback function.
     */
    this.scrollstop = function(element, fn) {
      var params = hgUtils.checkParams(element, fn)
        , scope
        , timer
        , bindFn
        , unbindFn
        , event
        , eventData = {};

      // Params
      element = params.element;
      fn = params.fn;
      scope = params.scope;

      // Event
      eventData.name = 'scrollstop';
      eventData.target = element;

      // Unbind function.
      unbindFn = function() {
        element.unbind('scroll', bindFn);
      };

      // Bind function.
      bindFn = function() {
        if (timer) $timeout.cancel(timer);
        eventData.start = eventData.start || hgUtils.getScrollTop(element);

        timer = $timeout(function() {
          timer = null;
          eventData.end = hgUtils.getScrollTop(element);
          event = new HgEvent(eventData);
          eventData.start = null;

          scope.$apply(function() {
            fn(event);
            scope.$broadcast(eventData.name, event);
          });
        }, hgScrollLatency.stop);

        // Remove the event when scope is destroyed.
        scope.$on('$destroy', unbindFn);
      };

      // Kick it off.
      element.bind('scroll', bindFn);
    };
  })


  /**
   * @ngdoc service
   * @name hg.scrollStop.events:HgEvent
   *
   * @description
   * Event object that is dispatched with scrollstart and scrollstop.
   *
   * ```js
   * {
   *   name: String, // Event name,
   *   target: JQLiteElement, // Element of scroll target
   *   startY: Number, // Start position of the scroll
   *   endY: Number, // End position of the scroll
   *   direction: String // Direction user scrolled in
   * }
   * ```
   */
  .factory('HgEvent', function() {
    function HgEvent(eventData) {
      this.name = eventData.name;
      this.target = eventData.target;

      if (eventData.start !== undefined && eventData.end !== undefined) {
        this.startY = eventData.start;
        this.endY = eventData.end;
        this.direction = this.startY < this.endY ? 'down' : 'up';
      }
    }

    return HgEvent;
  });
