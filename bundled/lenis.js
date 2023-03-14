(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Lenis = factory());
})(this, (function () {
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var version = "1.0.1";

  // Clamp a value between a minimum and maximum value
  function clamp(min, input, max) {
    return Math.max(min, Math.min(input, max));
  }

  // Linearly interpolate between two values using an amount (0 <= amt <= 1)
  function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  // Calculate the modulo of the dividend and divisor while keeping the result within the same sign as the divisor
  function clampedModulo(dividend, divisor) {
    var remainder = dividend % divisor;

    // If the remainder and divisor have different signs, adjust the remainder
    if (divisor > 0 && remainder < 0 || divisor < 0 && remainder > 0) {
      return remainder + divisor;
    }
    return remainder;
  }

  // Animate class to handle value animations with lerping or easing
  var Animate = /*#__PURE__*/function () {
    function Animate() {}
    var _proto = Animate.prototype;
    // Advance the animation by the given delta time
    _proto.advance = function advance(deltaTime) {
      var _this$onUpdate;
      if (!this.isRunning) return;
      var completed = false;
      if (this.lerp) {
        this.value = lerp(this.value, this.to, this.lerp);
        if (Math.round(this.value) === this.to) {
          this.value = this.to;
          completed = true;
        }
      } else {
        this.currentTime += deltaTime;
        var linearProgress = clamp(0, this.currentTime / this.duration, 1);
        completed = linearProgress >= 1;
        var easedProgress = completed ? 1 : this.easing(linearProgress);
        this.value = this.from + (this.to - this.from) * easedProgress;
      }

      // Call the onUpdate callback with the current value and completed status
      (_this$onUpdate = this.onUpdate) == null ? void 0 : _this$onUpdate.call(this, this.value, {
        completed: completed
      });
      if (completed) {
        this.stop();
      }
    }

    // Stop the animation
    ;
    _proto.stop = function stop() {
      this.isRunning = false;
    }

    // Set up the animation from a starting value to an ending value
    // with optional parameters for lerping, duration, easing, and onUpdate callback
    ;
    _proto.fromTo = function fromTo(from, to, _ref) {
      var _ref$lerp = _ref.lerp,
        lerp = _ref$lerp === void 0 ? 0.1 : _ref$lerp,
        _ref$duration = _ref.duration,
        duration = _ref$duration === void 0 ? 1 : _ref$duration,
        _ref$easing = _ref.easing,
        easing = _ref$easing === void 0 ? function (t) {
          return t;
        } : _ref$easing,
        onUpdate = _ref.onUpdate;
      this.from = this.value = from;
      this.to = to;
      this.lerp = lerp;
      this.duration = duration;
      this.easing = easing;
      this.currentTime = 0;
      this.isRunning = true;
      this.onUpdate = onUpdate;
    };
    return Animate;
  }();

  var createNanoEvents = function createNanoEvents() {
    return {
      events: {},
      // Emit an event with the provided arguments
      emit: function emit(event) {
        var callbacks = this.events[event] || [];
        for (var i = 0, length = callbacks.length; i < length; i++) {
          callbacks[i].apply(callbacks, [].slice.call(arguments, 1));
        }
      },
      // Register a callback for the specified event
      on: function on(event, cb) {
        var _this$events,
          _this$events$event,
          _this = this;
        ((_this$events$event = (_this$events = this.events)[event]) != null ? _this$events$event : _this$events[event] = []).push(cb);

        // Return an unsubscribe function
        return function () {
          _this.events[event] = _this.events[event].filter(function (i) {
            return cb !== i;
          });
        };
      }
    };
  };

  var ObservedElement = /*#__PURE__*/function () {
    function ObservedElement(element) {
      this.element = element;

      // If the element is the window, add a resize event listener and trigger it initially
      if (element === window) {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.onWindowResize();
      } else {
        // If the element is not the window, observe its size using ResizeObserver
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
        this.resizeObserver = new ResizeObserver(this.onResize.bind(this));
        this.resizeObserver.observe(this.element);
      }
    }

    // Clean up event listeners and disconnect the ResizeObserver when destroying the instance
    var _proto = ObservedElement.prototype;
    _proto.destroy = function destroy() {
      window.removeEventListener('resize', this.onWindowResize.bind(this));
      this.resizeObserver.disconnect();
    }

    // Update the width and height properties based on the observed element's size
    ;
    _proto.onResize = function onResize(_ref) {
      var entry = _ref[0];
      if (entry) {
        var _entry$contentRect = entry.contentRect,
          width = _entry$contentRect.width,
          height = _entry$contentRect.height;
        this.width = width;
        this.height = height;
      }
    }

    // Update the width and height properties based on the window's size
    ;
    _proto.onWindowResize = function onWindowResize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    };
    return ObservedElement;
  }();

  var VirtualScroll = /*#__PURE__*/function () {
    function VirtualScroll(element, _ref) {
      var _this = this;
      var _ref$wheelMultiplier = _ref.wheelMultiplier,
        wheelMultiplier = _ref$wheelMultiplier === void 0 ? 1 : _ref$wheelMultiplier,
        _ref$touchMultiplier = _ref.touchMultiplier,
        touchMultiplier = _ref$touchMultiplier === void 0 ? 2 : _ref$touchMultiplier,
        _ref$normalizeWheel = _ref.normalizeWheel,
        normalizeWheel = _ref$normalizeWheel === void 0 ? false : _ref$normalizeWheel;
      // Event handler for 'touchstart' event
      this.onTouchStart = function (event) {
        var _ref2 = event.targetTouches ? event.targetTouches[0] : event,
          pageX = _ref2.pageX,
          pageY = _ref2.pageY;
        _this.touchStart.x = pageX;
        _this.touchStart.y = pageY;
      };
      // Event handler for 'touchmove' event
      this.onTouchMove = function (event) {
        var _ref3 = event.targetTouches ? event.targetTouches[0] : event,
          pageX = _ref3.pageX,
          pageY = _ref3.pageY;
        var deltaX = -(pageX - _this.touchStart.x) * _this.touchMultiplier;
        var deltaY = -(pageY - _this.touchStart.y) * _this.touchMultiplier;
        _this.touchStart.x = pageX;
        _this.touchStart.y = pageY;
        _this.emitter.emit('scroll', {
          type: 'touch',
          deltaX: deltaX,
          deltaY: deltaY,
          event: event
        });
      };
      // Event handler for 'wheel' event
      this.onWheel = function (event) {
        var deltaX = event.deltaX,
          deltaY = event.deltaY;
        if (_this.normalizeWheel) {
          deltaX = clamp(-100, deltaX, 100);
          deltaY = clamp(-100, deltaY, 100);
        }
        deltaX *= _this.wheelMultiplier;
        deltaY *= _this.wheelMultiplier;
        _this.emitter.emit('scroll', {
          type: 'wheel',
          deltaX: deltaX,
          deltaY: deltaY,
          event: event
        });
      };
      this.element = element;
      this.wheelMultiplier = wheelMultiplier;
      this.touchMultiplier = touchMultiplier;
      this.normalizeWheel = normalizeWheel;
      this.touchStart = {
        x: null,
        y: null
      };
      this.emitter = createNanoEvents();
      this.element.addEventListener('wheel', this.onWheel, {
        passive: false
      });
      this.element.addEventListener('touchstart', this.onTouchStart, {
        passive: false
      });
      this.element.addEventListener('touchmove', this.onTouchMove, {
        passive: false
      });
    }

    // Add an event listener for the given event and callback
    var _proto = VirtualScroll.prototype;
    _proto.on = function on(event, callback) {
      return this.emitter.on(event, callback);
    }

    // Remove all event listeners and clean up
    ;
    _proto.destroy = function destroy() {
      this.emitter.events = {};
      this.element.removeEventListener('wheel', this.onWheel, {
        passive: false
      });
      this.element.removeEventListener('touchstart', this.onTouchStart, {
        passive: false
      });
      this.element.removeEventListener('touchmove', this.onTouchMove, {
        passive: false
      });
    };
    return VirtualScroll;
  }();

  // Technical explaination
  // - listen to 'wheel' events
  // - prevent 'wheel' event to prevent scroll
  // - normalize wheel delta
  // - add delta to targetScroll
  // - animate scroll to targetScroll (smooth context)
  // - if animation is not running, listen to 'scroll' events (native context)
  var Lenis = /*#__PURE__*/function () {
    // isScrolling = true when scroll is animating
    // isStopped = true if user should not be able to scroll - enable/disable programatically
    // isSmooth = true if scroll should be animated
    // isLocked = same as isStopped but enabled/disabled when scroll reaches target

    /**
     * @typedef {(t: number) => number} EasingFunction
     * @typedef {'vertical' | 'horizontal'} Orientation
     * @typedef {'vertical' | 'horizontal' | 'both'} GestureOrientation
     *
     * @typedef LenisOptions
     * @property {Orientation} [direction]
     * @property {GestureOrientation} [gestureDirection]
     * @property {number} [mouseMultiplier]
     * @property {boolean} [smooth]
     *
     * @property {Window | HTMLElement} [wrapper]
     * @property {HTMLElement} [content]
     * @property {boolean} [smoothWheel]
     * @property {boolean} [smoothTouch]
     * @property {number} [duration]
     * @property {EasingFunction} [easing]
     * @property {number} [lerp]
     * @property {boolean} [infinite]
     * @property {Orientation} [orientation]
     * @property {GestureOrientation} [gestureOrientation]
     * @property {number} [touchMultiplier]
     * @property {number} [wheelMultiplier]
     * @property {boolean} [normalizeWheel]
     *
     * @param {LenisOptions}
     */
    function Lenis(_temp) {
      var _ref = _temp === void 0 ? {} : _temp,
        direction = _ref.direction,
        gestureDirection = _ref.gestureDirection,
        mouseMultiplier = _ref.mouseMultiplier,
        smooth = _ref.smooth,
        _ref$wrapper = _ref.wrapper,
        wrapper = _ref$wrapper === void 0 ? window : _ref$wrapper,
        _ref$content = _ref.content,
        content = _ref$content === void 0 ? document.documentElement : _ref$content,
        _ref$smoothWheel = _ref.smoothWheel,
        smoothWheel = _ref$smoothWheel === void 0 ? smooth != null ? smooth : true : _ref$smoothWheel,
        _ref$smoothTouch = _ref.smoothTouch,
        smoothTouch = _ref$smoothTouch === void 0 ? false : _ref$smoothTouch,
        duration = _ref.duration,
        _ref$easing = _ref.easing,
        easing = _ref$easing === void 0 ? function (t) {
          return Math.min(1, 1.001 - Math.pow(2, -10 * t));
        } : _ref$easing,
        _ref$lerp = _ref.lerp,
        lerp = _ref$lerp === void 0 ? duration ? null : 0.1 : _ref$lerp,
        _ref$infinite = _ref.infinite,
        infinite = _ref$infinite === void 0 ? false : _ref$infinite,
        _ref$orientation = _ref.orientation,
        orientation = _ref$orientation === void 0 ? direction != null ? direction : 'vertical' : _ref$orientation,
        _ref$gestureOrientati = _ref.gestureOrientation,
        gestureOrientation = _ref$gestureOrientati === void 0 ? gestureDirection != null ? gestureDirection : 'vertical' : _ref$gestureOrientati,
        _ref$touchMultiplier = _ref.touchMultiplier,
        touchMultiplier = _ref$touchMultiplier === void 0 ? 2 : _ref$touchMultiplier,
        _ref$wheelMultiplier = _ref.wheelMultiplier,
        wheelMultiplier = _ref$wheelMultiplier === void 0 ? mouseMultiplier != null ? mouseMultiplier : 1 : _ref$wheelMultiplier,
        _ref$normalizeWheel = _ref.normalizeWheel,
        normalizeWheel = _ref$normalizeWheel === void 0 ? true : _ref$normalizeWheel;
      // warn about legacy options
      if (direction) {
        console.warn('Lenis: `direction` option is deprecated, use `orientation` instead');
      }
      if (gestureDirection) {
        console.warn('Lenis: `gestureDirection` option is deprecated, use `gestureOrientation` instead');
      }
      if (mouseMultiplier) {
        console.warn('Lenis: `mouseMultiplier` option is deprecated, use `wheelMultiplier` instead');
      }
      if (smooth) {
        console.warn('Lenis: `smooth` option is deprecated, use `smoothWheel` instead');
      }
      window.lenisVersion = version;

      // if wrapper is html or body, fallback to window
      if (wrapper === document.documentElement || wrapper === document.body) {
        wrapper = window;
      }
      this.options = {
        wrapper: wrapper,
        content: content,
        smoothWheel: smoothWheel,
        smoothTouch: smoothTouch,
        duration: duration,
        easing: easing,
        lerp: lerp,
        infinite: infinite,
        gestureOrientation: gestureOrientation,
        orientation: orientation,
        touchMultiplier: touchMultiplier,
        wheelMultiplier: wheelMultiplier,
        normalizeWheel: normalizeWheel
      };
      this.wrapper = new ObservedElement(wrapper);
      this.content = new ObservedElement(content);
      this.rootElement.classList.add('lenis');
      this.velocity = 0;
      this.isStopped = false;
      this.isSmooth = smoothWheel || smoothTouch;
      this.isScrolling = false;
      this.targetScroll = this.animatedScroll = this.actualScroll;
      this.animate = new Animate();
      this.emitter = createNanoEvents();
      this.plugins = [];
      this.wrapper.element.addEventListener('scroll', this.onScroll, {
        passive: false
      });
      this.virtualScroll = new VirtualScroll(wrapper, {
        touchMultiplier: touchMultiplier,
        wheelMultiplier: wheelMultiplier,
        normalizeWheel: normalizeWheel
      });
      this.virtualScroll.on('scroll', this.onVirtualScroll);
      this.initializePlugins();
    }
    var _proto = Lenis.prototype;
    _proto.destroy = function destroy() {
      this.emitter.events = {};
      this.wrapper.element.removeEventListener('scroll', this.onScroll, {
        passive: false
      });
      this.virtualScroll.destroy();
    };
    _proto.on = function on(event, callback) {
      return this.emitter.on(event, callback);
    };
    _proto.off = function off(event, callback) {
      var _this$emitter$events$;
      this.emitter.events[event] = (_this$emitter$events$ = this.emitter.events[event]) == null ? void 0 : _this$emitter$events$.filter(function (i) {
        return callback !== i;
      });
    };
    _proto.setScroll = function setScroll(scroll) {
      // apply scroll value immediately
      if (this.isHorizontal) {
        this.rootElement.scrollLeft = scroll;
      } else {
        this.rootElement.scrollTop = scroll;
      }
    };
    _proto.onVirtualScroll = function onVirtualScroll(_ref2) {
      var type = _ref2.type,
        deltaX = _ref2.deltaX,
        deltaY = _ref2.deltaY,
        event = _ref2.event;
      // keep zoom feature
      if (event.ctrlKey) return;

      // keep previous/next page gesture on trackpads
      if (this.options.gestureOrientation === 'vertical' && deltaY === 0 || this.options.gestureOrientation === 'horizontal' && deltaX === 0) return;

      // catch if scrolling on nested scroll elements
      if (!!event.composedPath().find(function (node) {
        return node == null ? void 0 : node.hasAttribute == null ? void 0 : node.hasAttribute('data-lenis-prevent');
      })) return;
      if (this.isStopped || this.isLocked) {
        event.preventDefault();
        return;
      }
      this.isSmooth = this.options.smoothTouch && type === 'touch' || this.options.smoothWheel && type === 'wheel';
      if (!this.isSmooth) {
        this.isScrolling = false;
        this.animate.stop();
        return;
      }
      event.preventDefault();
      var delta = deltaY;
      if (this.options.gestureOrientation === 'both') {
        delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
      } else if (this.options.gestureOrientation === 'horizontal') {
        delta = deltaX;
      }
      this.scrollTo(this.targetScroll + delta, {
        programmatic: false
      });
    };
    _proto.emit = function emit() {
      this.emitter.emit('scroll', this);
    };
    _proto.onScroll = function onScroll() {
      if (!this.isScrolling) {
        var lastScroll = this.animatedScroll;
        this.animatedScroll = this.targetScroll = this.actualScroll;
        this.velocity = 0;
        this.direction = Math.sign(this.animatedScroll - lastScroll);
        this.emit();
      }
    };
    _proto.reset = function reset() {
      this.isLocked = false;
      this.isScrolling = false;
      this.velocity = 0;
    };
    _proto.start = function start() {
      this.isStopped = false;
      this.reset();
    };
    _proto.stop = function stop() {
      this.isStopped = true;
      this.animate.stop();
      this.reset();
    };
    _proto.raf = function raf(time) {
      var deltaTime = time - (this.time || time);
      this.time = time;
      this.animate.advance(deltaTime * 0.001);
    };
    _proto.scrollTo = function scrollTo(target, _temp2) {
      var _this = this;
      var _ref3 = _temp2 === void 0 ? {} : _temp2,
        _ref3$offset = _ref3.offset,
        offset = _ref3$offset === void 0 ? 0 : _ref3$offset,
        _ref3$immediate = _ref3.immediate,
        immediate = _ref3$immediate === void 0 ? false : _ref3$immediate,
        _ref3$lock = _ref3.lock,
        lock = _ref3$lock === void 0 ? false : _ref3$lock,
        _ref3$duration = _ref3.duration,
        duration = _ref3$duration === void 0 ? this.options.duration : _ref3$duration,
        _ref3$easing = _ref3.easing,
        easing = _ref3$easing === void 0 ? this.options.easing : _ref3$easing,
        _ref3$lerp = _ref3.lerp,
        lerp = _ref3$lerp === void 0 ? !duration && this.options.lerp : _ref3$lerp,
        onComplete = _ref3.onComplete,
        _ref3$force = _ref3.force,
        force = _ref3$force === void 0 ? false : _ref3$force,
        _ref3$programmatic = _ref3.programmatic,
        programmatic = _ref3$programmatic === void 0 ? true : _ref3$programmatic;
      if (this.isStopped && !force) return;

      // keywords
      if (['top', 'left', 'start'].includes(target)) {
        target = 0;
      } else if (['bottom', 'right', 'end'].includes(target)) {
        target = this.limit;
      } else {
        var _target;
        var node;
        if (typeof target === 'string') {
          // CSS selector
          node = document.querySelector(target);
        } else if ((_target = target) != null && _target.nodeType) {
          // Node element
          node = target;
        }
        if (node) {
          if (this.wrapper.element !== window) {
            // nested scroll offset correction
            var wrapperRect = this.wrapper.element.getBoundingClientRect();
            offset -= this.isHorizontal ? wrapperRect.left : wrapperRect.top;
          }
          var rect = node.getBoundingClientRect();
          target = (this.isHorizontal ? rect.left : rect.top) + this.animatedScroll;
        }
      }
      if (typeof target !== 'number') return;
      target += offset;
      target = Math.round(target);
      if (this.options.infinite) {
        if (programmatic) {
          this.targetScroll = this.animatedScroll = this.scroll;
        }
      } else {
        target = clamp(0, target, this.limit);
      }
      if (immediate) {
        this.animatedScroll = this.targetScroll = target;
        this.setScroll(this.scroll);
        this.animate.stop();
        this.reset();
        this.emit();
        onComplete == null ? void 0 : onComplete();
        return;
      }
      if (!programmatic) {
        this.targetScroll = target;
      }
      this.animate.fromTo(this.animatedScroll, target, {
        duration: duration,
        easing: easing,
        lerp: lerp,
        onUpdate: function onUpdate(value, _ref4) {
          var completed = _ref4.completed;
          // started
          if (lock) _this.isLocked = true;
          _this.isScrolling = true;

          // updated
          _this.velocity = value - _this.animatedScroll;
          _this.direction = Math.sign(_this.velocity);
          _this.animatedScroll = value;
          _this.setScroll(_this.scroll);
          if (programmatic) {
            // wheel during programmatic should stop it
            _this.targetScroll = value;
          }

          // completed
          if (completed) {
            if (lock) _this.isLocked = false;
            requestAnimationFrame(function () {
              //avoid double scroll event
              _this.isScrolling = false;
            });
            _this.velocity = 0;
            onComplete == null ? void 0 : onComplete();
          }
          _this.emit();
        }
      });
    };
    _proto.registerPlugin = function registerPlugin(plugin) {
      if (typeof plugin !== 'function') {
        throw new Error('Plugin must be a function');
      }
      this.plugins.push(plugin);
    };
    _proto.initializePlugins = function initializePlugins() {
      var _this2 = this;
      this.plugins.forEach(function (plugin) {
        plugin(_this2);
      });
    };
    _createClass(Lenis, [{
      key: "rootElement",
      get: function get() {
        return this.wrapper.element === window ? this.content.element : this.wrapper.element;
      }
    }, {
      key: "limit",
      get: function get() {
        return Math.round(this.isHorizontal ? this.content.width - this.wrapper.width : this.content.height - this.wrapper.height);
      }
    }, {
      key: "isHorizontal",
      get: function get() {
        return this.options.orientation === 'horizontal';
      }
    }, {
      key: "actualScroll",
      get: function get() {
        // value browser takes into account
        return this.isHorizontal ? this.rootElement.scrollLeft : this.rootElement.scrollTop;
      }
    }, {
      key: "scroll",
      get: function get() {
        return this.options.infinite ? clampedModulo(this.animatedScroll, this.limit) : this.animatedScroll;
      }
    }, {
      key: "progress",
      get: function get() {
        return this.scroll / this.limit;
      }
    }, {
      key: "isSmooth",
      get: function get() {
        return this.__isSmooth;
      },
      set: function set(value) {
        if (this.__isSmooth !== value) {
          this.rootElement.classList.toggle('lenis-smooth', value);
          this.__isSmooth = value;
        }
      }
    }, {
      key: "isScrolling",
      get: function get() {
        return this.__isScrolling;
      },
      set: function set(value) {
        if (this.__isScrolling !== value) {
          this.rootElement.classList.toggle('lenis-scrolling', value);
          this.__isScrolling = value;
        }
      }
    }, {
      key: "isStopped",
      get: function get() {
        return this.__isStopped;
      },
      set: function set(value) {
        if (this.__isStopped !== value) {
          this.rootElement.classList.toggle('lenis-stopped', value);
          this.__isStopped = value;
        }
      }
    }]);
    return Lenis;
  }();

  return Lenis;

}));
