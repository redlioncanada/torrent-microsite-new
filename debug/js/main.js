/*videojs("video", {}, function() {
  var timeline = new Timeline({
    videojs: this,
    fps: 24,
    keyframes: [0, 2.7, 4.5, 5.5, 7.6, 8.5],
    mode: 'video'
  });
});*/

'use strict';

var timeline = new Timeline({ //handles animation of video/sequence
    fps: 24,
    keyframes: ['00000', '00060', '00096', '00097', '00120', '00168', '00201', '00250', '00278', '00305', '00327', '00348', '00374', '00395', '00420', '00449'],
    border: true,
    mode: 'sequence'
});
var scroller = new CoverScroller({ duration: 1 }, timeline); //handles scrolling of page
var slick; //gallery on 12th slide
var youtubePlayers = {};

$(document).ready(function () {
    timeline.redraw();

    //force correct positiong, temp
    $('#timeline img').animate({ marginTop: '-3%' });

    //scroll the page on mousewheel scroll
    $('.cover-wrapper').mousewheel(function (event) {
        if (event.deltaY > 0) {
            scroller.scroll(1);
        } else if (event.deltaY < 0) {
            scroller.scroll(0);
        }
    });

    scroller.on('scroll', function () {
        //make sure blender is visible when a background is being displayed
        if (this.direction == 0) {
            console.log(this.curCover);
            if (this.curCover == 0) $('#timeline').css('zIndex', '1001');else $('#timeline').css('zIndex', '999');
        }

        if (this.curCover == 0) {
            timeline.hideBorder();
        }

        //force correct positioning, temp
        if (this.curCover == 0) $('#timeline img').animate({ marginTop: '-3%' });else if (this.curCover == 3) $('#timeline img').animate({ marginTop: '7%' });else if (this.curCover == 4) $('#timeline img').animate({ marginTop: '2%' });else if (this.curCover == 6) $('#timeline img').animate({ marginTop: '-3%' });else if (this.curCover == 7) $('#timeline img').animate({ marginTop: '-5%' });else if (this.curCover == 11) $('#timeline img').animate({ marginTop: '-5%' });else $('#timeline img').animate({ marginTop: '0' });

        //play the video
        timeline.playTo(this.curCover);
    });

    scroller.on('scrollEnd', function () {
        //make sure blender is visible when a background is being displayed
        if (this.direction == 1) {
            if (this.curCover == 0) $('#timeline').css('zIndex', '1001');else $('#timeline').css('zIndex', '999');
        } else {
            if (this.curCover == 0) $('#timeline').css('zIndex', '1001');else $('#timeline').css('zIndex', '999');
        }

        if (this.curCover != 0) {
            timeline.showBorder();
        }
    });

    $('#spin-right').click(function () {
        timeline.playTo(timeline.currentKeyframe + 1);
    });

    $('#spin-left').click(function () {
        if (timeline.currentKeyframe > 12) {
            timeline.playTo(timeline.currentKeyframe - 1);
        } else {
            scroller.scroll(0);
        }
    });

    //init photo slick gallery
    $('#view-photo .slick').slick({
        prevArrow: '<img class=\'slick-prev\' src=\'../assets/images/arrow.png\'></img>',
        nextArrow: '<img class=\'slick-next\' src=\'../assets/images/arrow.png\'></img>',
        lazyLoad: 'progressive'
    });

    //init video slick gallery
    $('#play-video .slick').slick({
        prevArrow: '<img class=\'slick-prev\' src=\'../assets/images/arrow.png\'></img>',
        nextArrow: '<img class=\'slick-next\' src=\'../assets/images/arrow.png\'></img>',
        centerMode: true,
        lazyLoad: 'progressive'
    }).on('beforeChange', function (e, slick, currentSlide, nextSlide) {
        //pause youtube videos when nav'ing off of them
        for (var i in youtubePlayers) {
            youtubePlayers[i].stopVideo();
        }
        $('.youtube-embed img').fadeIn();
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
    $('#recipe').click(function () {
        $('#show-recipe').css('display', 'none').css('left', 'initial').fadeIn();
    });

    //on color click, change the timeline's sequence
    $('.color-picker li').click(function (e) {
        var source = $(e.currentTarget).attr('data-source');
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
});