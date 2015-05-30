'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var Messenger = (function () {
  function Messenger() {
    _classCallCheck(this, Messenger);

    this.subscribers = [];
  }

  _createClass(Messenger, [{
    key: 'on',
    value: function on(e, cb, context) {
      this.subscribers[e] = this.subscribers[e] || [];
      this.subscribers[e].push({
        callback: cb,
        context: context
      });
    }
  }, {
    key: 'off',
    value: function off(e, context) {
      var i, subs, sub;
      if (subs = this.subscribers[e]) {
        i = subs.length - 1;
        while (i >= 0) {
          sub = this.subscribers[e][i];
          if (sub.context === context) {
            this.subscribers[e].splice(i, 1);
          }
          i--;
        }
      }
    }
  }, {
    key: 'emit',
    value: function emit(e) {
      var sub,
          subs,
          i = 0,
          args = Array.prototype.slice.call(arguments, 1);
      if (subs = this.subscribers[e]) {
        while (i < subs.length) {
          sub = subs[i];
          sub.callback.apply(sub.context || this, args);
          i++;
        }
      }
    }
  }]);

  return Messenger;
})();

$.loadImage = function (url) {
  var loadImage = function loadImage(deferred) {
    var image = new Image();
    image.onload = loaded;
    image.onerror = errored; // URL returns 404, etc
    image.onabort = errored; // IE may call this if user clicks "Stop"
    image.src = url;

    function loaded() {
      unbindEvents();
      deferred.resolve(image);
    }
    function errored() {
      unbindEvents();
      deferred.reject(image);
    }
    function unbindEvents() {
      // Ensures the event callbacks only get called once.
      image.onload = null;
      image.onerror = null;
      image.onabort = null;
    }
  };

  return $.Deferred(loadImage).promise();
};

var circleLoader = (function () {
  function circleLoader() {
    _classCallCheck(this, circleLoader);
  }

  _createClass(circleLoader, [{
    key: 'init',
    value: function init(el) {
      if (this.canvas) $('canvas').remove();
      this.options = {
        percent: 0,
        size: $(el).width(),
        lineWidth: 1,
        rotate: 0
      };
      this.didInit = false;
      this.options.color = '#efefef';
      this.target = el;
      this.canvas = document.createElement('canvas');
      this.percent = 0;

      if (typeof G_vmlCanvasManager !== 'undefined') {
        G_vmlCanvasManager.initElement(canvas);
      }

      var ctx = this.canvas.getContext('2d');
      this.canvas.width = this.canvas.height = this.options.size;
      $(el).append(this.canvas);
      $(this.canvas).css('margin', '1px 0px 0px 3px');
      this.circle = ctx;
      this.didInit = true;
      this.redraw();
    }
  }, {
    key: 'redraw',
    value: function redraw() {
      if (!this.canvas || !this.target || !this.circle || !this.didInit || !this.target || !this.target.position() || !this.target.position().top) {
        return;
      }$(this.canvas).css('top', parseInt($(this.target).position().top) + parseInt($(this.target).css('margin-top')));
      var width = $(this.target).find('div').eq(0).width();
      this.canvas.width = this.canvas.height = this.options.size = width;
      this.circle.translate(this.options.size / 2, this.options.size / 2); // change center
      this.circle.rotate((-1 / 2 + this.options.rotate / 180) * Math.PI); // rotate -90 deg
      this.radius = (this.options.size - this.options.lineWidth) / 2;
      this.draw(this.percent);
    }
  }, {
    key: 'draw',
    value: function draw(percent) {
      if (!this.didInit || !this.circle) {
        return;
      }this.circle.clearRect(0, 0, this.circle.width, this.circle.height);
      this.percent = percent;
      percent = Math.min(Math.max(0, percent < 1 ? percent : percent / 100 || 1), 1);
      this.circle.beginPath();
      this.circle.arc(0, 0, this.radius, 0, Math.PI * 2 * percent, false);
      this.circle.strokeStyle = this.options.color;
      this.circle.lineCap = 'square'; // butt, round or square
      this.circle.lineWidth = this.options.lineWidth;
      this.circle.stroke();
    }
  }, {
    key: 'remove',
    value: function remove() {
      $('canvas').remove();
      this.didInit = false;
    }
  }]);

  return circleLoader;
})();