class Timeline extends Messenger {
	constructor(opts) {
    super();
    if (!opts) {this.log("opts is undefined, need an id", 1); return;}
    if (opts.mode == 'video') {
      if (!opts.videojs) {this.log("videojs is undefined", 1); return;} else {this.videojs = opts.videojs;}
      if (!opts.videojs.id()) {this.log("id is undefined", 1); return;} else {this.id = opts.videojs.id();}
      this.video = document.getElementById(this.id);
      if (!this.video || this.video.length === 0) {this.log("video not found in dom", 1); return;}
    }
    if (!opts.fps) {this.log("fps is undefined, assuming 30fps", 2); this.fps = 30;} else {this.fps = opts.fps;}

    this.border = opts.border;
    this.mode = opts.mode;
    this.playing = false;
    this.playInterval = undefined;
    this.keyframes = opts.keyframes;
    this.currentKeyframe = parseInt(this.keyframes[0]);
    this.currentFrame = parseInt(this.keyframes[0]);
    this.currentYoffset = window.pageYOffset;
    this.ready = false;

    let self = this;
    if (opts.mode == 'video') {
      this.parent = $(this.video).parent();
      self.videojs.play();
      self.videojs.pause();
      self.videojs.currentTime(self.keyframes[0]);

      self.videojs.on('loadeddata', function() {
        self.ready = true;
        self.emit('loaded');
      });
    } else {
      self.src = $('#timeline img').attr('src');
      self._setURL();
      $('#timeline img').attr('src', self._constructURL());
      self._cache();
    }

    if (this.border) {
      $('#timeline').append('<div style="display: none;" class="black-to-transparent-gradient-top"></div>')
        .append('<div style="display: none;" class="black-to-transparent-gradient-bottom"></div>')
        .append('<div style="display: none;" class="black-to-transparent-gradient-left"></div>')
        .append('<div style="display: none;" class="black-to-transparent-gradient-right"></div>');
    }

    var initInterval = setInterval(function() {
        if (self.redraw()) clearInterval(initInterval);
    },200);
    $(window).resize(self.redraw);
  }

  redraw() {
    //make sure video's aspect/position is maintained
    let width = $(window).width();
    let offset = $('.navbar').height();
    let height = $(window).height() - offset;
    let viewportAspect = width/height;
    let imageAspect = parseInt($('#timeline img').width()) / parseInt($('#timeline img').height());
    if (isNaN(imageAspect) || !imageAspect) return false;

    let mod = 1.3;

    $('.black-to-transparent-gradient-top,.black-to-transparent-gradient-bottom,.black-to-transparent-gradient-left,.black-to-transparent-gradient-right').removeClass('timeline-ignore');
    if (viewportAspect > imageAspect) {
      $('.black-to-transparent-gradient-top,.black-to-transparent-gradient-bottom').addClass('timeline-ignore').fadeOut();
      let nheight = height*mod;
      let nwidth = height*imageAspect*mod;
      let hdiff = nheight-height;
      let wdiff = nwidth-width;
      $('#timeline').css({
          'height': nheight,
          'width': nwidth,
          'top': offset - hdiff/2,
          'left': -wdiff/2
      });
    } else if (viewportAspect < imageAspect) {
      $('.black-to-transparent-gradient-left,.black-to-transparent-gradient-right').addClass('timeline-ignore').fadeOut();
      let nheight = (width/imageAspect)*mod;
      let nwidth = width*mod;
      let hdiff = nheight-height;
      let wdiff = nwidth-width;
      $('#timeline').css({
          'height': nheight,
          'width': nwidth,
          'top': offset - hdiff/2,
          'left': -wdiff/2
      });
    } else {
      let nheight = height*mod;
      let nwidth = width*mod;
      let hdiff = nheight-height;
      let wdiff = nwidth-width;
      $('#timeline').css({
          'height': nheight,
          'width': nwidth,
          top: offset - hdiff/2,
          left: -wdiff/2
      });
    }
    return true;
  }

