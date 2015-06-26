'use strict';

var isMobile = Modernizr.mobile;
var isPhone = Modernizr.phone;
var isTablet = Modernizr.tablet;
var youtubePlayers = {};
var timeline = undefined;
var $jq = jQuery.noConflict();

if (!isMobile) {
    timeline = new Timeline({ //handles animation of video/sequence
        fps: 18,
        keyframes: ['00000', '00030', '00070', '00083', '00109', '00167', '00191', '00217', '00270', '00328', '00342', '00370', '00384', '00397', '00413'],
        tweenframes: [144, 202, 256],
        looptweens: [false, true, true],
        animation: {
            1: [{
                startDown: function startDown() {
                    var dW = $jq('.blender-1').width();
                    var dX = parseInt($jq('.cover-item-1 .desktop .col-xs-3').eq(0).width()) - dW - parseInt($jq('.blender-1').css('margin-right'));
                    var dY = parseInt($jq('.blender-1').offset().top) - parseInt($jq('.blender-1').css('margin-top')) + parseInt($jq('.blender-1').css('margin-bottom'));
                    var pW = $jq('#timeline img').width();
                    var pH = $jq('#timeline img').height();
                    var xOffset = (pW - $jq(window).width()) / 2;
                    var yOffset = (pH - $jq(window).height()) / 2;
                    var oW = pW * 0.1944921875;
                    var oX = pW * 0.334890625 - xOffset;
                    var oY = pH * 0.21944444444444 + $jq('#timeline').offset().top - 4;

                    var blender = $jq('.blender-1').clone().css({ left: dX, top: dY, width: dW, position: 'absolute', zIndex: 6049 }).removeClass('blender-1').addClass('blender-2 timeline-animation').appendTo('body');
                    $jq('.blender-1').hide();
                    $jq('#timeline').hide();
                    $jq('.blender-2').animate({ left: oX, top: oY, width: oW }, 600);
                },
                endDown: function endDown() {
                    setTimeout(function () {
                        $jq('#timeline').show();
                        $jq('.blender-2').remove();
                        $jq('.blender-1').show();
                    }, 500);
                },
                startUp: function startUp() {
                    var dW = $jq('.blender-1').width();
                    var pW = $jq('#timeline').width();
                    var pH = $jq('#timeline').height();
                    var xOffset = (pW - $jq(window).width()) / 2;
                    var yOffset = (pH - $jq(window).height()) / 2;
                    var oW = pW * 0.1944921875;
                    var oX = pW * 0.334890625 - xOffset;
                    var oY = pH * 0.21188888888889 - yOffset + 58;
                    var dX = parseInt($jq('.cover-item-1 .desktop .col-xs-3').eq(0).width()) - dW - parseInt($jq('.blender-1').css('margin-right'));
                    var dY = parseInt($jq('.blender-1').offset().top) - parseInt($jq('.blender-1').css('margin-top')) + parseInt($jq('.blender-1').css('margin-bottom')) + $jq('.cover').height();

                    var blender = $jq('.blender-1').clone().css({ left: oX, top: oY, width: oW, position: 'absolute', zIndex: 6049 }).removeClass('blender-1').addClass('blender-2 timeline-animation').appendTo('body');
                    $jq('.blender-1').hide();
                    $jq('#timeline').hide();
                    $jq('.blender-2').animate({ left: dX, top: dY, width: dW }, 600);
                },
                endUp: function endUp() {
                    setTimeout(function () {
                        $jq('#timeline').hide();
                        $jq('.blender-2').remove();
                        $jq('.blender-1').show();
                    }, 500);
                }
            }],
            3: [{
                startDown: function startDown() {
                    $jq('.cover-item-4 .desktop ul li img').each(function (id) {
                        $jq(this).css('opacity', 0);
                    });
                },
                endDown: function endDown() {

                    setTimeout(function () {
                        $jq('.cover-item-4 .desktop ul li img').each(function (id) {
                            var self = this;
                            $jq(this).css('opacity', 1);
                            var dX = $jq(this).offset().left;
                            var dY = $jq(this).offset().top;
                            $jq(this).css('opacity', 0);

                            var width = $jq(this).width();
                            var oX = $jq(window).width() / 2 - width / 2;
                            var marginTop = $jq('#timeline').height() * (parseInt($jq('.timeline-frame').css('margin-top')) / 100);
                            var oY = $jq('.timeline-frame').offset().top + $jq('.timeline-frame').height() * 0.5 - $jq(this).height() / 2;
                            var newElement = $jq(this).clone().css({ opacity: 0, position: 'absolute', zIndex: 6049 }).addClass('timeline-animation');
                            var delay = 100;

                            $jq('body').append(newElement);
                            $jq(newElement).css({ left: oX, top: oY, width: width }).delay(id * delay).animate({
                                left: dX,
                                top: dY,
                                opacity: 1
                            }, 300, function () {
                                $jq(newElement).remove();
                                $jq(self).css('opacity', 1);
                            });
                        });
                    }, 500);
                }
            }],
            9: [{
                endDown: function endDown() {
                    var color = timeline.color;
                    var liquid = $jq('<div style="opacity:0;"" class="liquid-animation timeline-animation"><img class="liquid" src="/images/torrent/mini-animations/$jq{color}-juice.png"></div>');
                    $jq('body').append(liquid);

                    timeline.on('changeSource', function () {
                        $jq('.liquid-animation').fadeOut('fast');
                    }, 'liquid');

                    setPos();
                    $jq(window).on('resize', setPos);
                    function setPos() {
                        var liquid = $jq('.liquid-animation');
                        if (!liquid.length) {
                            $jq(window).off('resize', setPos);
                            timeline.off('changeSource', 'liquid');
                            return;
                        }

                        var pW = $jq('#timeline').width();
                        var pH = $jq('#timeline').height();
                        var xOffset = (pW - $jq(window).width()) / 2;
                        var yOffset = (pH - $jq(window).height()) / 2;
                        var oW = pW * 0.1197421875;
                        var oX = pW * 0.4035078125 - xOffset;
                        var oY = pH * 0.56725 - yOffset + 42;

                        $jq(liquid).css({ left: oX, top: oY, width: oW }).animate({ opacity: 1 }, 400);
                    }
                }
            }],
            10: [{
                endUp: function endUp() {
                    var color = timeline.color;
                    var liquid = $jq('<div style="opacity:0;"" class="liquid-animation timeline-animation"><img class="liquid" src="/images/torrent/mini-animations/$jq{color}-juice.png"/></div>');
                    $jq('body').append(liquid);

                    setPos();
                    $jq(window).on('resize', setPos);
                    function setPos() {
                        var liquid = $jq('.liquid-animation');
                        if (!liquid.length) {
                            $jq(window).off('resize', setPos);
                            return;
                        }

                        var pW = $jq('#timeline').width();
                        var pH = $jq('#timeline').height();
                        var xOffset = (pW - $jq(window).width()) / 2;
                        var yOffset = (pH - $jq(window).height()) / 2;
                        var oW = pW * 0.1197421875;
                        var oX = pW * 0.4035078125 - xOffset;
                        var oY = pH * 0.56725 - yOffset + 42;

                        $jq(liquid).css({ left: oX, top: oY, width: oW }).animate({ opacity: 1 }, 400);
                    }
                }
            }]
        },
        border: true,
        mode: 'sequence'
    });
} else {
    //inject meta tags
    $jq('head').append('<meta content=\'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0\' name=\'viewport\' />').append('<meta content=\'True\' name=\'HandheldFriendly\' />');
}
var scroller = new CoverScroller({ duration: 1.5 }, timeline); //handles scrolling of page
var circleLoader = new circleLoader();

