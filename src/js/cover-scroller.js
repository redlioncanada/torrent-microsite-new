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
        this.coverState = {};
        if (timeline) this.timeline = timeline;

        for (var i=0; i<=this.numElements-1; i++) {
            _self.coverState[i] = false;
            let index = i;

            //track when a frameset loads
            if (timeline) {
                _self.timeline.on('loaded', function() {
                    _self.hideLoader();
                    _self.coverState[index] = true;
                });
            } else {
                _self.hideLoader();
            }
        }

        $('.cover-picker li').click(function() {
            let index = $(this).index();
            //if (_self.coverState[index]) _self.scrollTo(index);
            _self.scrollTo(index);
            /*else {
                //if a frameset is still loading, activate the loading overlay and wait until it's done
                _self.showLoader();
                _self.timeline.on('loaded'+index, function() {
                    _self.timeline.off('loaded'+index);
                    _self.hideLoader();
                    _self.scrollTo(index);
                });
            }*/
        });

        this.redraw();
    }

    redraw() {
        let menuSize = isPhone ? 50 : 116;  //magical
        let height = $(window).height() - menuSize;
        let nheight = height - $('#navbar-wrapper').height();
        menuSize += $('#navbar-wrapper').height();
        let width = $(window).width();

        $('.cover-wrapper,.cover').css({
            width: width,
            height: nheight
        });

        this.elHeight = nheight;
        this.emit('redraw');
        $(this.target).css('top',-this.elHeight*this.curCover);

        let multiplier = this.curCover === 0 ? 1 : this.curCover;
        let coverTop = this.elHeight*multiplier + this.elHeight / 2;
        $('.cover-picker').css({top: coverTop});

        let colorTop = this.elHeight*multiplier + this.elHeight / 2 - parseInt($('.color-picker').height())/2;
        $('.color-picker').css({top: colorTop});
    }

    showLoader() {
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
        if (this.timeline && this.timeline.playing) return;
        let _self = this;
        if (this.animating || this.curCover == id) return;
        if (id > this.numElements-1) {
            if (this.curCover == this.numElements-1) return;
            id = this.numElements-1;
        }
        if (id < 0) {
            if (this.curCover === 0) return;
            id = 0;
        }

        this.direction = id < this.curCover ? 0 : 1;

        if (isMobile) {
            $('.cover-wrapper').scrollTop($('.cover-item-'+(id+1)).offset().top);
        } else {
        //animate cover
            this.animating = true;
            $(this.target).velocity({top:-this.elHeight*id}, {duration: this.duration, complete: function(){
                _self.emit('scrollEnd');
                _self.animating = false;
            }});

            //animate color and cover pickers, don't animate them to the first cover
            let multiplier = id === 0 ? 1 : id;
            let coverTop = this.elHeight*multiplier + this.elHeight / 2;
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
        if (this.timeline && this.timeline.playing) return;
        this.scrollTo(direction ? this.curCover+1 : this.curCover-1);
    }
}