  showBorder(show=1) {
    if (show) {
      $('#timeline > div:not(.timeline-ignore)').fadeIn();
    } else {
      $('#timeline > div:not(.timeline-ignore)').fadeOut();
    }
  }

  hideBorder(hide=1) {
    if (hide) {
      $('#timeline > div:not(.timeline-ignore)').fadeOut();
    } else {
      $('#timeline > div:not(.timeline-ignore)').fadeIn();
    }
  }

  scroll(direction) {
      let self = this;
      if (self.playing || self.playInterval) return;
      if (self.mode == 'video') self.totalFrames = self.fps * self.videojs.duration();

      if (!direction) {
        if (self.currentKeyframe <= 0) return;
        self.currentKeyframe--;
      } else {
        if (self.currentKeyframe >= self.keyframes.length) return;
        self.currentKeyframe++;
      }

      self.currentYoffset = window.pageYOffset;
      !direction ? self.playBackwards() : self.play();
  }

  playTo(id) {
    let self = this;
    if (id < 0 || id >= self.keyframes.length || id == self.currentKeyframe || self.playing || self.playInterval) return;
    let speed = Math.abs(self.keyframes[self.currentKeyframe] - self.keyframes[id]) / self.fps;
    id < self.currentKeyframe ? self.playBackwards(self.keyframes[id],speed) : self.play(self.keyframes[id],speed);
    self.log('playing to keyframe #'+id+', frame #'+self.keyframes[id]);
    self.currentKeyframe = id;
  }

  play(val,speed=1) {
    var self = this;
    if (self.playing || self.playInterval) return;
    self.playing = true;
    self.emit('play');

    if (self.mode == 'video') {
      self.videojs.play();

      self.playInterval = setInterval(function() {
        if (self.videojs.currentTime() >= val) {
          clearInterval(self.playInterval);
          self.playInterval = false;
          self.playing = false;
          self.videojs.pause();
          self.emit('pause');
        }
      }, self.deltaTime*1000);
    } else {
      if (val) self.currentKeyframe = parseInt(val);
      resetInterval(speed);

      function resetInterval(speed,allowReset=true) {
        clearInterval(self.playInterval);
        self.playInterval = setInterval(function() {
          $('#timeline img').attr('src', self._constructURL());
          self.currentFrame += Math.round(speed) > 3 ? 3 : Math.round(speed); //skip some frames if playing super fast

          if (self.currentFrame >= self.keyframes[self.currentKeyframe-1] && allowReset) resetInterval(1,false);

          if (self.currentFrame >= parseInt(val)-1) {
            self.currentFrame = parseInt(val);
            clearInterval(self.playInterval);
            self.playInterval = false;
            self.playing = false;
            self.emit('pause');
          }
        }, self.deltaTime*1000/speed);
      }
    }
  }

  playBackwards(val,speed=1) {
    var self = this;
    if (self.playing || self.playInterval) return;
    self.playing = true;
    self.emit('play');

    if (self.mode == 'video') {
      self.playInterval = setInterval(function() {
        let currentTime = self.videojs.currentTime();
        self.videojs.currentTime(currentTime-self.deltaTime);
        if (currentTime <= val) {
          clearInterval(self.playInterval);
          self.playInterval = false;
          self.playing = false;
          self.emit('pause');
        }
      }, self.deltaTime*1000*speed);
    } else {
      if (val) self.currentKeyframe = parseInt(val);
      resetInterval(speed);

      function resetInterval(speed,allowReset=true) {
        clearInterval(self.playInterval);
        self.playInterval = setInterval(function() {
          $('#timeline img').attr('src', self._constructURL());
          self.currentFrame -= Math.round(speed) > 3 ? 3 : Math.round(speed); //skip some frames if playing super fast

          if (self.currentFrame <= self.keyframes[self.currentKeyframe+1] && allowReset) resetInterval(1,false);

          if (self.currentFrame == parseInt(val)-1) {
            self.currentFrame = parseInt(val);
            clearInterval(self.playInterval);
            self.playInterval = false;
            self.playing = false;
            self.emit('pause');
          }
        }, self.deltaTime*1000/speed);
      }
    }
  }

