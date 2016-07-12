
(function (win, $, undefined) {
  'use strict';

  var
  getWindowHeight = function () {
    var height = $(window).height();
    return height;
  },

  animate = function animate (target, slot, cb) {

    if (!animate.startT) {
      animate.startT = new Date().getTime();
      animate.startP = getScrollTop();
      animate.distance = target - animate.startP;
    }

    var
    now = new Date().getTime(),
    t = now - animate.startT,
    nowPosition = animate.startP + t * animate.distance / slot;

    if (t >= slot) {
      animate.startT = 0;
      $(document).scrollTop(target);
      return cb && cb();
    }

    $(document).scrollTop(nowPosition);

    setTimeout(function () {
      animate(target, slot, cb);
    }, 17);
  },

  getOffsetTop = function (dom) {
    return $(dom).offset().top;
  },

  getScrollTop = function () {
    return $(document).scrollTop();
  },

  wHeight = getWindowHeight(),

  DELAY_INIT = 500,
  DELAY_FORBIDEN = 600;

  var fullPage = function (opt) {
    this.init(opt)
  };

  fullPage.prototype.init = function (opt) {

    this.option = {
      activeClass: opt.activeClass || 'active',
      hoverClass: opt.hoverClass || 'mouseover',
      animateSlot: opt.animateSlot || 600,
      itemClass: opt.itemClass,
      ctlClass: opt.ctlClass,
      scrollAfter: opt.scrollAfter
    };

    if (!opt.itemClass || !opt.ctlClass) {
      throw 'itemClass and ctlClass is required';
      return ;
    }

    DELAY_FORBIDEN = this.option.animateSlot + 100;
    var
    items = $('.' + this.option.itemClass),
    controls = $('.' + this.option.ctlClass),

    slice = [].slice;
    this.items = slice.call(items);
    this.controls = slice.call(controls);

    this.bindEvent();

    $.each(this.items, function (i, item) {
      item.style.height = wHeight + 'px';
    });
    this.reset();
  };

  fullPage.prototype.reset = function () {
    var
    dis = 10000,
    i = -1;

    $(this.items).each( function (index, item) {
      var top = item.getBoundingClientRect().top;

      top = Math.abs(top);
      if (top < dis) {
        dis = top;
        i = index;
      }
    });

    this.switch(i);
  };

  fullPage.prototype.switch = function (index) {
    var
    items = this.items,
    that = this,
    target = items[index] && getOffsetTop(items[index]);

    if (this.isScroll) {
      return;
    }

    this.forbidenInit();
    this.currentItem = index;
    if (index < 0) {
      target = 0;
      index = 0;
    }

    if (index == items.length) {
      target = $(document).height() - wHeight;
      index = items.length - 1;
    }

    this.isScroll = true;
    animate(target, this.option.animateSlot, function (){

      setTimeout(function() {
        console.log('over');
        that.isScroll = false;

        that.option.scrollAfter && that.option.scrollAfter(that.controls[index]);
      }, 50);
    });

    $(this.controls).each(function (i, c) {
      $(c).removeClass(that.option.activeClass);
    });

    $(this.controls[index]).addClass(this.option.activeClass);
  };

  fullPage.prototype.forbidenInit = function () {
    this.isDragScroll = false;

    setTimeout(function () {
      this.isDragScroll = true;
    }.bind(this), DELAY_FORBIDEN);
  };

  fullPage.prototype.next = function () {

    if (++ this.currentItem > this.items.length) {
      return this.currentItem--;
    }
    this.switch(this.currentItem);
  };

  fullPage.prototype.pre = function () {

    if (-- this.currentItem < -1) {
      return this.currentItem++;
    }

    this.switch(this.currentItem);
  };

  fullPage.prototype.bindEvent = function () {
    var that = this;

    $(this.controls).each(function (i, c) {

      $(c).on('click', function (ev) {
        that.switch(i);
      }).on('mouseover', function (ev) {
        $(this).addClass(that.option.hoverClass);
      }).on('mouseout', function (ev) {
        $(this).removeClass(that.option.hoverClass);
      });

    });

    $(document).on('mousewheel DOMMouseScroll', function (ev) {
      if (that.isScroll) {
        return ev.preventDefault();
      }

      var delta = (ev.originalEvent.wheelDelta && (ev.originalEvent.wheelDelta > 0 ? 1 : -1)) || (ev.originalEvent.detail && (ev.originalEvent.detail > 0 ? -1 : 1));

      if (delta < 0) {
        that.next();
      }

      if (delta > 0) {
        that.pre();
      }
    }).on('keyup', function (ev) {

      if (that.isScroll) {
        return;
      }

      if (ev.keyCode == 38) {
        ev.preventDefault();
        that.pre();
      }

      if (ev.keyCode == 40) {
        ev.preventDefault();
        that.next();
      }
    }).on('visibilitychange', function (e) {
      if (!this.hidden) {
        that.reset();
      }
    });

    var timer = null;
    $(window).on('scroll', function scrollFn (e) {
      if (!that.isDragScroll) {
        return;
      }

      if (!scrollFn.start) {
        scrollFn.start = getScrollTop();
      }

      if (Math.abs(scrollFn.start - getScrollTop()) > 300) {
        window.clearTimeout(timer);
        timer = setTimeout(function () {

          // console.log('reset');
          scrollFn.start = 0;
          that.reset();
        }, DELAY_INIT);
      }
    });
  };


  window.fullPage = function (obj) {
    new fullPage(obj);
  };

})(window, jQuery);