$jq(document).ready(function () {
    //set header position
    if (isPhone) {
        $jq('.cover-wrapper').css('top', '50px');
    }
    if (isMobile) {
        $jq('#loader').fadeOut();
    }
    //set loader position
    $jq('#loader').css({ width: $jq(window).width(), height: $jq(window).height() - 116, top: 116 });

    if (!isMobile) {
        //hide recipe button if necessary
        if ($jq('#show-recipe .' + scroller.color).length == 0) {
            $jq('.open-recipe').fadeOut();
        } else {
            $jq('.open-recipe').fadeIn();
        }

        //load all the things
        var colors = ['black', 'graphite', 'grey'];

        var _loop = function () {
            var j = i;
            timeline.on('loadedPercent' + i, function () {
                circleLoader.draw(j);
            });
        };

        for (var i = 0; i <= 100; i++) {
            _loop();
        }
        timeline.on('loaded', function () {
            scroller.hideLoader();
            if (timeline.cached.indexOf(colors[0]) > -1) colors.shift();
            if (colors.length == 0) {
                circleLoader.remove();
                for (var i = 0; i <= 100; i++) {
                    timeline.off('loadedPercent' + i);
                }
                timeline.off('loaded');
            }
            if (colors.length == 0) return;
            var cacheNum = timeline.cached.length - 1;
            circleLoader.init($jq('.color-picker .' + colors[0]));
            timeline.cacheColor = colors[0];
            var url = '/images/torrent/sequence/' + colors[0] + '/' + colors[0].toUpperCase() + '_TORRENT_EDIT_00000.jpg';
            timeline._cache(false, url);

            //reposition color-picker elements
            $jq.each($jq('.color-picker li'), function (i, v) {
                if (i == 0) return;
                var t = $jq(this).find('div').eq(0).position().top;
                $jq(this).find('div').eq(1).css('top', t);
                //$jq('.color-picker li div').eq(1).css('top',t);
            });
        });

        //on arrow up or arrow down, navigate
        $jq(window).keydown(function (e) {
            if (e.which == 38) {
                //up arrow
                scroller.scroll(0);
            } else if (e.which == 40) {
                //down arrow
                scroller.scroll(1);
            }
        });

        //don't show scrollbar on desktop
        $jq('.cover-wrapper').css('overflow', 'hidden');

        //on nav arrow click, navigate to the next/prev cover
        $jq('.nav-up').click(function () {
            scroller.scroll(0);
        });
        $jq('.nav-down').click(function () {
            scroller.scroll(1);
        });

        //on cover-picker hover, show title overlay
        $jq('.cover-picker li').hover(function () {
            $jq(this).find('.title').stop(true).fadeIn('fast');
        }, function () {
            $jq(this).find('.title').stop(true).delay(200).fadeOut('fast');
        });

        //scroll the page on mousewheel scroll
        $jq('.cover-wrapper').mousewheel(function (event) {
            if (event.deltaY > 0) {
                scroller.scroll(1);
                if (scroller.curCover == 11) {
                    if (timeline.currentKeyframe == timeline.keyframes.length - 1) timeline.playTo(11);else timeline.next();
                }
            } else if (event.deltaY < 0) {
                scroller.scroll(0);
                if (scroller.curCover == 11) {
                    if (timeline.currentKeyframe > 12) {
                        timeline.prev();
                    } else {
                        scroller.scroll(0);
                    }
                }
            }
        });

        timeline.on('changeSource', function () {
            //change the blender on the first panel when the color changes
            var path = '/' + $jq('.blender-1').attr('id').replace(/-/g, '/') + '/';
            $jq('.blender-1').attr('src', path + this.color + '.png');

            //toggle recipe button if the current color doesn't have one
            if ($jq('#show-recipe .' + timeline.color).length == 0) {
                $jq('.open-recipe').fadeOut();
            } else {
                $jq('.open-recipe').fadeIn();
            }

            //remove animations
            timeline.clearAnimation();
        });

        timeline.redraw();

        scroller.on('scroll', function () {
            //make sure blender is visible when a background is being displayed
            if (!isMobile) {
                if (this.curCover == 0) {
                    timeline.hideBorder();
                }

                if (this.curCover != 0) {
                    $jq('#timeline').show();
                }

                //force correct positioning, temp
                if (this.curCover == 2) $jq('#timeline *').stop(true).animate({ marginTop: '7%' });else if (this.curCover == 3) $jq('#timeline *').stop(true).animate({ marginTop: '7%' });else if (this.curCover == 4) $jq('#timeline *').stop(true).animate({ marginTop: '4%' });else if (this.curCover == 11) $jq('#timeline *').stop(true).animate({ marginTop: '-7%' });else $jq('#timeline *').stop(true).animate({ marginTop: '0' });

                //play the video
                if (self.currentFrame != 0 && !(this.curCover == 11 && timeline.currentKeyframe > 11)) {
                    timeline.playTo(this.curCover);
                }
            }

            //hide down arrow if necessary
            if (this.curCover == 11) {
                $jq('.nav-down').fadeOut('fast');
            } else {
                $jq('.nav-down').fadeIn('fast');
            }

            //push to ga
            var label = $jq('.cover-picker li').eq(this.curCover).find('.title').text();
            if (label == '') label = 'Homepage';
            ga('send', 'event', 'Torrent-Scroll Depth', 'Scrolled To', label);
        });

        scroller.on('scrollEnd', function () {
            if (this.curCover != 0) {
                timeline.showBorder();
            }
        });

        //play timeline on scroller at the bottom
        $jq('#spin-right').click(function () {
            timeline.next();
            if (timeline.currentKeyframe == timeline.keyframes.length - 1) timeline.playTo(11);
        });

        //play timeline on scroller at the bottom
        $jq('#spin-left').click(function () {
            if (timeline.currentKeyframe > 12) {
                timeline.prev();
            } else {
                scroller.scroll(0);
            }
        });
    }

    //init mobile gallery
    $jq('#slick-colors .slick').slick({
        prevArrow: '<img class=\'slick-prev\' src=\'/images/torrent/arrow.png\'></img>',
        nextArrow: '<img class=\'slick-next\' src=\'/images/torrent/arrow.png\'></img>',
        lazyLoad: 'progressive'
    });

    //init photo slick gallery
    $jq('#view-photo .slick').slick({
        prevArrow: '<img class=\'slick-prev\' src=\'/images/torrent/arrow.png\'></img>',
        nextArrow: '<img class=\'slick-next\' src=\'/images/torrent/arrow.png\'></img>',
        lazyLoad: 'progressive'
    }).on('init', function (s) {
        placeCloseButton(s, '#view-photo');
    }).on('setPosition', function (s) {
        placeCloseButton(s, '#view-photo');
    }).on('beforeChange', function (s, c, n) {
        $jq('#view-photo .close-x').fadeOut('fast');
    }).on('afterChange', function (s, c) {
        placeCloseButton(s, '#view-photo');
    });

    //init video slick gallery
    $jq('#play-video .slick').slick({
        prevArrow: '<img class=\'slick-prev\' src=\'/images/torrent/arrow.png\'></img>',
        nextArrow: '<img class=\'slick-next\' src=\'/images/torrent/arrow.png\'></img>',
        lazyLoad: 'progressive'
    }).on('init', function (s) {
        placeCloseButton(s, '#play-video');
        $jq('#play-video .slick-cloned').remove();
    }).on('setPosition', function (s) {
        placeCloseButton(s, '#play-video');
    }).on('beforeChange', function (s, c, n) {
        $jq('#view-photo .close-x').fadeOut('fast');

        //create the illusion of multiple galleries so we don't have to init 5 separate ones
        if (n == 3) {
            $jq('#play-video .slick-prev').show();$jq('#play-video .slick-next').hide();
        } else if (n == 2) {
            $jq('#play-video .slick-next').show();$jq('#play-video .slick-prev').hide();
        }
    }).on('afterChange', function (s, c) {
        placeCloseButton(s, '#play-video');
    });

    //init recipe slick gallery
    $jq('#show-recipe .slick').slick({
        prevArrow: '<img class=\'slick-prev\' src=\'/images/torrent/arrow.png\'></img>',
        nextArrow: '<img class=\'slick-next\' src=\'/images/torrent/arrow.png\'></img>'
    });

    function placeCloseButton(slick, element) {
        if (isPhone) {
            return;
        }var slick1 = slick.target.slick;
        var id = slick1.currentSlide;
        var width = $jq(element + ' .slick-track div').eq(id + 1).find('img').width();
        var pwidth = $jq(element + ' .slick').width();
        var offsetLeft = slick.currentTarget.offsetLeft;
        var newLeft = offsetLeft + (pwidth - width) / 2 + width;
        $jq(element + ' .close-x').css({ left: newLeft, top: parseInt(slick.currentTarget.offsetTop) - 28 }).fadeIn('fast');
    }

    //on gallery background/close click, close the gallery
    $jq('.close-overlay,.close-x').click(function () {
        $jq('#view-photo,#play-video,#show-recipe').fadeOut();

        //pause youtube videos
        for (var i in youtubePlayers) {
            youtubePlayers[i].stopVideo();
        }
        $jq('.youtube-embed img').fadeIn();
    });

    //on view photos button click, show photo gallery
    $jq('.view-photos').click(function () {
        $jq('#view-photo').css('display', 'none').css('left', '0').fadeIn();
    });

    //on view videos button click, show video gallery
    $jq('.play-video').click(function () {
        var id = parseInt($jq(this).attr('id'));

        //create the illusion of multiple galleries so we don't have to init 5 separate ones
        if (id != 2 && id != 3) {
            $jq('#play-video .slick-next,#play-video .slick-prev').hide();
        } else if (id == 2) {
            $jq('#play-video .slick-next').show();$jq('#play-video .slick-prev').hide();
        } else if (id == 2) {
            $jq('#play-video .slick-prev').show();$jq('#play-video .slick-next').hide();
        }

        $jq('#play-video .slick').slick('slickGoTo', parseInt(id), false);
        $jq('#play-video').css('display', 'none').css('left', '0').fadeIn();
    });

    //on next/prev video click, pause the current video
    $jq('#play-video .slick-prev, #play-video .slick-next').click(function () {
        for (var i in youtubePlayers) {
            youtubePlayers[i].stopVideo();
        }
    });

    //on next/prev overlay click, push to gtm
    $jq('.slick-prev').click(function () {
        pushCarouselNavToGTM(this, -1);
    });
    $jq('.slick-next').click(function () {
        pushCarouselNavToGTM(this, 1);
    });

    function pushCarouselNavToGTM(self, direction) {
        var catPrefix = $jq(self).parent().parent().attr('id'),
            catSuffix = undefined,
            id = undefined;

        switch (catPrefix) {
            case 'view-photo':
                catPrefix = 'View';
                catSuffix = 'Image';
                id = $jq('#view-photo .slick').slick('slickCurrentSlide') + direction;
                id = $jq('#view-photo .slick-slide').eq(id).find('img').attr('id');
                break;
            case 'play-video':
                catPrefix = 'Play';
                catSuffix = 'Video';
                id = $jq('#play-video .slick').slick('slickCurrentSlide') + direction;
                id = $jq('#play-video .slick-slide').eq(id).find('h3').text();
                break;
            case 'show-recipe':
                catPrefix = 'Show';
                catSuffix = 'Recipe';
                id = $jq('#show-recipe .slick').slick('slickCurrentSlide') + direction;
                id = $jq('#show-recipe .slick-slide').eq(id).find('.recipe-content > h3').text();
                break;
        }

        ga('send', 'event', 'Torrent-Feature Overlays', 'Clicked ' + catPrefix + ' ' + catSuffix, catSuffix + ' ' + id);
    }

    //on view recipes button click, show recipe
    $jq('.open-recipe').click(function () {
        var currentColor = isMobile ? 'red' : scroller.color;
        $jq('.recipe-wrapper.' + currentColor).removeAttr('style');
        $jq('#show-recipe').css('display', 'none').css('left', '0').fadeIn();
    });

    //on color click, change the timeline's sequence
    $jq('.color-picker li').click(function (e) {
        //push to ga
        var label = $jq(this).find('.text').text();
        ga('send', 'event', 'Torrent-Pick Your Color', 'Clicked', label);

        var source = $jq(e.currentTarget).attr('data-source');
        var color = $jq(e.currentTarget).attr('data-color');
        if (timeline.animating && !timeline.looping || $jq(e.currentTarget).hasClass('unloaded')) return;
        scroller.color = color;
        timeline.color = color;
        timeline.changeSource(source);
    });

    //on youtube poster click, embed the video and play it
    $jq('.youtube-embed').click(function () {
        var _this = this;

        //push to ga
        var label = $jq(this).find('h3').text();
        ga('send', 'event', 'Torrent-Feature Overlays', 'Clicked Play Video', label);

        if (YT) {
            var _ret2 = (function () {
                var id = $jq(_this).attr('data-id');
                var v = _this;

                if ($jq(v).find('iframe').length) return {
                        v: undefined
                    };

                if (youtubePlayers[id]) {
                    $jq(v).find('img').fadeOut('fast', function () {
                        youtubePlayers[id].playVideo();
                    });
                } else {
                    var width = $jq(_this).find('div').width();
                    var height = $jq(_this).find('div').height();
                    $jq(_this).find('div').append('<iframe id="$jq{id}" style="position: absolute;" src="https://www.youtube.com/embed/$jq{id}?autoplay=1&enablejsapi=1" height="$jq{height}" width="$jq{width} type="text/html" frameborder="0"/>');

                    setTimeout(function () {
                        $jq(v).find('img').fadeOut();
                        youtubePlayers[id] = new YT.Player(id);
                    }, 1000);
                }
            })();

            if (typeof _ret2 === 'object') return _ret2.v;
        } else {
            console.log('youtube failed to load');
        }
    });

    redraw();
    //on window resize, resize components
    $jq(window).resize(redraw);
    function redraw() {
        if (!isMobile) {
            if ($jq(window).width() <= 768) {
                timeline.disable();
            } else {
                timeline.enable();
            }

            //don't show scrollbar on desktop
            $jq('.cover-wrapper').css('overflow', 'hidden');

            timeline.redraw();
            scroller.redraw();
            circleLoader.redraw();
        }
    }
});