  changeSource(url) {
    let self = this;
    if (self.mode == 'video') {
      //TODO implement transitioning video source
    } else if (self.mode == 'sequence') {
      self.src = url;
      self._setURL();
      url = self._constructURL();
      self.animating = true;

      $('#timeline').append(`<img src="${url}"/>`)
      $('#timeline img').eq(0).fadeOut("fast", function() {self.animating = false; $(this).css('zIndex','2'); self.emit('changeSource'); $('#timeline img').eq(0).remove();});
      $('#timeline img').eq(1).fadeIn("fast");
      self._cache();
    }
  }

  log(msg, type=0) {
    let prefix = "timeline.js";
    switch(type) {
      case 1:
        type = "ERROR";
        break;
      case 2:
        type = "INFO";
        break;
      default:
        type = "DEBUG";
        break;
    }

    console.log(`${prefix} ${type}: ${msg}`);
  }

  set fps(fps) {
    this.deltaTime = 1/fps;
    if (this.mode == 'video') this.totalFrames = fps * this.videojs.duration();
    this._fps = fps;
  }

  get fps() {
    return this._fps;
  }

  _setURL() {
    let self = this;
    self.filetype = self.src.split('.').pop();
    self.suffix = self.src.match(/[0-9]{1,}/g);
    self.suffix = self.suffix[self.suffix.length-1];
    self.prefix = self.src.split(self.suffix)[0];
  }

  _constructURL(id=undefined) {
    let self = this;
    var suffix;
    if (id) suffix = Array(self.suffix.length-id.toString().length+1).join("0") + id.toString();
    else suffix = Array(self.suffix.length-self.currentFrame.toString().length+1).join("0") + self.currentFrame.toString();
    return self.prefix + suffix + '.' + self.filetype;
  }

  _cache() {
    //TODO if source is changed while caching, cancel the current cache job
    let self = this;

    //cache the most relevant frames first
    for (let i = 0; i <= Math.round(self.keyframes.length); i++) {
      setTimeout(function(){cacheFrameSet(self.currentKeyframe+i, loadedCallback);}, 5*i);
      if (i !== 0) setTimeout(function(){cacheFrameSet(self.currentKeyframe-i, loadedCallback);}, 5*i);
    }

    function cacheFrameSet(id, fn) {
      if (!frameIsValid(id)) return;
      
      let start = self.keyframes[id], end = self.keyframes[id+1];
      let total = end-start;
      let loaded = 0;
      let error = 0;

      for (let i = start; i <= end; i++) {
        let suffix = self._constructURL(i);

        $.loadImage(suffix)
          .done(function(image) {
            //console.log('cached '+suffix);
            if (++loaded + error >= total) {
              if (typeof fn === 'function') fn(id,loaded,error);
            }
          })
          .fail(function(image) {
            //console.log('failed to cache '+suffix);
            if (++error + loaded >= total) {
              if (typeof fn === 'function') fn(id,loaded,error);
            }
          });
      } 
    }

    let loadedTrack = [];
    let loadedTotal = 0;
    let errorTotal = 0;
    function loadedCallback(id,loaded,error) {
      if (loadedTrack.indexOf(id) > -1) return;
      else loadedTrack.push(id);
      loadedTotal += loaded;
      errorTotal += error;
      self.log('finished loading frame set '+id+' ('+loaded+' loaded, '+error+' errors)',2);
      self.emit('loaded'+id);

      if (loadedTrack.length >= self.keyframes.length-1) {
        self.emit('loaded');
        self.log('load complete ('+loadedTotal+' loaded, '+errorTotal+' errors)',2);
      }
    }

    function frameIsValid(id) {
      if (id < 0 || id >= self.keyframes.length-1) return false;
      return true;
    }
  }
} 

