'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var Timeline = (function (_Messenger) {
  function Timeline(opts) {
    _classCallCheck(this, Timeline);

    _get(Object.getPrototypeOf(Timeline.prototype), 'constructor', this).call(this);
    if (!opts) {
      this.log('opts is undefined, need a parent id', 1);return;
    }

    this.border = opts.border;
    this.color = 'red';
    this.cached = [];
    this.cacheColor = 'red';
    this.playing = false;
    this.playInterval = undefined;
    this.animation = opts.animation;
    this.keyframes = opts.keyframes;
    this.tweenframes = opts.tweenframes;
    this.looptweens = opts.looptweens;
    this.currentKeyframe = 0;
    this.currentFrame = parseInt(this.keyframes[0]);
    this.currentYoffset = window.pageYOffset;
    this.ready = false;
    this.disabled = false;
    this.quedPlay = false;
    this.looping = false;
    this.stopLoopDirection = 1;
    this.enabled = true;
    this.scrollDirection = 1;

    var self = this;
    self.fps = opts.fps;
    self._setURL();
    self._cache();
    self.keyframes[self.keyframes.length - 1] -= 1;

    if (this.border) {
      $jq('#timeline').append('<div style="display: none;" class="black-to-transparent-gradient-top"></div>').append('<div style="display: none;" class="black-to-transparent-gradient-bottom"></div>').append('<div style="display: none;" class="black-to-transparent-gradient-left"></div>').append('<div style="display: none;" class="black-to-transparent-gradient-right"></div>');
    }

    var initInterval = setInterval(function () {
      if (self.redraw()) clearInterval(initInterval);
    }, 200);
  }

  _inherits(Timeline, _Messenger);

  _createClass(Timeline, [{
    key: 'init',
    value: function init() {
      var self = this;
      var initInterval = setInterval(function () {
        if (self.redraw()) clearInterval(initInterval);
      }, 200);
      $jq(window).resize(self.redraw);
    }
  }, {
    key: 'redraw',
    value: function redraw() {
      var menuSize = isPhone ? 50 : 116;
      var width = $jq(window).width();
      var height = $jq(window).height() - menuSize;
      var viewportAspect = width / height;
      var imageAspect = 16 / 9;
      if (isNaN(imageAspect) || !imageAspect) {
        return false;
      }var mod = 1;

      $jq('.black-to-transparent-gradient-top,.black-to-transparent-gradient-bottom,.black-to-transparent-gradient-left,.black-to-transparent-gradient-right').removeClass('timeline-ignore');
      if (viewportAspect > imageAspect) {
        $jq('.black-to-transparent-gradient-top,.black-to-transparent-gradient-bottom').addClass('timeline-ignore').fadeOut();
        var nheight = height * mod;
        var nwidth = height * imageAspect * mod;
        var hdiff = nheight - height;
        var wdiff = nwidth - width;
        $jq('#timeline').css({
          height: nheight,
          width: nwidth,
          top: menuSize - hdiff / 2,
          left: -wdiff / 2
        });
      } else if (viewportAspect < imageAspect) {
        $jq('.black-to-transparent-gradient-left,.black-to-transparent-gradient-right').addClass('timeline-ignore').fadeOut();
        var nheight = width / imageAspect * mod;
        var nwidth = width * mod;
        var hdiff = nheight - height;
        var wdiff = nwidth - width;
        $jq('#timeline').css({
          height: nheight,
          width: nwidth,
          top: menuSize - hdiff / 2,
          left: -wdiff / 2
        });
      } else {
        var nheight = height * mod;
        var nwidth = width * mod;
        var hdiff = nheight - height;
        var wdiff = nwidth - width;
        $jq('#timeline').css({
          height: nheight,
          width: nwidth,
          top: menuSize - hdiff / 2,
          left: -wdiff / 2
        });
      }
      return true;
    }
  }, {
    key: 'showBorder',
    value: function showBorder() {
      var show = arguments[0] === undefined ? 1 : arguments[0];

      if (show) {
        $jq('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeIn();
      } else {
        $jq('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeOut();
      }
    }
  }, {
    key: 'hideBorder',
    value: function hideBorder() {
      var hide = arguments[0] === undefined ? 1 : arguments[0];

      if (hide) {
        $jq('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeOut();
      } else {
        $jq('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeIn();
      }
    }
  }, {
    key: 'next',
    value: function next() {
      this.playTo(this.currentKeyframe + 1);
    }
  }, {
    key: 'prev',
    value: function prev() {
      this.playTo(this.currentKeyframe - 1);
    }
  }, {
    key: 'playTo',
    value: function playTo(id) {
      var self = this;
      if (id < 0 || id >= self.keyframes.length || id == self.currentKeyframe || self.playing || self.playInterval) {
        return false;
      }self.clearAnimation();
      var lastFrame = self.currentKeyframe;
      self.currentKeyframe = id;

      var speed = 1;
      speed = Math.abs(self.keyframes[lastFrame] - self.keyframes[id]) / self.fps;
      self.log('playing to keyframe #' + id + ', frame #' + self.keyframes[id]);
      self.keyframes[id] < self.keyframes[lastFrame] ? self.play(self.keyframes[id], 0, speed) : self.play(self.keyframes[id], 1, speed);
      return true;
    }
  }, {
    key: 'play',
    value: function play(val, direction, speed) {
      var self = this;
      if ((self.playing || self.playInterval || self.disabled) && !self.looping) {
        return;
      }self.playing = true;
      self.animating = true;
      $jq('#timeline .timeline-frame').removeClass('old');
      self.emit('play');

      direction = direction ? 1 : -1;
      var delta = Math.round(speed) > 3 ? 3 * direction : direction; //skip some frames if playing super fast
      resetInterval();

      //call any function registered to trigger on the current index
      if (direction == 1 && self.animation) {
        if (self.animation[self.currentKeyframe] && typeof self.animation[self.currentKeyframe] === 'object') {
          for (var j in self.animation[self.currentKeyframe]) {
            if (typeof self.animation[self.currentKeyframe][j].startDown === 'function') {
              self.animation[self.currentKeyframe][j].startDown.call();
            }
          }
        }
      }
      //call any function registered to trigger on the current index
      if ((direction == 0 || direction == -1) && self.animation) {
        if (self.animation[self.currentKeyframe + 1] && typeof self.animation[self.currentKeyframe + 1] === 'object') {
          for (var j in self.animation[self.currentKeyframe + 1]) {
            if (typeof self.animation[self.currentKeyframe + 1][j].startUp === 'function') {
              self.animation[self.currentKeyframe + 1][j].startUp.call();
            }
          }
        }
      }

      function resetInterval() {
        var allowReset = arguments[0] === undefined ? true : arguments[0];

        clearInterval(self.playInterval);
        self.playInterval = setInterval(function () {
          var lastFrame = self.currentFrame;
          if (self.currentFrame + delta > self.keyframes[self.currentKeyframe] && delta > 0 || self.currentFrame + delta < self.keyframes[self.currentKeyframe] && delta < 0) self.currentFrame = self.keyframes[self.currentKeyframe];else self.currentFrame += delta;

          if ((direction == 1 && self.currentFrame > self.keyframes[self.currentKeyframe - 1] || direction == -1 && self.currentFrame <= self.keyframes[self.currentKeyframe + 1]) && allowReset) resetInterval(1, false);
          var loopFrameIndex = self._hasTweenFrame();
          var loopFrame = loopFrameIndex == -1 ? false : self.tweenframes[loopFrameIndex];

          //call any function registered to trigger on the current index
          if (direction == 1 && self.currentFrame > parseInt(val) - 1 || direction == -1 && self.currentFrame < parseInt(val) + 1 || direction == -1 && loopFrame && loopFrameIndex > -1 && self.currentFrame <= loopFrame) {
            if (direction == 1 && self.animation) {
              if (self.animation[self.currentKeyframe] && typeof self.animation[self.currentKeyframe] === 'object') {
                for (var i in self.animation[self.currentKeyframe]) {
                  if (typeof self.animation[self.currentKeyframe][i].endDown === 'function') {
                    self.animation[self.currentKeyframe][i].endDown.call();
                  }
                }
              }
            }
            //call any function registered to trigger on the current index
            if ((direction == -1 || direction == 0) && self.animation) {
              if (self.animation[self.currentKeyframe + 1] && typeof self.animation[self.currentKeyframe + 1] === 'object') {
                for (var i in self.animation[self.currentKeyframe + 1]) {
                  if (typeof self.animation[self.currentKeyframe + 1][i].endUp === 'function') {
                    self.animation[self.currentKeyframe + 1][i].endUp.call();
                  }
                }
              }
            }

            if (Math.abs(self.currentFrame - parseInt(val)) <= 1) self.currentFrame = parseInt(val);
            //do the animation
            $jq('#timeline .timeline-frame-' + self.currentFrame).css({ zIndex: '2', display: 'block' });
            $jq('#timeline .timeline-frame').not('#timeline .timeline-frame-' + self.currentFrame).css({ zIndex: '1', display: 'none' });
            $jq('#timeline .timeline-frame').removeClass('old');

            if (loopFrameIndex > -1 && !self.looping && !(direction == 0 && !loopFrame)) {
              self.loop();
            } else {
              clearInterval(self.playInterval);
              self.playInterval = false;
              self.playing = false;
              self.animating = false;
              self.emit('pause');
            }

            return;
          }

          //display current frame
          $jq('#timeline .timeline-frame-' + self.currentFrame).not('.old').css({ zIndex: '2', display: 'block' });

          if (delta == 0) return;
          if (direction == 1) {
            //buffer surrounding frames
            $jq('#timeline .timeline-frame-' + (self.currentFrame + delta)).not('.old').css({ zIndex: '1', display: 'block' });
            //discard old frame(s)
            $jq('#timeline .timeline-frame-' + (self.currentFrame - delta)).css({ zIndex: '1', display: 'none' }).addClass('old');
          } else if (direction == -1) {
            //buffer surrounding frames
            $jq('#timeline .timeline-frame-' + (self.currentFrame + delta)).not('.old').css({ zIndex: '1', display: 'block' });
            //discard old frame(s)
            $jq('#timeline .timeline-frame-' + (self.currentFrame - delta)).css({ zIndex: '1', display: 'none' }).addClass('old');
          }
        }, self.deltaTime * 1000 / speed);
      }
    }
  }, {
    key: 'loop',
    value: function loop() {
      var self = this;
      var loopFrameIndex = self._hasTweenFrame();
      var loopFrame = self.tweenframes[loopFrameIndex];
      if (!loopFrame || self.looping) {
        return;
      }self.emit('loop');
      self.looping = true;

      resetInterval();

      var delta = 1;
      function resetInterval() {
        clearInterval(self.playInterval);
        self.playInterval = setInterval(function () {
          //display current frame
          $jq('#timeline .timeline-frame-' + self.currentFrame).not('.old').css({ zIndex: '2', display: 'block' });
          //buffer surrounding frames
          $jq('#timeline .timeline-frame-' + (self.currentFrame + delta)).not('.old').css({ zIndex: '1', display: 'block' });
          //discard old frame(s)
          $jq('#timeline .timeline-frame-' + (self.currentFrame - delta)).css({ zIndex: '1', display: 'none' }).addClass('old');

          if (self.currentFrame >= loopFrame) {
            var doesLoop = self.looptweens[loopFrameIndex];

            if ((self.looping || !self.looping && !self.stopLoopDirection) && doesLoop) {
              var baseFrame = parseInt(self.keyframes[self.currentKeyframe]);
              $jq('#timeline .timeline-frame-' + baseFrame).css({ zIndex: '2', display: 'block' });
              $jq('#timeline .timeline-frame-' + self.currentFrame).css({ zIndex: '1', display: 'none' });
              $jq('#timeline .timeline-frame').not('#timeline .timeline-frame-' + baseFrame).css({ zIndex: '1', display: 'none' });
              $jq('#timeline .timeline-frame').removeClass('old');
              self.currentFrame = baseFrame;
            }

            if (!doesLoop) self.looping = false;
            if (!self.looping || !doesLoop) {
              clearInterval(self.playInterval);
              self.playing = false;
              self.playInterval = false;
              self.animating = false;
              self.emit('stoppedLooping');
              return;
            }
          }

          self.currentFrame += delta;
        }, self.deltaTime * 1000);
      }
    }
  }, {
    key: 'stopLoop',
    value: function stopLoop() {
      var d = arguments[0] === undefined ? 1 : arguments[0];

      clearInterval(this.playInterval);
      this.stopLoopDirection = d;
      this.playInterval = false;
      this.playing = false;
      this.animating = false;
      this.looping = false;
    }
  }, {
    key: '_hasTweenFrame',
    value: function _hasTweenFrame(id) {
      for (var i in this.tweenframes) {
        if (this.tweenframes[i] > parseInt(this.keyframes[this.currentKeyframe]) && this.tweenframes[i] < parseInt(this.keyframes[this.currentKeyframe + 1])) {
          return parseInt(i);
        }
      }
      return -1;
    }
  }, {
    key: 'scrollDirection',
    value: function scrollDirection(d) {
      this.scrollDirection = d;
    }
  }, {
    key: 'disable',
    value: function disable() {
      this.disabled = true;
      this.enabled = false;
      $jq('#timeline').hide();
      $jq('.timeline-animation').remove();
    }
  }, {
    key: 'enable',
    value: function enable() {
      this.disabled = false;
      this.enabled = true;
      $jq('#timeline').show();
    }
  }, {
    key: 'changeSource',
    value: function changeSource(url) {
      var self = this;
      $jq('#timeline .timeline-frame-' + self.currentFrame).addClass('remove');

      $jq('#timeline').attr('data-src', url);
      self._setURL();
      url = self._constructURL();

      self._cache();

      timeline.on('currentFrameLoaded', function () {
        timeline.off('currentFrameLoaded', 'changeSource');
        self.animating = false;
        self.emit('changeSource');
      }, 'changeSource');

      $jq('#timeline img').not('.remove,.added').fadeOut('fast');
    }
  }, {
    key: 'log',
    value: function log(msg) {
      var type = arguments[1] === undefined ? 0 : arguments[1];

      var prefix = 'timeline.js';
      switch (type) {
        case 1:
          type = 'ERROR';
          break;
        case 2:
          type = 'INFO';
          break;
        default:
          type = 'DEBUG';
          break;
      }

      console.log('' + prefix + ' ' + type + ': ' + msg);
    }
  }, {
    key: 'clearAnimation',
    value: function clearAnimation() {
      $jq('.liquid-animation').stop(true, true).fadeOut('fast', function () {
        $jq('.liquid-animation').remove();
      });
      $jq('.dial-animation').stop(true, true).fadeOut('fast', function () {
        $jq('.dial-animation').remove();
      });
    }
  }, {
    key: 'fps',
    set: function (fps) {
      this.deltaTime = 1 / fps;
      this._fps = fps;
    },
    get: function () {
      return this._fps;
    }
  }, {
    key: 'color',
    set: function (color) {
      this._setURL;
      this._color = color;
    },
    get: function () {
      return this._color;
    }
  }, {
    key: '_setURL',
    value: function _setURL() {
      var self = this;
      self.src = $jq('#timeline').attr('data-src');
      self.filetype = self.src.split('.').pop();
      self.suffix = self.src.match(/[0-9]{1,}/g);
      self.suffix = self.suffix[self.suffix.length - 1];
      self.prefix = self.src.split(self.suffix)[0];
    }
  }, {
    key: '_getURL',
    value: function _getURL(url) {
      var src = url;
      var suffix = src.match(/[0-9]{1,}/g);
      suffix = suffix[suffix.length - 1];
      return {
        src: url,
        filetype: src.split('.').pop(),
        suffix: suffix,
        prefix: src.split(suffix)[0]
      };
    }
  }, {
    key: '_constructURL',
    value: function _constructURL() {
      var id = arguments[0] === undefined ? undefined : arguments[0];
      var opts = arguments[1] === undefined ? undefined : arguments[1];

      var self = this;
      var suffix;
      if (opts) {
        if (id) suffix = Array(opts.suffix.length - id.toString().length + 1).join('0') + id.toString();else suffix = Array(opts.suffix.length - opts.currentFrame.toString().length + 1).join('0') + opts.currentFrame.toString();
        return opts.prefix + suffix + '.' + opts.filetype;
      } else {
        if (id) suffix = Array(self.suffix.length - id.toString().length + 1).join('0') + id.toString();else suffix = Array(self.suffix.length - self.currentFrame.toString().length + 1).join('0') + self.currentFrame.toString();
        return self.prefix + suffix + '.' + self.filetype;
      }
    }
  }, {
    key: '_cache',
    value: function _cache(_x8, url) {
      var hard = arguments[0] === undefined ? true : arguments[0];

      //TODO if source is changed while caching, cancel the current cache job
      var self = this;

      if (hard) {
        var cf = self.currentFrame;
        var suf = self._constructURL();
        if ($jq('#timeline .remove').length) {
          var mt = $jq('#timeline img').css('marginTop');
          $jq('#timeline').append('<img style="display:none; z-index:2; margin-top:' + mt + '" class="added timeline-frame timeline-frame-' + cf + '" src="' + suf + '"/>');
        } else {
          $jq('#timeline-frame-' + cf).attr('src', suf);
        }
      }

      if (hard && self.cached.indexOf(self.color) > -1 || !hard && self.cached.indexOf(self.cacheColor) > -1) {
        for (var i = 0; i <= self.keyframes[self.keyframes.length - 1]; i++) {
          var suffix = self._constructURL(i);
          $jq('#timeline .timeline-frame-' + i).attr('src', suffix);
        }
        setTimeout(function () {
          $jq('#timeline .remove').fadeOut('fast', function () {
            $jq(this).remove();
          });
          $jq('#timeline .added').delay(200).fadeIn('fast', function () {
            $jq(this).removeClass('added');
          });
          self.emit('currentFrameLoaded');
        }, 300);
        return;
      }

      self.ready = false;
      self.totalFrames = parseInt(self.keyframes[self.keyframes.length - 1]);
      self.loadedFrames = 0;
      self.percentLoaded = 0;

      //cache the most relevant frames first
      for (var _i = 0; _i <= Math.round(self.keyframes.length); _i++) {
        cacheFrameSet(self.currentKeyframe + _i, loadedCallback);
        if (_i !== 0) cacheFrameSet(self.currentKeyframe - _i, loadedCallback);
      }

      function cacheFrameSet(id, fn) {
        if (!frameIsValid(id)) {
          return;
        }var start = parseInt(self.keyframes[id]),
            end = parseInt(self.keyframes[id + 1]);
        var total = end - start;
        var loaded = 0;
        var error = 0;

        var _loop = function (_i2) {
          if (_i2 == 0) {
            total -= 1;return 'continue';
          }
          var suffix = undefined;
          if (url) {
            var opts = self._getURL(url);
            suffix = self._constructURL(_i2, opts);
          } else {
            suffix = self._constructURL(_i2);
          }

          $jq.loadImage(suffix).done(function (image) {
            self.loadedFrames++;
            if (hard && self.cached.length == 0) {
              $jq(image).addClass('timeline-frame timeline-frame-' + _i2).css({ display: 'none', zIndex: '1' });
              $jq('#timeline').append(image);
            } else if (hard && self.cached.length > 0) {
              $jq('#timeline .timeline-frame-' + _i2).attr('src', $jq(image).attr('src'));
              if (_i2 == self.currentFrame) $jq('#timeline .timeline-frame-' + _i2).attr({ opacity: 0, display: 'block' }).animate({ opacity: 1 }, 400, function () {
                self.emit('currentFrameLoaded');
              });
            }

            var newLoadPercent = Math.round(self.loadedFrames / self.totalFrames * 100);
            if (self.percentLoaded != newLoadPercent) self.emit('loadedPercent' + self.percentLoaded);
            self.percentLoaded = newLoadPercent;

            if (++loaded + error >= total) {
              if (typeof fn === 'function') fn(id, loaded, error);
            }
          }).fail(function (image) {
            self.log('failed to cache ' + suffix, 1);
            self.loadedFrames++;
            self.percentLoaded = self.loadedFrames / self.totalFrames;
            if (++error + loaded >= total) {
              if (typeof fn === 'function') fn(id, loaded, error);
            }
          });
        };

        for (var _i2 = start; _i2 < end; _i2++) {
          var _ret = _loop(_i2);

          if (_ret === 'continue') continue;
        }
      }

      var loadedTrack = [];
      var loadedTotal = 0;
      var errorTotal = 0;
      function loadedCallback(id, loaded, error) {
        if (loadedTrack.indexOf(id) > -1) {
          return;
        } else loadedTrack.push(id);
        loadedTotal += loaded;
        errorTotal += error;

        self.log('finished loading frame set ' + id + ' (' + loaded + ' loaded, ' + error + ' errors)', 2);
        self.emit('loaded' + id);

        if (loadedTrack.length >= self.keyframes.length - 1) {
          self.cached.push(self.cacheColor);
          $jq('.color-picker .' + self.cacheColor).removeClass('unloaded').addClass('loaded');
          self.ready = true;
          self.log('load complete (' + loadedTotal + ' loaded, ' + errorTotal + ' errors)', 2);
          self.emit('loaded');
        }
      }

      function frameIsValid(id) {
        if (id < 0 || id >= self.keyframes.length) {
          return false;
        }return true;
      }
    }
  }]);

  return Timeline;
})(Messenger);