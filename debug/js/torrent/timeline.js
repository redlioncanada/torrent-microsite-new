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
    this.keyframes = opts.keyframes;
    this.currentKeyframe = -1;
    this.currentFrame = parseInt(this.keyframes[0]);
    this.currentYoffset = window.pageYOffset;
    this.ready = false;
    this.forwardReady = false;
    this.backwardReady = false;

    var self = this;
    if (opts.mode == 'sequence') {
      console.log('sequence init');
      self.src = $('#timeline img').attr('src');
      self._setURL();
      $('#timeline img').attr('src', self._constructURL()).addClass('timeline-frame timeline-frame-0');
      self._cache();
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
      var offset = $('#navbar-wrapper').height() + menuSize;
      var height = $(window).height() - offset;
      var viewportAspect = width / height;
      var imageAspect = 16 / 9;
      if (isNaN(imageAspect) || !imageAspect) {
        return false;
      }var mod = 1;

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
          top: offset - hdiff / 2,
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
          top: offset - hdiff / 2,
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
          top: offset - hdiff / 2,
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
    key: 'scroll',
    value: function scroll(direction) {
      var self = this;
      if (self.playing || self.playInterval) {
        return;
      }if (self.mode == 'video') self.totalFrames = self.fps * self._forwardVideo.duration();

      if (!direction) {
        if (self.currentKeyframe <= 0) {
          return;
        }self.currentKeyframe--;
      } else {
        if (self.currentKeyframe >= self.keyframes.length) {
          return;
        }self.currentKeyframe++;
      }

      self.currentYoffset = window.pageYOffset;
      !direction ? self.playBackwards() : self.play();
    }
  }, {
    key: 'playTo',
    value: function playTo(id) {
      var self = this;
      if (id < 0 || id >= self.keyframes.length || id == self.currentKeyframe || self.playing || self.playInterval) {
        return false;
      }var idDiff = Math.abs(self.currentKeyframe - id);
      var timeDiff = Math.abs(self.keyframes[self.currentKeyframe] - self.keyframes[id]);
      var speed = idDiff > 1 ? 1 / timeDiff : undefined;
      self.keyframes[id] < self.keyframes[self.currentKeyframe] ? self.play(self.keyframes[id], 0, speed) : self.play(self.keyframes[id], 1, speed);
      self.log('playing to keyframe #' + id + ', time ' + self.keyframes[id] + 's');
      self.currentKeyframe = id;
      return true;
    }
  }, {
    key: 'play',
    value: function play(val, direction, speed) {
      var self = this;
      if (self.playing || self.playInterval) {
        return;
      }self.playing = true;
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
            primary.pause();
            secondary.currentTime(Math.abs(ct - self.duration));
            self.emit('pause');
          }
        }, speed ? speed * 1000 : 0.05);
      } else {
        (function () {
          var resetInterval = function (speed) {
            var allowReset = arguments[1] === undefined ? true : arguments[1];

            clearInterval(self.playInterval);
            self.playInterval = setInterval(function () {
              var lastFrame = self.currentFrame;
              self.currentFrame += Math.round(speed) > 3 ? 3 : Math.round(speed); //skip some frames if playing super fast

              if (self.currentFrame >= self.keyframes[self.currentKeyframe - 1] && allowReset) resetInterval(1, false);

              if (self.currentFrame >= parseInt(val) - 1) {
                self.currentFrame = parseInt(val);
                clearInterval(self.playInterval);
                self.playInterval = false;
                self.playing = false;
                self.emit('pause');
                return;
              }
            }, self.deltaTime * 1000 / speed);
          };

          if (val) self.currentKeyframe = parseInt(val);
          resetInterval(speed);
        })();
      }
    }
  }, {
    key: 'changeSource',
    value: function changeSource(url) {
      var self = this;
      if (self.mode == 'video') {} else if (self.mode == 'sequence') {
        self.src = url;
        self._setURL();
        url = self._constructURL();
        self.animating = true;

        $('#timeline').append('<img src="' + url + '"/>');
        $('#timeline img').eq(0).fadeOut('fast', function () {
          self.animating = false;$(this).css('zIndex', '2');self.emit('changeSource');$('#timeline img').eq(0).remove();
        });
        $('#timeline img').eq(1).fadeIn('fast');
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
    value: function _cache() {}
  }]);

  return Timeline;
})(Messenger);

//TODO implement transitioning video source

/*for (var i = 0; i <= self.keyframes[self.keyframes.length-1]); i++) {
  $('#timeline').append(`<img src=""/>`);
}*/