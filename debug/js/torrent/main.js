'use strict';

var isMobile = Modernizr.mobile;
var isPhone = Modernizr.phone;
var isTablet = Modernizr.tablet;
var youtubePlayers = {};
var timeline = undefined;

if (!isMobile) {
    timeline = new Timeline({ //handles animation of video/sequence
        fps: 24,
        keyframes: ['00000', '00030', '00055', '00071', '00084', '00103', '00138', '00153', '00168', '00224', '00238', '00267', '00281', '00295', '00309'],
        animation: {
            1: [{
                startDown: function startDown() {
                    var dW = $('.blender-1').width();
                    var dX = parseInt($('.cover-item-1 .desktop .col-xs-3').eq(0).width()) - dW - parseInt($('.blender-1').css('margin-right'));
                    var dY = parseInt($('.blender-1').offset().top) - parseInt($('.blender-1').css('margin-top')) + parseInt($('.blender-1').css('margin-bottom'));
                    var pW = $('#timeline').width();
                    var pH = $('#timeline').height();
                    var xOffset = (pW - $(window).width()) / 2;
                    var yOffset = (pH - $(window).height()) / 2;
                    var oW = pW * 0.1944921875;
                    var oX = pW * 0.334890625 - xOffset;
                    var oY = pH * 0.21188888888889 - yOffset + 60;

                    var blender = $('.blender-1').clone().css({ left: dX, top: dY, width: dW, position: 'absolute', zIndex: 6049 }).removeClass('blender-1').addClass('blender-2 timeline-animation').appendTo('body');
                    $('.blender-1').hide();
                    $('#timeline').hide();
                    $('.blender-2').animate({ left: oX, top: oY, width: oW }, 600);
                },
                endDown: function endDown() {
                    $('#timeline').show();
                    $('.blender-2').remove();
                    $('.blender-1').show();
                },
                startUp: function startUp() {
                    var dW = $('.blender-1').width();
                    var pW = $('#timeline').width();
                    var pH = $('#timeline').height();
                    var xOffset = (pW - $(window).width()) / 2;
                    var yOffset = (pH - $(window).height()) / 2;
                    var oW = pW * 0.1944921875;
                    var oX = pW * 0.334890625 - xOffset;
                    var oY = pH * 0.21188888888889 - yOffset + 60;
                    var dX = parseInt($('.cover-item-1 .desktop .col-xs-3').eq(0).width()) - dW - parseInt($('.blender-1').css('margin-right'));
                    var dY = parseInt($('.blender-1').offset().top) - parseInt($('.blender-1').css('margin-top')) + parseInt($('.blender-1').css('margin-bottom')) + $('.cover').height();

                    var blender = $('.blender-1').clone().css({ left: oX, top: oY, width: oW, position: 'absolute', zIndex: 6049 }).removeClass('blender-1').addClass('blender-2 timeline-animation').appendTo('body');
                    $('.blender-1').hide();
                    $('#timeline').hide();
                    $('.blender-2').animate({ left: dX, top: dY, width: dW }, 600);
                },
                endUp: function endUp() {
                    $('#timeline').hide();
                    $('.blender-2').remove();
                    $('.blender-1').show();
                }
            }],
            3: [{
                startDown: function startDown() {
                    $('.cover-item-4 .desktop ul li img').each(function (id) {
                        $(this).css('opacity', 0);
                    });
                },
                endDown: function endDown() {
                    $('.cover-item-4 .desktop ul li img').each(function (id) {
                        var self = this;
                        $(this).css('opacity', 1);
                        var dX = $(this).offset().left;
                        var dY = $(this).offset().top;
                        $(this).css('opacity', 0);

                        var width = $(this).width();
                        var oX = $(window).width() / 2 - width / 2;
                        var marginTop = $('#timeline').height() * (parseInt($('.timeline-frame').css('margin-top')) / 100);
                        var oY = $('.timeline-frame').offset().top + $('.timeline-frame').height() * 0.5 - $(this).height() / 2;
                        var newElement = $(this).clone().css({ opacity: 0, position: 'absolute', zIndex: 6049 }).addClass('timeline-animation');
                        var delay = 100;

                        $('body').append(newElement);
                        $(newElement).css({ left: oX, top: oY, width: width }).delay(id * delay).animate({
                            left: dX,
                            top: dY,
                            opacity: 1
                        }, 200, function () {
                            $(newElement).remove();
                            $(self).css('opacity', 1);
                        });
                    });
                }
            }],
            6: [{
                startUp: function startUp() {},
                endDown: function endDown() {}
            }],
            7: [{
                startDown: function startDown() {},
                endDown: function endDown() {
                    var arrow = $('<div style="opacity:0;" class="arrow-animation timeline-animation"></div>');
                    $('body').append(arrow);
                    $(arrow).animate({ opacity: 1 }, 400);

                    var resetPos = 4000;
                    var posIncrement = 90;
                    var posMod = posIncrement;
                    var startDelay = 400;
                    var arrowsPerColumn = 3;

                    var up = '<img class="arrow1 up" src="./images/torrent/arrows1.png"./>';
                    var down = '<img class="arrow2 down" src="./images/torrent/arrows1.png"./>';
                    var up2 = '<img class="arrow3 up" src="./images/torrent/arrows1.png"./>';

                    var iteration = 0;
                    var iterations = 2;

                    function loop(el) {
                        var mod = arguments[1] === undefined ? 1 : arguments[1];

                        $(el).fadeIn('fast');
                        $(el).css({ top: 50 * mod * -1 });
                        var sign = mod == 1 ? '+' : '-';
                        $(el).animate({
                            top: sign + '=' + posIncrement }, 700, 'linear', function () {
                            if ($('.arrow-animation').length) {
                                $(el).fadeOut('fast', function () {

                                    //reset this if we've gone far enough
                                    var top = $(el).css('top');
                                    if (top < resetPos && mod || top > resetPos && !mod) {
                                        $(el).fadeOut(1, function () {
                                            $(el).css('top', 0);
                                            loop(el, mod);
                                        });
                                    } else {
                                        loop(el, mod);
                                    }
                                });
                            }
                        });
                    }

                    function queSet(i) {
                        start(down, i);
                        start(up, i, 0);
                        start(up2, i, 0);
                    }

                    function start(el, i) {
                        var mod = arguments[2] === undefined ? 1 : arguments[2];

                        $('.arrow-animation').append(el);
                        el = $('.arrow-animation img').last();
                        $(el).addClass('arrow-column-' + i);
                        loop(el, mod);
                    }

                    for (var i = 0; i <= arrowsPerColumn - 1; i++) {
                        setTimeout(function () {
                            queSet(i);
                        }, i * startDelay);
                    }
                },
                startUp: function startUp() {
                    $('.arrow-animation').fadeOut('fast', function () {
                        $('.arrow-animation').remove();
                    });
                },
                endUp: function endUp() {}
            }],
            8: [{
                startDown: function startDown() {
                    $('.arrow-animation').fadeOut('fast', function () {
                        $('.arrow-animation').remove();
                    });
                },
                endUp: function endUp() {
                    var arrow = $('<div style="opacity:0;" class="arrow-animation timeline-animation"></div>');
                    $('body').append(arrow);
                    $(arrow).animate({ opacity: 1 }, 400);

                    var resetPos = 4000;
                    var posIncrement = 90;
                    var posMod = posIncrement;
                    var startDelay = 400;
                    var arrowsPerColumn = 3;

                    var up = '<img class="arrow1 up" src="./images/torrent/arrows1.png"./>';
                    var down = '<img class="arrow2 down" src="./images/torrent/arrows1.png"./>';
                    var up2 = '<img class="arrow3 up" src="./images/torrent/arrows1.png"./>';

                    var iteration = 0;
                    var iterations = 2;

                    function loop(el) {
                        var mod = arguments[1] === undefined ? 1 : arguments[1];

                        $(el).fadeIn('fast');
                        $(el).css({ top: 50 * mod * -1 });
                        var sign = mod == 1 ? '+' : '-';
                        $(el).animate({
                            top: sign + '=' + posIncrement }, 700, 'linear', function () {
                            if ($('.arrow-animation').length) {
                                $(el).fadeOut('fast', function () {

                                    //reset this if we've gone far enough
                                    var top = $(el).css('top');
                                    if (top < resetPos && mod || top > resetPos && !mod) {
                                        $(el).fadeOut(1, function () {
                                            $(el).css('top', 0);
                                            loop(el, mod);
                                        });
                                    } else {
                                        loop(el, mod);
                                    }
                                });
                            }
                        });
                    }

                    function queSet(i) {
                        start(down, i);
                        start(up, i, 0);
                        start(up2, i, 0);
                    }

                    function start(el, i) {
                        var mod = arguments[2] === undefined ? 1 : arguments[2];

                        $('.arrow-animation').append(el);
                        el = $('.arrow-animation img').last();
                        $(el).addClass('arrow-column-' + i);
                        loop(el, mod);
                    }

                    for (var i = 0; i <= arrowsPerColumn - 1; i++) {
                        setTimeout(function () {
                            queSet(i);
                        }, i * startDelay);
                    }
                }
            }],
            9: [{
                startUp: function startUp() {
                    $('.liquid-animation').fadeOut('fast', function () {
                        $('.liquid-animation').remove();
                    });
                },
                endDown: function endDown() {
                    var color = timeline.color;
                    var liquid = $('<div style="opacity:0;"" class="liquid-animation timeline-animation"><img class="liquid" src="./images/torrent/mini-animations/' + color + '-juice.png"./></div>');
                    $('body').append(liquid);

                    timeline.on('changeSource', function () {
                        $('.liquid-animation').fadeOut('fast');
                    }, 'liquid');

                    setPos();
                    $(window).on('resize', setPos);
                    function setPos() {
                        var liquid = $('.liquid-animation');
                        if (!liquid.length) {
                            $(window).off('resize', setPos);
                            timeline.off('changeSource', 'liquid');
                            return;
                        }

                        var pW = $('#timeline').width();
                        var pH = $('#timeline').height();
                        var xOffset = (pW - $(window).width()) / 2;
                        var yOffset = (pH - $(window).height()) / 2;
                        var oW = pW * 0.1197421875;
                        var oX = pW * 0.4035078125 - xOffset;
                        var oY = pH * 0.56725 - yOffset + 54;

                        $(liquid).css({ left: oX, top: oY, width: oW }).animate({ opacity: 1 }, 400);
                    }
                }
            }],
            10: [{
                endUp: function endUp() {
                    var color = timeline.color;
                    var liquid = $('<div style="opacity:0;"" class="liquid-animation timeline-animation"><img class="liquid" src="./images/torrent/mini-animations/' + color + '-juice.png"./></div>');
                    $('body').append(liquid);

                    setPos();
                    $(window).on('resize', setPos);
                    function setPos() {
                        var liquid = $('.liquid-animation');
                        if (!liquid.length) {
                            $(window).off('resize', setPos);
                            return;
                        }

                        var pW = $('#timeline').width();
                        var pH = $('#timeline').height();
                        var xOffset = (pW - $(window).width()) / 2;
                        var yOffset = (pH - $(window).height()) / 2;
                        var oW = pW * 0.1197421875;
                        var oX = pW * 0.4035078125 - xOffset;
                        var oY = pH * 0.56725 - yOffset + 54;

                        $(liquid).css({ left: oX, top: oY, width: oW }).animate({ opacity: 1 }, 400);
                    }
                },
                startDown: function startDown() {
                    $('.liquid-animation').fadeOut('fast', function () {
                        $('.liquid-animation').remove();
                    });
                }
            }]
        },
        border: true,
        mode: 'sequence'
    });
    var scroller = new CoverScroller({ duration: 1 }, timeline); //handles scrolling of page
}
var circleLoader = new circleLoader();

