var timeline = undefined;
var isMobile = Modernizr.mobile;
var isPhone = Modernizr.phone;
var isTablet = Modernizr.tablet;
if (!isMobile) {
    timeline = new Timeline({
        fps: 24,
        keyframes: [2.5, 4.5, 4.55, 5.5, 7.5, 8.6, 10.3, 11.5, 12.6, 13.7, 15.7, 16.4, 17.3, 19],
        mode: 'video'
    });
    videojs("forward", {}, function() {
        timeline.forwardVideo = this;
    });
    videojs("backward", {}, function() {
        timeline.backwardVideo = this;
    });
}
var scroller = new CoverScroller({duration: 1},timeline);    //handles scrolling of page
var youtubePlayers = {};


$(document).ready(function(){

    //set header position
    if (isPhone) {
        $('.cover-wrapper').css('top', '100px');
        $('#navbar-wrapper').css('top', '50px');
    }

    //scroll the page on mousewheel scroll
    $('.cover-wrapper').mousewheel(function(event) {
        if (event.deltaY > 0) {
            scroller.scroll(1);
        } else if (event.deltaY < 0) {
            scroller.scroll(0);
        }
    });

    if (!isMobile) {
        timeline.redraw();
        $('#timeline *').animate({'marginTop':'-3%'});
    
        scroller.on('scroll', function () {
            //make sure blender is visible when a background is being displayed
            if (!isMobile) {
                if (this.curCover == 0) {
                    timeline.hideBorder();
                }

                //force correct positioning, temp
                if (this.curCover == 0) $('#timeline *').animate({'marginTop':'-3%'});
                else if (this.curCover == 3) $('#timeline *').animate({'marginTop':'7%'});
                else if (this.curCover == 4) $('#timeline *').animate({'marginTop':'2%'});
                else if (this.curCover == 6) $('#timeline *').animate({'marginTop':'-3%'});
                else if (this.curCover == 7) $('#timeline *').animate({'marginTop':'-5%'});
                else if (this.curCover == 11) $('#timeline *').animate({'marginTop':'-5%'});
                else $('#timeline *').animate({'marginTop':'0'});

                //play the video
                if (self.currentFrame != 0 && !(this.curCover == 11 && timeline.currentKeyframe > 11)) {
                    timeline.playTo(this.curCover-1);
                }

                if (this.curCover == 11 && this.direction) {
                    spinLeftClick();
                } else if (this.curCover == 11 && !this.direction) {
                    spinRightClick();
                }
            }
        });

        scroller.on('scrollEnd', function() {
            if (this.curCover != 0) {
                timeline.showBorder();
            }
        });

        $('#spin-right').click(spinRightClick);
        function spinRightClick() {
            timeline.playTo(timeline.currentKeyframe+1);
        }

        $('#spin-left').click(spinLeftClick);
        function spinLeftClick() {
            if (timeline.currentKeyframe > 11) {
                timeline.playTo(timeline.currentKeyframe-1);
            } else {
                scroller.scroll(0);
            }
        }
    }

    //init mobile gallery
    $('#slick-colors').slick({
        prevArrow: "<img class='slick-prev' src='/images/torrent/arrow.png'></img>",
        nextArrow: "<img class='slick-next' src='/images/torrent/arrow.png'></img>",
        lazyLoad: 'progressive'
    });

    //init photo slick gallery
    $('#view-photo .slick').slick({
        prevArrow: "<img class='slick-prev' src='/images/torrent/arrow.png'></img>",
        nextArrow: "<img class='slick-next' src='/images/torrent/arrow.png'></img>",
        lazyLoad: 'progressive'
    }).on('init', function(s) {
        placeCloseButton(s,'#view-photo');
    }).on('setPosition', function(s) {
        placeCloseButton(s,'#view-photo');
    }).on('beforeChange', function(s,c,n) {
        $('#view-photo .close-x').fadeOut('fast');
    }).on('afterChange', function(s,c) {
        placeCloseButton(s,'#view-photo');
    });

    function placeCloseButton(slick,element) {
        let slick1 = slick.target.slick;
        let id = slick1.currentSlide;
        let width = $(element+' .slick-track div').eq(id+1).find('img').width();
        let pwidth = $(element+' .slick').width();
        let offsetLeft = slick.currentTarget.offsetLeft;
        let newLeft = offsetLeft + ((pwidth - width)/2);
        $(element+' .close-x').css({'left': newLeft, 'top': slick.currentTarget.offsetTop}).fadeIn('fast');
    }

    //init video slick gallery
    $('#play-video .slick').slick({
        prevArrow: "<img class='slick-prev' src='/images/torrent/arrow.png'></img>",
        nextArrow: "<img class='slick-next' src='/images/torrent/arrow.png'></img>",
        lazyLoad: 'progressive'
    }).on('init', function(s) {
        placeCloseButton(s,'#play-video');
    }).on('setPosition', function(s) {
        placeCloseButton(s,'#play-video');
    }).on('beforeChange', function(s,c,n) {
        $('#view-photo .close-x').fadeOut('fast');
    }).on('afterChange', function(s,c) {
        placeCloseButton(s,'#play-video');
    });

    //on gallery background/close click, close the gallery
    $('.close-overlay,.close-x').click(function() {
        $('#view-photo,#play-video,#show-recipe').fadeOut();

        //pause youtube videos
        for (var i in youtubePlayers) {
            youtubePlayers[i].stopVideo();
        }
        $('.youtube-embed img').fadeIn();
    });

    //on view photos button click, show photo gallery
    $('.view-photos').click(function() {
        $('#view-photo').css('display', 'none').css('left', 'initial').fadeIn();
    });

    //on view videos button click, show video gallery
    $('.play-video').click(function() {
        $('#play-video').css('display', 'none').css('left', 'initial').fadeIn();
    });

    //on view recipes button click, show recipe
    $('#recipe').click(function() {
        $('#show-recipe').css('display', 'none').css('left', 'initial').fadeIn();
    });

    //on color click, change the timeline's sequence
    $('.color-picker li').click(function(e) {
        if (!isMobile) {
            let source = $(e.currentTarget).attr('data-source');
            timeline.changeSource(source);
        }
    });

    //on youtube poster click, embed the video and play it
    $('.youtube-embed').click(function() {
        if (YT) {
            let id = $(this).attr('data-id');
            let v = this;

            if (youtubePlayers.id) {
                $(v).find('img').fadeOut("fast", function() {
                    youtubePlayers.id.playVideo();
                });
            } else {
                let width = $(this).width();
                let height = $(this).height();
                $(this).append(`<iframe id="${id}" style="position: absolute;" src="http://www.youtube.com/embed/${id}?autoplay=1&controls=0&enablejsapi=1" height="${height}" width="${width} type="text/html" frameborder="0"/>`);

                setTimeout(function() {
                    $(v).find('img').fadeOut();
                    youtubePlayers.id = new YT.Player(id);
                },1000);
            }
        } else {
            console.log('youtube failed to load');
        }
    });

    //on window resize, resize components
    $(window).resize(function() {
        scroller.redraw();
        if (!isMobile) timeline.redraw();
    });
});