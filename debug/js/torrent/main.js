'use strict';

var timeline = undefined,
    scroller = undefined;
var isMobile = Modernizr.mobile;
var isPhone = Modernizr.phone;
var isTablet = Modernizr.tablet;
var youtubePlayers = {};

//if desktop, init will be called in index.html
if (isMobile) init();

function init() {
    scroller = new CoverScroller({ duration: 1 }, timeline); //handles scrolling of page

    //nav toggle
    $('#navbar-wrapper .navbar-toggle').click(function () {
        if ($('#navbar-wrapper .navbar-collapse').css('display') == 'block') {
            $('#navbar-wrapper .navbar-collapse').fadeOut();
        } else {
            $('#navbar-wrapper .navbar-collapse').fadeIn();
        }
    });
    $('#navbar-wrapper .navbar-nav li').click(function () {
        $('#navbar-wrapper .navbar-collapse').fadeOut();
    });

    //set header position
    if (isPhone) {
        $('.cover-wrapper').css('top', '100px');
        $('#navbar-wrapper').css('top', '50px');
    }

    if (!isMobile) {
        (function () {
            var spinRightClick = function () {
                timeline.playTo(timeline.currentKeyframe + 1);
            };

            var spinLeftClick = function () {
                if (timeline.currentKeyframe > 11) {
                    timeline.playTo(timeline.currentKeyframe - 1);
                } else {
                    scroller.scroll(0);
                }
            };

            //don't show scrollbar on desktop
            $('.cover-wrapper').css('overflow', 'hidden');

            //scroll the page on mousewheel scroll
            $('.cover-wrapper').mousewheel(function (event) {
                if (event.deltaY > 0) {
                    scroller.scroll(1);
                } else if (event.deltaY < 0) {
                    scroller.scroll(0);
                }
            });

            timeline.redraw();
            $('#timeline *').animate({ marginTop: '-3%' });

            scroller.on('scroll', function () {
                //make sure blender is visible when a background is being displayed
                if (!isMobile) {
                    if (this.curCover == 0) {
                        timeline.hideBorder();
                    }

                    //force correct positioning, temp
                    if (this.curCover == 0) $('#timeline *').animate({ marginTop: '-3%' });else if (this.curCover == 3) $('#timeline *').animate({ marginTop: '7%' });else if (this.curCover == 4) $('#timeline *').animate({ marginTop: '2%' });else if (this.curCover == 6) $('#timeline *').animate({ marginTop: '-3%' });else if (this.curCover == 7) $('#timeline *').animate({ marginTop: '-5%' });else if (this.curCover == 11) $('#timeline *').animate({ marginTop: '-5%' });else $('#timeline *').animate({ marginTop: '0' });

                    //play the video
                    if (self.currentFrame != 0 && !(this.curCover == 11 && timeline.currentKeyframe > 11)) {
                        timeline.playTo(this.curCover - 1);
                    }

                    if (this.curCover == 11 && this.direction) {
                        spinLeftClick();
                    } else if (this.curCover == 11 && !this.direction) {
                        spinRightClick();
                    }
                }
            });

            scroller.on('scrollEnd', function () {
                if (this.curCover != 0) {
                    timeline.showBorder();
                }
            });

            $('#spin-right').click(spinRightClick);

            $('#spin-left').click(spinLeftClick);
        })();
    }

    //init mobile gallery
    $('#slick-colors').slick({
        prevArrow: '<img class=\'slick-prev\' src=\'/images/torrent/arrow.png\'></img>',
        nextArrow: '<img class=\'slick-next\' src=\'/images/torrent/arrow.png\'></img>',
        lazyLoad: 'progressive'
    });

    //init photo slick gallery
    $('#view-photo .slick').slick({
        prevArrow: '<img class=\'slick-prev\' src=\'/images/torrent/arrow.png\'></img>',
        nextArrow: '<img class=\'slick-next\' src=\'/images/torrent/arrow.png\'></img>',
        lazyLoad: 'progressive'
    }).on('init', function (s) {
        placeCloseButton(s, '#view-photo');
    }).on('setPosition', function (s) {
        placeCloseButton(s, '#view-photo');
    }).on('beforeChange', function (s, c, n) {
        $('#view-photo .close-x').fadeOut('fast');
    }).on('afterChange', function (s, c) {
        placeCloseButton(s, '#view-photo');
    });

    function placeCloseButton(slick, element) {
        var slick1 = slick.target.slick;
        var id = slick1.currentSlide;
        var width = $(element + ' .slick-track div').eq(id + 1).find('img').width();
        var pwidth = $(element + ' .slick').width();
        var offsetLeft = slick.currentTarget.offsetLeft;
        var newLeft = offsetLeft + (pwidth - width) / 2;
        $(element + ' .close-x').css({ left: newLeft, top: slick.currentTarget.offsetTop }).fadeIn('fast');
    }

    //init video slick gallery
    $('#play-video .slick').slick({
        prevArrow: '<img class=\'slick-prev\' src=\'/images/torrent/arrow.png\'></img>',
        nextArrow: '<img class=\'slick-next\' src=\'/images/torrent/arrow.png\'></img>',
        lazyLoad: 'progressive'
    }).on('init', function (s) {
        placeCloseButton(s, '#play-video');
    }).on('setPosition', function (s) {
        placeCloseButton(s, '#play-video');
    }).on('beforeChange', function (s, c, n) {
        $('#view-photo .close-x').fadeOut('fast');
    }).on('afterChange', function (s, c) {
        placeCloseButton(s, '#play-video');
    });

    //on gallery background/close click, close the gallery
    $('.close-overlay,.close-x').click(function () {
        $('#view-photo,#play-video,#show-recipe').fadeOut();

        //pause youtube videos
        for (var i in youtubePlayers) {
            youtubePlayers[i].stopVideo();
        }
        $('.youtube-embed img').fadeIn();
    });

    //on view photos button click, show photo gallery
    $('.view-photos').click(function () {
        $('#view-photo').css('display', 'none').css('left', 'initial').fadeIn();
    });

    //on view videos button click, show video gallery
    $('.play-video').click(function () {
        $('#play-video').css('display', 'none').css('left', 'initial').fadeIn();
    });

    //on view recipes button click, show recipe
    $('.open-recipe').click(function () {
        $('#show-recipe').css('display', 'none').css('left', 'initial').fadeIn();
    });

    //on color click, change the timeline's sequence
    $('.color-picker li').click(function (e) {
        if (!isMobile) {
            var source = $(e.currentTarget).attr('data-source');
            timeline.changeSource(source);
        }
    });

    //on youtube poster click, embed the video and play it
    $('.youtube-embed').click(function () {
        var _this = this;

        if (YT) {
            (function () {
                var id = $(_this).attr('data-id');
                var v = _this;

                if (youtubePlayers.id) {
                    $(v).find('img').fadeOut('fast', function () {
                        youtubePlayers.id.playVideo();
                    });
                } else {
                    var width = $(_this).width();
                    var height = $(_this).height();
                    $(_this).append('<iframe id="' + id + '" style="position: absolute;" src="http://www.youtube.com/embed/' + id + '?autoplay=1&controls=0&enablejsapi=1" height="' + height + '" width="' + width + ' type="text/html" frameborder="0"/>');

                    setTimeout(function () {
                        $(v).find('img').fadeOut();
                        youtubePlayers.id = new YT.Player(id);
                    }, 1000);
                }
            })();
        } else {
            console.log('youtube failed to load');
        }
    });

    //on window resize, resize components
    $(window).resize(function () {
        scroller.redraw();
        if (!isMobile) {
            //don't show scrollbar on desktop
            $('.cover-wrapper').css('overflow', 'hidden');

            timeline.redraw();
        }
    });
}