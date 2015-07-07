class Timeline extends Messenger {
	constructor(opts) {
    super();
    if (!opts) {this.log("opts is undefined, need an id", 1); return;}
    this.mode = opts.mode;
    if (opts.mode == 'video') {
      this._forwardVideo = undefined;
      this._backwardVideo = undefined;
      $jq('#timeline #forward').css('zIndex','2');
      $jq('#timeline #backward').css('zIndex','1');
      if (!opts.fps) {this.log("fps is undefined, assuming 30fps", 2); this.fps = 30;} else {this.fps = opts.fps;}
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
    this.currentKeyframe = this.mode == 'video' ? -1 : 0;
    this.currentFrame = parseInt(this.keyframes[0]);
    this.currentYoffset = window.pageYOffset;
    this.ready = false;
    this.forwardReady = false;
    this.backwardReady = false;
    this.disabled = false;
    this.quedPlay = false;
    this.looping = false;
    this.stopLoopDirection = 1;
    this.enabled = true;
    this.scrollDirection = 1;

    let self = this;
    if (opts.mode == 'sequence') {
      self.fps = opts.fps;
      self._setURL();
      self._cache();
      self.keyframes[self.keyframes.length-1] -= 1; //you're a wizard harry
    }

    if (this.border) {
      $jq('#timeline').append('<div style="display: none;" class="black-to-transparent-gradient-top"></div>')
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
    $jq(window).resize(self.redraw);

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
    let width = $jq(window).width();
    let height = $jq(window).height() - menuSize;
    let viewportAspect = width/height;
    let imageAspect = 16/9;
    if (isNaN(imageAspect) || !imageAspect) return false;
    let mod = 1;
    //if (height < 800) mod = 1;
    //else mod = 1.2;

    $jq('.black-to-transparent-gradient-top,.black-to-transparent-gradient-bottom,.black-to-transparent-gradient-left,.black-to-transparent-gradient-right').removeClass('timeline-ignore');
    if (viewportAspect > imageAspect) {
      $jq('.black-to-transparent-gradient-top,.black-to-transparent-gradient-bottom').addClass('timeline-ignore').fadeOut();
      let nheight = height*mod;
      let nwidth = height*imageAspect*mod;
      let hdiff = nheight-height;
      let wdiff = nwidth-width;
      $jq('#timeline').css({
          'height': nheight,
          'width': nwidth,
          'top': menuSize - hdiff/2,
          'left': -wdiff/2
      });
    } else if (viewportAspect < imageAspect) {
      $jq('.black-to-transparent-gradient-left,.black-to-transparent-gradient-right').addClass('timeline-ignore').fadeOut();
      let nheight = (width/imageAspect)*mod;
      let nwidth = width*mod;
      let hdiff = nheight-height;
      let wdiff = nwidth-width;
      $jq('#timeline').css({  
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
      $jq('#timeline').css({
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
      $jq('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeIn();
    } else {
      $jq('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeOut();
    }
  }

  hideBorder(hide=1) {
    if (hide) {
      $jq('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeOut();
    } else {
      $jq('#timeline > div:not(.timeline-ignore,#forward,#backward)').fadeIn();
    }
  }

  next() {
    this.playTo(this.currentKeyframe+1);
  }

  prev() {
    this.playTo(this.currentKeyframe-1);
  }

  playTo(id) {
    let self = this;
    if (id < 0 || id >= self.keyframes.length || id == self.currentKeyframe || self.playing || self.playInterval) return false;
    self.clearAnimation();
    let lastFrame = self.currentKeyframe;
    self.currentKeyframe = id;

    let speed = 1;
    if (self.mode === 'video') {
      let idDiff = Math.abs(lastFrame - id);
      let timeDiff = Math.abs(self.keyframes[lastFrame] - self.keyframes[id]);
      speed = idDiff > 1 ? 1/timeDiff : undefined;
      self.log('playing to keyframe #'+id+', time '+self.keyframes[id]+'s');
    } else {
      speed = Math.abs(self.keyframes[lastFrame] - self.keyframes[id]) / self.fps;
      self.log('playing to keyframe #'+id+', frame #'+self.keyframes[id]);
    }
    self.keyframes[id] < self.keyframes[lastFrame] ? self.play(self.keyframes[id],0,speed) : self.play(self.keyframes[id],1,speed);
    return true;
  }

  play(val,direction,speed) {
    var self = this;
    if ((self.playing || self.playInterval || self.disabled) && !self.looping) return;

    self.playing = true;
    self.animating = true;
    $jq('#timeline .timeline-frame').removeClass('old');
    self.emit('play');

    let primary = undefined, secondary = undefined;
    if (direction) {
      primary = self.forwardVideo;
      secondary = self.backwardVideo;
      $jq('#timeline #forward').css('zIndex','2');
      $jq('#timeline #backward').css('zIndex','1');
    } else {
      primary = self.backwardVideo;
      secondary = self.forwardVideo;
      $jq('#timeline #forward').css('zIndex','1');
      $jq('#timeline #backward').css('zIndex','2');
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
          clearInterval(self.playInterval);
          self.playInterval = false;
          self.playing = false;
          self.animating = false;
          primary.pause();
          secondary.currentTime(Math.abs(ct-self.duration));
          self.emit('pause');
        }
      }, speed ? speed*1000 : 0.05);
    } else {
      direction = direction ? 1 : -1;
      let delta = Math.round(speed) > 3 ? 3*direction : direction; //skip some frames if playing super fast 
      resetInterval();


        if (direction == 1 && self.animation) {
          if (self.animation[self.currentKeyframe] && typeof self.animation[self.currentKeyframe] === 'object') {
            for (let j in self.animation[self.currentKeyframe]) {
              if (typeof self.animation[self.currentKeyframe][j]['startDown'] === 'function') {
                self.animation[self.currentKeyframe][j]['startDown'].call();
              }
            }
          }
        }
        if ((direction == 0 || direction == -1) && self.animation) {
          if (self.animation[self.currentKeyframe+1] && typeof self.animation[self.currentKeyframe+1] === 'object') {
            for (let j in self.animation[self.currentKeyframe+1]) {
              if (typeof self.animation[self.currentKeyframe+1][j]['startUp'] === 'function') {
                self.animation[self.currentKeyframe+1][j]['startUp'].call();
              }
            }
          }
        }
      

      function resetInterval(allowReset=true) {
        clearInterval(self.playInterval);
        self.playInterval = setInterval(function() {
          let lastFrame = self.currentFrame;
          if ((self.currentFrame + delta > self.keyframes[self.currentKeyframe] && delta > 0) || (self.currentFrame + delta < self.keyframes[self.currentKeyframe] && delta < 0)) self.currentFrame = self.keyframes[self.currentKeyframe];
          else self.currentFrame += delta; 


            if ((direction == 1 && self.currentFrame > self.keyframes[self.currentKeyframe-1] || direction == -1 && self.currentFrame <= self.keyframes[self.currentKeyframe+1]) && allowReset) resetInterval(1,false);

            let loopFrameIndex = self._hasTweenFrame();
            let loopFrame = loopFrameIndex == -1 ? false : self.tweenframes[loopFrameIndex];

            if ((direction == 1 && self.currentFrame > parseInt(val)-1) || (direction == -1 && self.currentFrame < parseInt(val)+1) || (direction == -1 && loopFrame && loopFrameIndex > -1 && self.currentFrame <= loopFrame)) {
              if (direction == 1 && self.animation) {
                if (self.animation[self.currentKeyframe] && typeof self.animation[self.currentKeyframe] === 'object') {
                  for (let i in self.animation[self.currentKeyframe]) {
                    if (typeof self.animation[self.currentKeyframe][i]['endDown'] === 'function') {
                      self.animation[self.currentKeyframe][i]['endDown'].call();
                    }
                  }
                }
              }
              if ((direction == -1 || direction == 0) && self.animation) {
                if (self.animation[self.currentKeyframe+1] && typeof self.animation[self.currentKeyframe+1] === 'object') {
                  for (let i in self.animation[self.currentKeyframe+1]) {
                    if (typeof self.animation[self.currentKeyframe+1][i]['endUp'] === 'function') {
                      self.animation[self.currentKeyframe+1][i]['endUp'].call();
                    }
                  }
                }
              }
            

            if (Math.abs(self.currentFrame - parseInt(val)) <= 1) self.currentFrame = parseInt(val);
              $jq('#timeline .timeline-frame-'+self.currentFrame).css({'zIndex':'2','display':'block'});
              $jq('#timeline .timeline-frame').not('#timeline .timeline-frame-'+self.currentFrame).css({'zIndex':'1','display':'none'});
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
          $jq('#timeline .timeline-frame-'+self.currentFrame).not('.old').css({'zIndex':'2','display':'block'});

          if (delta == 0) return;
          if (direction == 1) {
            //buffer surrounding frames
            $jq('#timeline .timeline-frame-'+(self.currentFrame+delta)).not('.old').css({'zIndex':'1','display':'block'});
            //discard old frame(s)
            $jq('#timeline .timeline-frame-'+(self.currentFrame-delta)).css({'zIndex':'1','display':'none'}).addClass('old');
          } else if (direction == -1) {
            //buffer surrounding frames
            $jq('#timeline .timeline-frame-'+(self.currentFrame+delta)).not('.old').css({'zIndex':'1','display':'block'});
            //discard old frame(s)
            $jq('#timeline .timeline-frame-'+(self.currentFrame-delta)).css({'zIndex':'1','display':'none'}).addClass('old');
          }
        }, self.deltaTime*1000/speed);
      }
    }
  }

  loop() {
    let self = this;
    let loopFrameIndex = self._hasTweenFrame();
    let loopFrame = self.tweenframes[loopFrameIndex];
    if (!loopFrame || self.looping) return;
    self.emit('loop');
    self.looping = true;

    resetInterval();

    let delta = 1;
    function resetInterval() {
      clearInterval(self.playInterval);
      self.playInterval = setInterval(function() {
        //display current frame
        $jq('#timeline .timeline-frame-'+self.currentFrame).not('.old').css({'zIndex':'2','display':'block'});
        //buffer surrounding frames
        $jq('#timeline .timeline-frame-'+(self.currentFrame+delta)).not('.old').css({'zIndex':'1','display':'block'});
        //discard old frame(s)
        $jq('#timeline .timeline-frame-'+(self.currentFrame-delta)).css({'zIndex':'1','display':'none'}).addClass('old');
        
        if (self.currentFrame >= loopFrame) {
          let doesLoop = self.looptweens[loopFrameIndex];

          if ((self.looping || (!self.looping && !self.stopLoopDirection)) && doesLoop) {
            let baseFrame = parseInt(self.keyframes[self.currentKeyframe]);
            $jq('#timeline .timeline-frame-'+baseFrame).css({'zIndex':'2','display':'block'});
            $jq('#timeline .timeline-frame-'+self.currentFrame).css({'zIndex':'1','display':'none'});
            $jq('#timeline .timeline-frame').not('#timeline .timeline-frame-'+baseFrame).css({'zIndex':'1','display':'none'});
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

      }, self.deltaTime*1000);
    }
  }

  stopLoop(d=1) {
    clearInterval(this.playInterval);
    this.stopLoopDirection = d;
    this.playInterval = false;
    this.playing = false;
    this.animating = false;
    this.looping = false;
  }

  _hasTweenFrame(id) {
    for (var i in this.tweenframes) {
      if (this.tweenframes[i] > parseInt(this.keyframes[this.currentKeyframe]) && this.tweenframes[i] < parseInt(this.keyframes[this.currentKeyframe+1])) return parseInt(i);
    }
    return -1;
  }

  scrollDirection(d) {
    this.scrollDirection = d;
  }

  disable() {
    this.disabled = true;
    this.enabled = false;
    $jq('#timeline').hide();
    $jq('.timeline-animation').remove();
  }

  enable() {
    this.disabled = false;
    this.enabled = true;
    $jq('#timeline').show();
  }

  changeSource(url) {
    let self = this;
    if (self.mode == 'video') {
      //TODO implement transitioning video source
    } else if (self.mode == 'sequence') {
      $jq('#timeline .timeline-frame-'+self.currentFrame).addClass('remove');

      $jq('#timeline').attr('data-src',url);
      self._setURL();
      url = self._constructURL();

      self._cache();

      timeline.on('currentFrameLoaded', function() {
        timeline.off('currentFrameLoaded', 'changeSource');
        self.animating = false; 
        self.emit('changeSource');
      }, 'changeSource');
      
      $jq('#timeline img').not('.remove,.added').fadeOut("fast");
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

  clearAnimation() {
    $jq('.liquid-animation').stop(true,true).fadeOut('fast',function() {
        $jq('.liquid-animation').remove();
    });
    $jq('.dial-animation').stop(true,true).fadeOut('fast',function() {
        $jq('.dial-animation').remove();
    });
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

  set color(color) {
    this._setURL
    this._color = color;
  }

  get color() {
    return this._color;
  }

  _setURL() {
    let self = this;
    self.src = $jq('#timeline').attr('data-src');
    self.filetype = self.src.split('.').pop();
    self.suffix = self.src.match(/[0-9]{1,}/g);
    self.suffix = self.suffix[self.suffix.length-1];
    self.prefix = self.src.split(self.suffix)[0];
  }

  _getURL(url) {
    let src=url;
    let suffix = src.match(/[0-9]{1,}/g);
    suffix = suffix[suffix.length-1];
    return {
      src: url,
      filetype: src.split('.').pop(),
      suffix: suffix,
      prefix: src.split(suffix)[0]
    }
  }

  _constructURL(id=undefined,opts=undefined) {
    let self = this;
    var suffix;
    if (opts) {
      if (id) suffix = Array(opts.suffix.length-id.toString().length+1).join("0") + id.toString();
      else suffix = Array(opts.suffix.length-opts.currentFrame.toString().length+1).join("0") + opts.currentFrame.toString();
      return opts.prefix + suffix + '.' + opts.filetype;
    } else {
      if (id) suffix = Array(self.suffix.length-id.toString().length+1).join("0") + id.toString();
      else suffix = Array(self.suffix.length-self.currentFrame.toString().length+1).join("0") + self.currentFrame.toString();
      return self.prefix + suffix + '.' + self.filetype;
    }
  }

  _cache(hard=true,url) {
    //TODO if source is changed while caching, cancel the current cache job
    let self = this;

    if (hard) {
      let cf = self.currentFrame;
      let suf = self._constructURL();
      if ($jq('#timeline .remove').length) {
        let mt = $jq('#timeline img').css('marginTop');
        $jq('#timeline').append(`<img style="display:none; z-index:2; margin-top:${mt}" class="added timeline-frame timeline-frame-${cf}" src="${suf}"/>`);
      } else {
        $jq('#timeline-frame-'+cf).attr('src',suf);
      }
    }

    if ((hard && self.cached.indexOf(self.color) > -1) || (!hard && self.cached.indexOf(self.cacheColor) > -1)) {
      for (var i = 0; i<= self.keyframes[self.keyframes.length-1]; i++) {
        let suffix = self._constructURL(i);
        $jq('#timeline .timeline-frame-'+i).attr('src',suffix);
      }
      setTimeout(function(){
        $jq('#timeline .remove').fadeOut('fast', function() {$jq(this).remove();});
        $jq('#timeline .added').delay(200).fadeIn('fast', function() {$jq(this).removeClass('added');});
        self.emit('currentFrameLoaded');
      },300);
      return;
    }

    self.ready = false;
    self.totalFrames = parseInt(self.keyframes[self.keyframes.length-1]);
    self.loadedFrames = 0;
    self.percentLoaded = 0;

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
        let suffix = undefined;
        if (url) {
          let opts = self._getURL(url);
          suffix = self._constructURL(i,opts);
        } else {
          suffix = self._constructURL(i);
        }

        $jq.loadImage(suffix)
          .done(function(image) {
            self.loadedFrames++;
            if (hard && self.cached.length == 0) {
              $jq(image).addClass('timeline-frame timeline-frame-'+i).css({'display':'none','zIndex':'1'});
              $jq('#timeline').append(image);
            } else if (hard && self.cached.length > 0) {
              $jq('#timeline .timeline-frame-'+i).attr('src',$jq(image).attr('src'));
              if (i == self.currentFrame) $jq('#timeline .timeline-frame-'+i).attr({'opacity':0,'display':'block'}).animate({'opacity':1},400, function() {
                self.emit('currentFrameLoaded');
              });
            }

            let newLoadPercent = Math.round((self.loadedFrames / self.totalFrames)*100);
            if (self.percentLoaded != newLoadPercent) self.emit('loadedPercent'+self.percentLoaded);
            self.percentLoaded = newLoadPercent;

            if (++loaded + error >= total) {
              if (typeof fn === 'function') fn(id,loaded,error);
            }
          })
          .fail(function(image) {
            self.log('failed to cache '+suffix,1);
            self.loadedFrames++;
            self.percentLoaded = self.loadedFrames / self.totalFrames;
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
        self.cached.push(self.cacheColor);
        $jq('.color-picker .'+self.cacheColor).removeClass('unloaded').addClass('loaded');
        self.ready = true;
        self.log('load complete ('+loadedTotal+' loaded, '+errorTotal+' errors)',2);
        self.emit('loaded');
      }
    }

    function frameIsValid(id) {
      if (id < 0 || id >= self.keyframes.length) return false;
      return true;
    }
  }
} 

