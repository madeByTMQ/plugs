$(function () {

  /**
   * 估价提示
   * @param {object} option 配置项，target(目标元素)必须
   */
  var Tips = function (option) {

    this.init(option);
  };

  Tips.prototype.init = function (option) {

    this.data = null;
    this.target = option.target;
    this.option = {
      height:　option.height || 400,
      width: option.width || this.target.width(),
      overClass: option.overClass, //鼠标覆盖时的class
      preClass: option.preClass,
      nextClass: option.nextClass
    };

    this.option.url = this.target.attr('data-url');
    this.imgs = this.target.attr('data-imgs');
    this.description = this.target.attr('data-des');

    if (!this.option.url && !this.imgs && !this.description) {
      return;
    }

    this.imgs = JSON.parse(this.target.attr('data-imgs'));

    this.hasRender = false;
    this.isExpand = false;
    this.viewMore = $('<div><a href="javascript:;">查看更多</a></div>');
    this.loading = $('<div class="hsb-tip-outergg">稍等。。</div>');
    this.bindEve();
  };

  Tips.prototype.render = function () {

    var that = this;

    this.startRender = true;
    this.target.append(this.loading);
    this.getData().then(function (data) {

      that.hasRender = true;
      that.loading.remove();

      var
      getImgs = function (imgs) {
        var temp = '<ul>';
        $.each(imgs, function (i, img) {
          temp += '<li><img src="'+img+'" /></li>';
        });

        temp += '</ul>';
        return  temp;
      },

      imgs = getImgs(data.imgs),

      tpl = '<div class="hsb-tip-outergg"><div data-img-contanier><a  data-pre href="javascript:;"><img src="'+  window.prevPic+'"/></a>' + imgs + '<a data-next  href="javascript:;"><img src="'+  window.nextPic
          +'"/></a></div>'+
            '<div data-text-contanier><p>'+ data.description +'</p></div></div>',
      dom = $(tpl);

      that.target.append(dom);
      that.contanier = dom;
      that.textContanier = that.target.find('[data-text-contanier]');
      that.setStlye(dom);

      dom.on('click', function (ev) {
        ev.stopPropagation();
      });

      if (imgs.indexOf('img') > -1) {
        new Banner(dom.find('[data-img-contanier]'), {
          width: that.option.width,
          preClass: that.option.preClass,
          nextClass: that.option.nextClass
        });
      }
      that.textAction();
    });
  };

  Tips.prototype.setStlye = function (dom) {

    dom.css({
      'position': 'absolute',
      'z-index': '999',
      'width': this.option.width,
      'line-height': '1.1',
      'white-space': 'normal',
      'text-align': 'left',
      'word-break': 'break-word',
      'top': '43px'
    });

    this.textContanier.css({
      'background-color' : '#333',
      'background-color' : 'rgba(51,51,51,.75)',
      'padding': '10px',
      'color': '#fff',
      'font-family': '微软雅黑'
    });

    this.viewMore.css({
      'text-align': 'right',
      'position': 'absolute',
      'box-sizing': 'border-box',
      'padding': '10px',
      'width': '100%',
      'top': '100%',
      'background-color' : '#333',
      'background-color' : 'rgba(51,51,51,.75)'
    });

    this.viewMore.find('a').css({
      'color': '#fff',
    });
  };

  Tips.prototype.initText = function () {

    var  that = this;
    this.viewMore.one('click', function (ev) {
      ev.stopPropagation();
      that.isExpand = true;
      that.textContanier.css('height', 'auto');
      this.remove();
    });
  };

  Tips.prototype.textAction = function () {

    if (this.isExpand || !this.hasRender) {
      return;
    }

    if (this.option.height < this.contanier.height()) {
      this.contanier.append(this.viewMore);

      this.textContanier.css({
        'height': '20', //触发查看更多后，文本高度
        'overflow': 'hidden'
      });
    }

    this.initText();
  };

  Tips.prototype.getData = function cache (url) {

    var url = this.option.url;
    var df = $.Deferred();

    if (url) {
      return $.ajax(url)
    } else {
      df.resolve({
        imgs: this.imgs,
        description: this.description
      })

      return df.promise();
    }
  };

  Tips.prototype.bindEve = function () {
    var that = this;

    this.target.on('mouseover', function (ev) {

      if (!that.startRender) {
        that.render();
      }

      $(this).addClass(that.option.overClass);
    }).on('mouseout', function (ev) {

      $(this).removeClass(that.option.overClass);
    }).on('mouseenter', function (ev) {

      that.textAction();
      that.isExpand = false;
    });

  };

  /**
   * [Banner]
   * @param {dom object} outer  轮播ul的父元素
   * @param {object} option 配置项，动画宽度width必须
   */
  var Banner = function (outer, option) {
    this.init(outer, option);
  };

  Banner.prototype.init = function (outer, option) {

    this.outer = outer;
    this.distance = option.width;
    this.ul = this.outer.find('ul');
    this.len = this.outer.find('ul li img').length;
    this.index = 0;
    this.isMoving = false;
    this.preEle = this.outer.find('a[data-pre]');
    this.nextEle = this.outer.find('a[data-next]');
    this.openAutoStart = option.openAutoStart;
    this.nextClass = option.nextClass;
    this.preClass = option.preClass;
    this.setStlye();

    if (this.len <= 1) {
      this.preEle.remove();
      this.nextEle.remove();
      return;
    }
    this.ul.append(this.ul.find('li:first').clone(true));
    this.bindEve();
    this.autoStart();
  };

  Banner.prototype.setStlye = function () {

    this.outer.css({
      'overflow': 'hidden',
      'width': this.distance,
      'position': 'relative',
      'height': '220px',
      'text-align': 'left',
      'background-color': '#f2f2f2'
    });

    this.ul.css({
      'position': 'relative',
      'width': '10000px',
      'margin': 0,
      'padding': 0,
      'font-size': 0,
      'height': '100%'
    });

    this.ul.find('li').css({
      'width': this.distance,
      'display': 'inline-block',
      'vertical-align': 'top',
      'height': '100%'
    });

    this.ul.find('li img').css({
      'width': '100%'
    });

    if (this.preClass) {
      this.preEle.addClass(this.preClass);
    } else {
      this.preEle.css({
        'position': 'absolute',
        'left': '0',
        'top': '50%',
        'margin-top': '-' + this.preEle.height() / 2 + 'px',
        'z-index': '10'
      });
    }

    if (this.nextClass) {
      this.nextEle.addClass(this.nextClass);
    } else {
      this.nextEle.css({
        'position': 'absolute',
        'right': '0',
        'top': '50%',
        'margin-top': '-' + this.preEle.height() / 2 + 'px',
        'z-index': '10'
      });
    }

  };

  Banner.prototype.pre = function () {
    if (this.isMoving) {
      return;
    }
    this.isMoving = true;
    if (--this.index < 0) {
      this.index = this.len - 1;
      this.ul.css('left', -(this.index + 1)  * this.distance);
    }

    this.ul.animate({'left': -this.index  * this.distance}, 500, function () {
      this.isMoving = false;
    }.bind(this));
  };

  Banner.prototype.next = function (cb) {
    if (this.isMoving) {
      return;
    }

    this.isMoving = true;
    if (++this.index == this.len + 1) {
      this.index = 1;
      this.ul.css('left', 0);
    }

    this.ul.animate({'left': -this.index * this.distance}, 500, function () {
      this.isMoving = false;
      cb && cb();
    }.bind(this));
  };

  Banner.prototype.autoStart = function () {

    if (!this.openAutoStart) {
      return;
    }

    window.clearTimeout(this.timer);
    var moving = function () {

      this.next(function () {
        this.timer = setTimeout(moving, 1000);
        console.log(this.timer);
      }.bind(this));
    }.bind(this);

    this.timer = setTimeout(moving, 1000);
  };

  Banner.prototype.bindEve = function () {
    var that = this;
    this.preEle.on('click', function (ev) {
      ev.stopPropagation();
      that.pre();
    });

    this.nextEle.on('click', function (ev) {
      ev.stopPropagation();
      that.next();
    });

    this.outer.on('mouseover', function () {
      window.clearTimeout(that.timer);
    }).on('mouseleave', function () {
      that.autoStart();
    });
  };


  /**
   * 暴露接口
   * @param  {object} option 配置
   *
   */
  $.fn.generateTip = function(option) {
    this.each(function (i, tip) {
      option.target = $(tip);
      new Tips(option);
    });

    return this;
  };


});

$(document).ready(function () {

  $('.pg-sub1-list .lists').generateTip({
    height: 285,
    overClass: 'tips-m-over'
  });
});