$(document).ready(function () {
    //set header position
    if (isPhone) {
        $('.cover-wrapper').css('top', '50px');
    }
    if (isMobile) {
        $('#loader').fadeOut();
    }
    //set loader position
    $('#loader').css({ width: $(window).width(), height: $(window).height() - 116, top: 116 });

    if (!isMobile) {
        //hide recipe button if necessary
        if ($('#show-recipe .' + scroller.color).length == 0) {
            $('.open-recipe').fadeOut();
        } else {
            $('.open-recipe').fadeIn();
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
            circleLoader.init($('.color-picker .' + colors[0]));
            timeline.cacheColor = colors[0];
            var url = '/images/torrent/sequence/' + colors[0] + '/' + colors[0].toUpperCase() + '_TORRENT_EDIT_00000.jpg';
            timeline._cache(false, url);

            //reposition color-picker elements
            $.each($('.color-picker li'), function (i, v) {
                if (i == 0) return;
                var t = $(this).find('div').eq(0).position().top;
                $(this).find('div').eq(1).css('top', t);
                //$('.color-picker li div').eq(1).css('top',t);
            });
        });

        //don't show scrollbar on desktop
        $('.cover-wrapper').css('overflow', 'hidden');

        //scroll the page on mousewheel scroll
        $('.cover-wrapper').mousewheel(function (event) {
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
            var path = '/' + $('.blender-1').attr('id').replace(/-/g, '/') + '/';
            $('.blender-1').attr('src', path + this.color + '.png');

            //toggle recipe button if the current color doesn't have one
            if ($('#show-recipe .' + timeline.color).length == 0) {
                $('.open-recipe').fadeOut();
            } else {
                $('.open-recipe').fadeIn();
            }
        });

        timeline.redraw();
        $('#timeline img').animate({ marginTop: '-3%' });

        scroller.on('scroll', function () {
            //make sure blender is visible when a background is being displayed
            if (!isMobile) {
                if (this.curCover == 0) {
                    timeline.hideBorder();
                }

                //force correct positioning, temp
                if (this.curCover == 0) $('#timeline *').animate({ marginTop: '-3%' });else if (this.curCover == 3) $('#timeline *').animate({ marginTop: '7%' });else if (this.curCover == 4) $('#timeline *').animate({ marginTop: '4%' });else if (this.curCover == 11) $('#timeline *').animate({ marginTop: '-7%' });else $('#timeline *').animate({ marginTop: '0' });

                //play the video
                if (self.currentFrame != 0 && !(this.curCover == 11 && timeline.currentKeyframe > 11)) {
                    timeline.playTo(this.curCover);
                }
            }
        });

        scroller.on('scrollEnd', function () {
            if (this.curCover != 0) {
                timeline.showBorder();
            }
        });

        $('#spin-right').click(function () {
            timeline.next();
            if (timeline.currentKeyframe == timeline.keyframes.length - 1) timeline.playTo(11);
        });

        $('#spin-left').click(function () {
            if (timeline.currentKeyframe > 12) {
                timeline.prev();
            } else {
                scroller.scroll(0);
            }
        });
    }

    //init mobile gallery
    $('#slick-colors .slick').slick({
        prevArrow: '<img class=\'slick-prev\' src=\'./images/torrent/arrow.png\'></img>',
        nextArrow: '<img class=\'slick-next\' src=\'./images/torrent/arrow.png\'></img>',
        lazyLoad: 'progressive'
    });

    //init photo slick gallery
    $('#view-photo .slick').slick({
        prevArrow: '<img class=\'slick-prev\' src=\'./images/torrent/arrow.png\'></img>',
        nextArrow: '<img class=\'slick-next\' src=\'./images/torrent/arrow.png\'></img>',
        lazyLoad: 'progressive',
        adaptiveHeight: true
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
        var newLeft = offsetLeft + (pwidth - width) / 2 + width;
        $(element + ' .close-x').css({ left: newLeft, top: slick.currentTarget.offsetTop }).fadeIn('fast');
    }

    //init video slick gallery
    $('#play-video .slick').slick({
        prevArrow: '<img class=\'slick-prev\' src=\'./images/torrent/arrow.png\'></img>',
        nextArrow: '<img class=\'slick-next\' src=\'./images/torrent/arrow.png\'></img>',
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

    //on next/prev video click, pause the current video
    $('#play-video .slick-prev, #play-video .slick-next').click(function () {
        for (var i in youtubePlayers) {
            youtubePlayers[i].stopVideo();
        }
    });

    //on view recipes button click, show recipe
    $('.open-recipe').click(function () {
        $('.recipe-wrapper').css('display', 'none');
        var currentColor = isMobile ? 'red' : scroller.color;
        $('.recipe-wrapper.' + currentColor).removeAttr('style');
        $('#show-recipe').css('display', 'none').css('left', 'initial').fadeIn();
    });

    //on color click, change the timeline's sequence
    $('.color-picker li').click(function (e) {
        var source = $(e.currentTarget).attr('data-source');
        var color = $(e.currentTarget).attr('data-color');
        if (timeline.animating || $(e.currentTarget).hasClass('unloaded')) return;
        scroller.color = color;
        timeline.color = color;
        timeline.changeSource(source);
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
                    $(_this).append('<iframe id="' + id + '" style="position: absolute;" src="https://www.youtube.com/embed/' + id + '?autoplay=1&controls=0&enablejsapi=1" height="' + height + '" width="' + width + ' type="text/html" frameborder="0"./>');

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

    redraw();
    //on window resize, resize components
    $(window).resize(redraw);
    function redraw() {
        if (!isMobile) {
            if ($(window).width() <= 768) {
                timeline.disable();
            } else {
                timeline.enable();
            }

            //don't show scrollbar on desktop
            $('.cover-wrapper').css('overflow', 'hidden');

            timeline.redraw();
            scroller.redraw();
            circleLoader.redraw();
        }
    }
});

/*$('.blades-animation').fadeOut('fast', function() {
    $('.blades-animation').remove();
});*/

/*let blades = $(`<div style="opacity:0;"" class="blades-animation"><img class="blades" src="./images/torrent/mini-animations/blade.png"./><img class="blades-background" src="./images/torrent/mini-animations/blade-background.png"./></div>`);
$('body').append(blades);
 setPos();
$(window).on('resize',setPos);
function setPos() {
    let blades = $('.blades-animation');
    if (!blades.length) {
        $(window).off('resize',setPos);
        return;
    }
    
    let pW = $('#timeline').width();
    let pH = $('#timeline').height();
    let xOffset = (pW - $(window).width()) / 2;
    let yOffset = (pH - $(window).height()) / 2;
    let oW = pW * 0.1255546875;
    let oX = (pW * 0.4721640625) - xOffset;
    let oY = (pH * 0.66754166666667) - yOffset + 60;
     $(blades).css({'left':oX,'top':oY,'width':oW}).animate({'opacity':1},400);
}*/

/*$('.blades-animation').fadeOut('fast', function() {
    $('.blades-animation').remove();
});*/

/*let blades = $(`<div style="opacity:0;"" class="blades-animation"><img class="blades" src="./images/torrent/mini-animations/blade.png"./><img class="blades-background" src="./images/torrent/mini-animations/blade-background.png"./></div>`);
$('body').append(blades);
 setPos();
$(window).on('resize',setPos);
function setPos() {
    let blades = $('.blades-animation');
    if (!blades.length) {
        $(window).off('resize',setPos);
        return;
    }
    
    let pW = $('#timeline').width();
    let pH = $('#timeline').height();
    let xOffset = (pW - $(window).width()) / 2;
    let yOffset = (pH - $(window).height()) / 2;
    let oW = pW * 0.1255546875;
    let oX = (pW * 0.4721640625) - xOffset;
    let oY = (pH * 0.66754166666667) - yOffset + 60;
     $(blades).css({'left':oX,'top':oY,'width':oW}).animate({'opacity':1},400);
}*/