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

