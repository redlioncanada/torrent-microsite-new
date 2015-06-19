class CoverScroller extends Messenger {
    constructor(opts,timeline) {
        super();
        let _self = this;
        if (opts) {
            this.duration = opts.duration*1000 || 1000;
        }
        this.target = $('.coverscroller > div');
        this.numElements = $(this.target).find('.cover').length;
        this.curCover = 0;
        this.animating = false;
        this.quedScroll = false;
        this.coverState = {};
        this.color = 'red';
        timeline ? this.timeline = timeline : undefined;

        for (var i=0; i<=this.numElements-1; i++) {
            _self.coverState[i] = false;
            let index = i;

            //track when a frameset loads
            if (_self.timeline) {
                _self.timeline.on('loaded'+index, function() {
                    _self.coverState[index] = true;
                });
            }
        }

        $('.cover-picker li').click(function() {
            let index = $(this).index();
            if (_self.coverState[index]) _self.scrollTo(index);
            else {
                //if a frameset is still loading, activate the loading overlay and wait until it's done
                _self.showLoader();
                if (_self.timeline) {
                    _self.timeline.on('loaded'+index, function() {
                        _self.timeline.off('loaded'+index);
                        _self.hideLoader();
                        _self.scrollTo(index);
                    });
                }
            }
        });

        $('.cover-picker li').hover(function() {
            $(this).find('div').eq(0).animate({opacity:1},400);
        }, function() {
            if (_self.curCover == 0) $(this).find('div').eq(0).animate({opacity:0.5},400);
        });

        this.redraw();
    }

    redraw() {
        //let menuSize = isPhone ? 50 : 116;  //magical
        let menuSize = 116;
        let height = $(window).height() - menuSize;
        let width = $(window).width();

        $('.cover-wrapper,.cover').css({
            'width': width,
            'height': height,
            'min-height': height
        });

        this.elHeight = height;
        this.emit('redraw');
        $(this.target).css('top',-this.elHeight*this.curCover);

        $('#loader').css({'width':width,'height':height,'top':menuSize});


        let coverTop = this.elHeight*this.curCover + this.elHeight / 2 - parseInt($('.cover-picker').height())/2;
        $('.cover-picker').css({top: coverTop});

        let multiplier = this.curCover === 0 ? 1 : this.curCover;
        let colorTop = this.elHeight*multiplier + this.elHeight / 2 - parseInt($('.color-picker').height())/2;
        if (this.curCover == 0) {
            $('.cover-picker li').not('.selected').find('div:first-child').css({'opacity':0.5});
        } else {
            $('.cover-picker li div:first-child').css({'opacity':1});
        }
        $('.color-picker').css({top: colorTop});

        $.each($('.color-picker li'), function(i,v) {
            if (i == 0) return;
            let t = $(this).find('div').eq(0).position().top;
            $(this).find('div').eq(1).css('top',t);
        });
    }

    showLoader() {
        this.coverState = {};
        $('#loader').fadeIn();
        this.emit('loading');
    }

    hideLoader() {
        $('#loader').fadeOut();
        this.emit('loaded');
    }

    disableCover(id) {
        if (id < 0 || id >= this.coverState.length) return;
        this.coverState[id] = false;
    }

    enableCover(id) {
        if (id < 0 || id >= this.coverState.length) return;
        this.coverState[id] = true;
    }

    scrollTo(id) {
        if (this.timeline && this.timeline.playing && !this.timeline.looping) return;
        if (this.quedScroll) return;
        let _self = this;

        this.direction = id < this.curCover ? 0 : 1;

        if (this.animating || this.curCover == id) return;
        if (id > this.numElements-1) {
            if (this.curCover == this.numElements-1) return;
            id = this.numElements-1;
        }
        if (id < 0) {
            if (this.curCover === 0) return;
            id = 0;
        }

        if (isMobile) {
            $('.cover-wrapper').animate({scrollTop: $('.cover-item-'+(id+1)).offset().top});
        } else {
            if (id == 0) $('.cover-picker li div:first-child').animate({opacity:0.5},400);
            else $('.cover-picker li div:first-child').animate({opacity:1},400);

            if (this.timeline.looping) {
                this.timeline.stopLoop(this.direction);
            }

            //animate cover
            this.animating = true;
            $(this.target).velocity({top:-this.elHeight*id}, {duration: this.duration, complete: function(){
                _self.emit('scrollEnd');
                _self.animating = false;
            }});

            //animate color and cover pickers, don't animate them to the first cover
            let multiplier = id === 0 ? 1 : id;
            let coverTop = this.elHeight*id + this.elHeight / 2 - parseInt($('.cover-picker').height())/2;
            $('.cover-picker').velocity({top: coverTop}, {duration: this.duration});
            $('.cover-picker').find('li').removeClass('selected');
            $('.cover-picker').find('li').eq(id).addClass('selected');

            let colorTop = this.elHeight*multiplier + this.elHeight / 2 - parseInt($('.color-picker').height())/2;
            $('.color-picker').velocity({top: colorTop}, {duration: this.duration});
        }

        this.curCover = id;
        this.emit('scroll');
    }

    scroll(direction=1) {
        if (this.timeline && this.timeline.playing && !this.timeline.looping) return;
        this.scrollTo(direction ? this.curCover+1 : this.curCover-1);
    }
}