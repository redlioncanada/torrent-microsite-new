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
      this.log('opts is undefined, need an id', 1);return;
    }
    this.mode = opts.mode;
    if (opts.mode == 'video') {
      this._forwardVideo = undefined;
      this._backwardVideo = undefined;
      $('#timeline #forward').css('zIndex', '2');
      $('#timeline #backward').css('zIndex', '1');
      if (!opts.fps) {
        this.log('fps is undefined, assuming 30fps', 2);this.fps = 30;
      } else {
        this.fps = opts.fps;
      }
    }

    this.border = opts.border;
    this.playing = false;
    this.playInterval = undefined;
    this.animation = opts.animation;
    this.keyframes = opts.keyframes;
    this.currentKeyframe = this.mode == 'video' ? -1 : 0;
    this.currentFrame = parseInt(this.keyframes[0]);
    this.currentYoffset = window.pageYOffset;
    this.ready = false;
    this.forwardReady = false;
    this.backwardReady = false;

    var self = this;
    if (opts.mode == 'sequence') {
      self.fps = opts.fps;
      self._setURL();
      self._cache();
      self.keyframes[self.keyframes.length - 1] -= 1; //you're a wizard harry
    }

    if (this.border) {
      $('#timeline').append('<div style="display: none;" class="black-to-transparent-gradient-top"></div>').append('<div style="display: none;" class="black-to-transparent-gradient-bottom"></div>').append('<div style="display: none;" class="black-to-transparent-gradient-left"></div>').append('<div style="display: none;" class="black-to-transparent-gradient-right"></div>');
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
      $(window).resize(self.redraw);

      self.forwardVideo.play();
      self.forwardVideo.pause();
      self.forwardVideo.currentTime(self.currentKeyframe);
      self.backwardVideo.play();
      self.backwardVideo.pause();
      self.backwardVideo.currentTime(self.backwardVideo.duration());

      self.forwardVideo.on('loadeddata', function () {
        loadedCallback(1);
      });
      self.backwardVideo.on('loadeddata', function () {
        loadedCallback(0);
      });

      function loadedCallback(dir) {
        if (dir) self.forwardReady = true;else self.backwardReady = true;
        if (!dir && self.forwardReady || dir && self.backwardReady) {
          self.duration = self.forwardVideo.duration();
          self.emit('loaded');
          self.ready = true;
        }
      }
    }
  }, {
    key: 'redraw',
    value: function redraw() {
      //make sure video's aspect/position is maintained
      var menuSize = isPhone ? 50 : 116;
      var width = $(window).width();
      var height = $(window).height() - menuSize;
      var viewportAspect = width / height;
      var imageAspect = 16 / 9;
      if (isNaN(imageAspect) || !imageAspect) {
        return false;
      }var mod = 1.2;

      $('.black-to-transparent-gradient-top,.black-to-transparent-gradient-bottom,.black-to-transparent-gradient-left,.black-to-transparent-gradient-right').removeClass('timeline-ignore');
      if (viewportAspect > imageAspect) {
        $('.black-to-transparent-gradient-top,.black-to-transparent-gradient-bottom').addClass('timeline-ignore').fadeOut();
        var nheight = height * mod;
        var nwidth = height * imageAspect * mod;
        var hdiff = nheight - height;
        var wdiff = nwidth - width;
        $('#timeline').css({
          height: nheight,
          width: nwidth,
          top: menuSize - hdiff / 2,
          left: -wdiff / 2
        });
      } else if (viewportAspect < imageAspect) {
        $('.black-to-transparent-gradient-left,.black-to-transparent-gradient-right').addClass('timeline-ignore').fadeOut();
        var nheight = width / imageAspect * mod;
        var nwidth = width * mod;
        var hdiff = nheight - height;
        var wdiff = nwidth - width;
        $('#timeline').css({
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
        $('#timeline').css({
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
        $('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeIn();
      } else {
        $('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeOut();
      }
    }
  }, {
    key: 'hideBorder',
    value: function hideBorder() {
      var hide = arguments[0] === undefined ? 1 : arguments[0];

      if (hide) {
        $('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeOut();
      } else {
        $('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeIn();
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
      }var lastFrame = self.currentKeyframe;
      self.currentKeyframe = id;

      var speed = 1;
      if (self.mode === 'video') {
        var idDiff = Math.abs(lastFrame - id);
        var timeDiff = Math.abs(self.keyframes[lastFrame] - self.keyframes[id]);
        speed = idDiff > 1 ? 1 / timeDiff : undefined;
        self.log('playing to keyframe #' + id + ', time ' + self.keyframes[id] + 's');
      } else {
        speed = Math.abs(self.keyframes[lastFrame] - self.keyframes[id]) / self.fps;
        self.log('playing to keyframe #' + id + ', frame #' + self.keyframes[id]);
      }
      self.keyframes[id] < self.keyframes[lastFrame] ? self.play(self.keyframes[id], 0, speed) : self.play(self.keyframes[id], 1, speed);
      return true;
    }
  }, {
    key: 'play',
    value: function play(val, direction, speed) {
      var self = this;
      if (self.playing || self.playInterval) {
        return;
      }self.playing = true;
      self.animating = true;
      self.emit('play');

      var primary = undefined,
          secondary = undefined;
      if (direction) {
        primary = self.forwardVideo;
        secondary = self.backwardVideo;
        $('#timeline #forward').css('zIndex', '2');
        $('#timeline #backward').css('zIndex', '1');
      } else {
        primary = self.backwardVideo;
        secondary = self.forwardVideo;
        $('#timeline #forward').css('zIndex', '1');
        $('#timeline #backward').css('zIndex', '2');
      }

      if (self.mode == 'video') {
        if (!speed) primary.play();

        val = direction ? val : Math.abs(self.duration - val);
        self.playInterval = setInterval(function () {
          var ct = primary.currentTime();
          if (speed) {
            ct += speed;
            primary.currentTime(ct);
          }
          if (ct >= val) {
            //$('#timeline #poster').fadeOut();
            //$('#timeline #poster-'+id).fadeIn();
            clearInterval(self.playInterval);
            self.playInterval = false;
            self.playing = false;
            self.animating = false;
            primary.pause();
            secondary.currentTime(Math.abs(ct - self.duration));
            self.emit('pause');
          }
        }, speed ? speed * 1000 : 0.05);
      } else {
        (function () {
          var resetInterval = function () {
            var allowReset = arguments[0] === undefined ? true : arguments[0];

            clearInterval(self.playInterval);
            self.playInterval = setInterval(function () {
              var lastFrame = self.currentFrame;
              self.currentFrame += delta;

              if ((direction == 1 && self.currentFrame > self.keyframes[self.currentKeyframe - 1] || direction == -1 && self.currentFrame <= self.keyframes[self.currentKeyframe + 1]) && allowReset) resetInterval(1, false);

              if (direction == 1 && self.currentFrame > parseInt(val) - 1 || direction == -1 && self.currentFrame < parseInt(val) + 1) {
                if (direction == 1 && self.animation) {
                  if (self.animation[self.currentKeyframe] && typeof self.animation[self.currentKeyframe] === 'object') {
                    for (var i in self.animation[self.currentKeyframe]) {
                      if (typeof self.animation[self.currentKeyframe][i].end === 'function') {
                        self.animation[self.currentKeyframe][i].end.call();
                      }
                    }
                  }
                }

                self.currentFrame = parseInt(val);
                $('#timeline .timeline-frame-' + self.currentFrame).css({ zIndex: '2', display: 'block' });
                $('#timeline .timeline-frame').not('#timeline .timeline-frame-' + self.currentFrame).css({ zIndex: '1', display: 'none' });
                $('#timeline .timeline-frame').removeClass('old');
                clearInterval(self.playInterval);
                self.playInterval = false;
                self.playing = false;
                self.animating = false;
                self.emit('pause');
                return;
              }

              //display current frame
              $('#timeline .timeline-frame-' + self.currentFrame).not('.old').css({ zIndex: '2', display: 'block' });

              if (delta == 0) return;
              if (direction == 1) {
                //buffer surrounding frames
                $('#timeline .timeline-frame-' + (self.currentFrame + delta)).not('.old').css({ zIndex: '1', display: 'block' });
                //discard old frame(s)
                $('#timeline .timeline-frame-' + (self.currentFrame - delta)).css({ zIndex: '1', display: 'none' }).addClass('old');
              } else if (direction == -1) {
                //buffer surrounding frames
                $('#timeline .timeline-frame-' + (self.currentFrame + delta)).not('.old').css({ zIndex: '1', display: 'block' });
                //discard old frame(s)
                $('#timeline .timeline-frame-' + (self.currentFrame - delta)).css({ zIndex: '1', display: 'none' }).addClass('old');
              }
            }, self.deltaTime * 1000 / speed);
          };

          direction = direction ? 1 : -1;
          var delta = Math.round(speed) > 3 ? 3 * direction : direction; //skip some frames if playing super fast
          resetInterval();

          if (direction == 1 && self.animation) {
            if (self.animation[self.currentKeyframe] && typeof self.animation[self.currentKeyframe] === 'object') {
              for (var j in self.animation[self.currentKeyframe]) {
                if (typeof self.animation[self.currentKeyframe][j].start === 'function') {
                  self.animation[self.currentKeyframe][j].start.call();
                }
              }
            }
          }
        })();
      }
    }
  }, {
    key: 'changeSource',
    value: function changeSource(url) {
      var self = this;
      if (self.mode == 'video') {} else if (self.mode == 'sequence') {
        $('#timeline').attr('data-src', url);
        self._setURL();
        url = self._constructURL();
        self.animating = true;
        self.loaded = false;

        $('#timeline img').fadeOut('fast', function () {
          self.animating = false;
          self.emit('changeSource');
          $('#timeline img').remove();
        });
        self._cache();
      }
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
    key: 'forwardVideo',
    set: function (v) {
      this._forwardVideo = v;
      if (this._backwardVideo) this.init();
    },
    get: function (v) {
      return this._forwardVideo;
    }
  }, {
    key: 'backwardVideo',
    set: function (v) {
      this._backwardVideo = v;
      if (this._forwardVideo) this.init();
    },
    get: function (v) {
      return this._backwardVideo;
    }
  }, {
    key: 'fps',
    set: function (fps) {
      this.deltaTime = 1 / fps;
      if (this.mode == 'video' && this.forwardVideo) {
        this.duration = this.forwardVideo.duration();
        this.totalFrames = fps * this.duration;
      }
      this._fps = fps;
    },
    get: function () {
      return this._fps;
    }
  }, {
    key: '_setURL',
    value: function _setURL() {
      var self = this;
      self.src = $('#timeline').attr('data-src');
      self.filetype = self.src.split('.').pop();
      self.suffix = self.src.match(/[0-9]{1,}/g);
      self.suffix = self.suffix[self.suffix.length - 1];
      self.prefix = self.src.split(self.suffix)[0];
    }
  }, {
    key: '_constructURL',
    value: function _constructURL() {
      var id = arguments[0] === undefined ? undefined : arguments[0];

      var self = this;
      var suffix;
      if (id) suffix = Array(self.suffix.length - id.toString().length + 1).join('0') + id.toString();else suffix = Array(self.suffix.length - self.currentFrame.toString().length + 1).join('0') + self.currentFrame.toString();
      return self.prefix + suffix + '.' + self.filetype;
    }
  }, {
    key: '_cache',
    value: function _cache() {
      //TODO if source is changed while caching, cancel the current cache job
      var self = this;
      self.ready = false;

      $('#timeline').append('<img style="display:none;" />');
      $('#timeline img').attr('src', self._constructURL()).addClass('timeline-frame timeline-frame-' + self.currentFrame).fadeIn();

      //cache the most relevant frames first
      for (var i = 0; i <= Math.round(self.keyframes.length); i++) {
        cacheFrameSet(self.currentKeyframe + i, loadedCallback);
        if (i !== 0) cacheFrameSet(self.currentKeyframe - i, loadedCallback);
      }

      function cacheFrameSet(id, fn) {
        if (!frameIsValid(id)) {
          return;
        }var start = parseInt(self.keyframes[id]),
            end = parseInt(self.keyframes[id + 1]);
        var total = end - start;
        var loaded = 0;
        var error = 0;

        var _loop = function (i) {
          if (i == 0) {
            total -= 1;return 'continue';
          }
          var suffix = self._constructURL(i);

          $.loadImage(suffix).done(function (image) {
            $(image).addClass('timeline-frame timeline-frame-' + i).css({ display: 'none', zIndex: '1' });
            $('#timeline').append(image);
            if (++loaded + error >= total) {
              if (typeof fn === 'function') fn(id, loaded, error);
            }
          }).fail(function (image) {
            self.log('failed to cache ' + suffix, 1);
            if (++error + loaded >= total) {
              if (typeof fn === 'function') fn(id, loaded, error);
            }
          });
        };

        for (var i = start; i < end; i++) {
          var _ret2 = _loop(i);

          if (_ret2 === 'continue') continue;
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
          self.emit('loaded');
          self.ready = true;
          self.log('load complete (' + loadedTotal + ' loaded, ' + errorTotal + ' errors)', 2);
        }
      }

      function frameIsValid(id) {
        if (id < 0 || id >= self.keyframes.length - 1) {
          return false;
        }return true;
      }
    }
  }]);

  return Timeline;
})(Messenger);

//TODO implement transitioning video source