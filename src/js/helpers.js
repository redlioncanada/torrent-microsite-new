class Messenger {
  constructor() {
    this.subscribers = [];
  }

  on(e, cb, context) {
    this.subscribers[e] = this.subscribers[e] || [];
    this.subscribers[e].push({
        callback: cb,
        context: context
    });
  }

  off(e, context) {
    var i, subs, sub;
    if ((subs = this.subscribers[e])) {
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

  emit(e) {
    var sub, subs, i = 0, args = Array.prototype.slice.call(arguments, 1);
    if ((subs = this.subscribers[e])) {
        while (i < subs.length) {
            sub = subs[i];
            sub.callback.apply(sub.context || this, args);
            i++;
        }
    }
  }
}

$.loadImage = function(url) {
  var loadImage = function(deferred) {
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

class circleLoader {
  init(el) {
    if (this.canvas) $('canvas').remove();
    this.options = {
        percent:  0,
        size: $(el).width(),
        lineWidth: 1,
        rotate: 0
    }
    this.didInit = false;
    this.options.color = '#efefef';
    this.target = el;
    this.canvas = document.createElement('canvas');
    this.percent = 0;
        
    if (typeof(G_vmlCanvasManager) !== 'undefined') {
        G_vmlCanvasManager.initElement(canvas);
    }

    var ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.height = this.options.size;
    $(el).append(this.canvas);
    $(this.canvas).css('margin','1px 0px 0px 3px');
    this.circle = ctx;
    this.didInit = true;
    this.redraw();
  }

  redraw() {
    if (!this.canvas || !this.target || !this.circle || !this.didInit) return;
    $(this.canvas).css('top', parseInt($(this.target).position().top) + parseInt($(this.target).css('margin-top')));
    let width = $(this.target).find('div').eq(0).width();
    this.canvas.width = this.canvas.height = this.options.size = width;
    this.circle.translate(this.options.size / 2, this.options.size / 2); // change center
    this.circle.rotate((-1 / 2 + this.options.rotate / 180) * Math.PI); // rotate -90 deg
    this.radius = (this.options.size - this.options.lineWidth) / 2;
    this.draw(this.percent);
  }

  draw(percent) {
      if (!this.didInit || !this.circle) return;
      this.circle.clearRect ( 0 , 0 , this.circle.width, this.circle.height );
      this.percent = percent;
      percent = Math.min(Math.max(0, percent < 1 ? percent : percent/100 || 1), 1);
      this.circle.beginPath();
      this.circle.arc(0, 0, this.radius, 0, Math.PI * 2 * percent, false);
      this.circle.strokeStyle = this.options.color;
      this.circle.lineCap = 'square'; // butt, round or square
      this.circle.lineWidth = this.options.lineWidth;
      this.circle.stroke();
  }

  remove() {
    $('canvas').remove();
    this.didInit = false;
  }
}

