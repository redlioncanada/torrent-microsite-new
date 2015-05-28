class Timeline extends Messenger {
	constructor(opts) {
    super();
    if (!opts) {this.log("opts is undefined, need an id", 1); return;}
    this.mode = opts.mode;
    if (opts.mode == 'video') {
      this._forwardVideo = undefined;
      this._backwardVideo = undefined;
      $('#timeline #forward').css('zIndex','2');
      $('#timeline #backward').css('zIndex','1');
      if (!opts.fps) {this.log("fps is undefined, assuming 30fps", 2); this.fps = 30;} else {this.fps = opts.fps;}
    }

    this.border = opts.border;
    this.playing = false;
    this.playInterval = undefined;
    this.keyframes = opts.keyframes;
    this.currentKeyframe = this.mode == 'video' ? -1 : 0;
    this.currentFrame = parseInt(this.keyframes[0]);
    this.currentYoffset = window.pageYOffset;
    this.ready = false;
    this.forwardReady = false;
    this.backwardReady = false;

    let self = this;
    if (opts.mode == 'sequence') {
      self.fps = opts.fps;
      self._setURL();
      self._cache();
      self.keyframes[self.keyframes.length-1] -= 1; //you're a wizard harry
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
  }

  init() {
    var self = this;
    var initInterval = setInterval(function() {
        if (self.redraw()) clearInterval(initInterval);
    },200);
    $(window).resize(self.redraw);

    self.forwardVideo.play();
    self.forwardVideo.pause();
    self.forwardVideo.currentTime(self.currentKeyframe);
    self.backwardVideo.play();
    self.backwardVideo.pause();
    self.backwardVideo.currentTime(self.backwardVideo.duration());

    self.forwardVideo.on('loadeddata', function(){loadedCallback(1);});
    self.backwardVideo.on('loadeddata', function(){loadedCallback(0);});

    function loadedCallback(dir) {
      if (dir) self.forwardReady = true;
      else self.backwardReady = true;
      if ((!dir && self.forwardReady) || (dir && self.backwardReady)) {
        self.duration = self.forwardVideo.duration();
        self.emit('loaded');
        self.ready = true;
      }
    }
  }

  redraw() {
    //make sure video's aspect/position is maintained
    let menuSize = isPhone ? 50 : 116;
    let width = $(window).width();
    let height = $(window).height() - menuSize;
    let viewportAspect = width/height;
    let imageAspect = 16/9;
    if (isNaN(imageAspect) || !imageAspect) return false;

    let mod = 1.2;

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
          'top': menuSize - hdiff/2,
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
          'top': menuSize - hdiff/2,
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
          top: menuSize - hdiff/2,
          left: -wdiff/2
      });
    }
    return true;
  }

  showBorder(show=1) {
    if (show) {
      $('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeIn();
    } else {
      $('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeOut();
    }
  }

  hideBorder(hide=1) {
    if (hide) {
      $('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeOut();
    } else {
      $('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeIn();
    }
  }

  next() {
    this.playTo(self.currentKeyframe+1);
  }

  prev() {
    this.playTo(self.currentKeyframe-1);
  }

  playTo(id) {
    let self = this;
    if (id < 0 || id >= self.keyframes.length || id == self.currentKeyframe || self.playing || self.playInterval) return false;
    let speed = 1;
    if (self.mode === 'video') {
      let idDiff = Math.abs(self.currentKeyframe - id);
      let timeDiff = Math.abs(self.keyframes[self.currentKeyframe] - self.keyframes[id]);
      speed = idDiff > 1 ? 1/timeDiff : undefined;
      self.log('playing to keyframe #'+id+', time '+self.keyframes[id]+'s');
    } else {
      speed = Math.abs(self.keyframes[self.currentKeyframe] - self.keyframes[id]) / self.fps;
      self.log('playing to keyframe #'+id+', frame #'+self.keyframes[id]);
    }
    self.keyframes[id] < self.keyframes[self.currentKeyframe] ? self.play(self.keyframes[id],0,speed) : self.play(self.keyframes[id],1,speed);
    self.currentKeyframe = id;
    return true;
  }

  play(val,direction,speed) {
    var self = this;
    if (self.playing || self.playInterval) return;
    self.playing = true;
    self.emit('play');

    let primary = undefined, secondary = undefined;
    if (direction) {
      primary = self.forwardVideo;
      secondary = self.backwardVideo;
      $('#timeline #forward').css('zIndex','2');
      $('#timeline #backward').css('zIndex','1');
    } else {
      primary = self.backwardVideo;
      secondary = self.forwardVideo;
      $('#timeline #forward').css('zIndex','1');
      $('#timeline #backward').css('zIndex','2');
    }

    if (self.mode == 'video') {
      if (!speed) primary.play();

      val = direction ? val : Math.abs(self.duration-val);
      self.playInterval = setInterval(function() {
        let ct = primary.currentTime();
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
          secondary.currentTime(Math.abs(ct-self.duration));
          self.emit('pause');
        }
      }, speed ? speed*1000 : 0.05);
    } else {
      if (val) self.currentKeyframe = parseInt(val);
      direction = direction ? 1 : -1;
      let delta = Math.round(speed) > 3 ? 3*direction : direction; //skip some frames if playing super fast 
      resetInterval();

      function resetInterval(allowReset=true) {
        clearInterval(self.playInterval);
        self.playInterval = setInterval(function() {
          let lastFrame = self.currentFrame;
          self.currentFrame += delta; 

          if ((direction == 1 && self.currentFrame > self.keyframes[self.currentKeyframe-1] || direction == -1 && self.currentFrame <= self.keyframes[self.currentKeyframe+1]) && allowReset) resetInterval(1,false);

          if ((direction == 1 && self.currentFrame > parseInt(val)-1) || (direction == -1 && self.currentFrame < parseInt(val)+1)) {
            self.currentFrame = parseInt(val);
            $('#timeline .timeline-frame-'+self.currentFrame).css({'zIndex':'2','display':'block'});
            $('#timeline .timeline-frame').not('#timeline .timeline-frame-'+self.currentFrame).css({'zIndex':'1','display':'none'});
            $('#timeline .timeline-frame').removeClass('old');
            clearInterval(self.playInterval); 
            self.playInterval = false;
            self.playing = false;
            self.emit('pause');
            return;
          }

          //display current frame
          $('#timeline .timeline-frame-'+self.currentFrame).not('.old').css({'zIndex':'2','display':'block'});

          console.log(lastFrame,self.currentFrame);
          if (delta == 0) return;
          if (direction == 1) {
            //buffer surrounding frames
            $('#timeline .timeline-frame-'+(self.currentFrame+delta)).not('.old').css({'zIndex':'1','display':'block'});
            //discard old frame(s)
            $('#timeline .timeline-frame-'+(self.currentFrame-delta)).css({'zIndex':'1','display':'none'}).addClass('old');
          } else if (direction == -1) {
            //buffer surrounding frames
            $('#timeline .timeline-frame-'+(self.currentFrame+delta)).not('.old').css({'zIndex':'1','display':'block'});
            //discard old frame(s)
            $('#timeline .timeline-frame-'+(self.currentFrame-delta)).css({'zIndex':'1','display':'none'}).addClass('old');
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
      $('#timeline').attr('data-src',url);
      self._setURL();
      url = self._constructURL();
      self.animating = true;
      self.loaded = false;

      $('#timeline img').fadeOut("fast", function() {
        self.animating = false; 
        self.emit('changeSource'); 
        $('#timeline img').remove();
      });
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

  set forwardVideo(v) {
    this._forwardVideo = v;
    if (this._backwardVideo) this.init();
  }

  get forwardVideo(v) {
    return this._forwardVideo;
  }

  set backwardVideo(v) {
    this._backwardVideo = v;
    if (this._forwardVideo) this.init();
  }

  get backwardVideo(v) {
    return this._backwardVideo;
  }

  set fps(fps) {
    this.deltaTime = 1/fps;
    if (this.mode == 'video' && this.forwardVideo) {
      this.duration = this.forwardVideo.duration();
      this.totalFrames = fps * this.duration;
    }
    this._fps = fps;
  }

  get fps() {
    return this._fps;
  }

  _setURL() {
    let self = this;
    self.src = $('#timeline').attr('data-src');
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

    $('#timeline').append(`<img/>`);
    $('#timeline img').attr('src', self._constructURL()).addClass('timeline-frame timeline-frame-'+self.currentFrame);

    //cache the most relevant frames first
    for (let i = 0; i <= Math.round(self.keyframes.length); i++) {
      cacheFrameSet(self.currentKeyframe+i, loadedCallback);
      if (i !== 0) cacheFrameSet(self.currentKeyframe-i, loadedCallback);
    }

    function cacheFrameSet(id, fn) {
      if (!frameIsValid(id)) return;
      
      let start = parseInt(self.keyframes[id]), end = parseInt(self.keyframes[id+1]);
      let total = end-start;
      let loaded = 0;
      let error = 0;

      for (let i = start; i < end; i++) {
        if (i == 0) {total -= 1; continue;}
        let suffix = self._constructURL(i);

        $.loadImage(suffix)
          .done(function(image) {
            $(image).addClass('timeline-frame timeline-frame-'+i).css({'display':'none','zIndex':'1'});
            $('#timeline').append(image);
            if (++loaded + error >= total) {
              if (typeof fn === 'function') fn(id,loaded,error);
            }
          })
          .fail(function(image) {
            self.log('failed to cache '+suffix,1);
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

