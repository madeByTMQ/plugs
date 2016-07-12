(function (window, $, undefined) {

  var Tips = function (option) {

    this.init(option);
  };

  Tips.prototype.init = function (option) {

    this.data = null;
    this.target = option.target;

    this.option = {
      height:　option.height || 400,
      width: option.width || this.target.width(),
      overClass: option.overClass || 'tips-overClass',
      preClass: option.preClass || 'tips-preClass',
      nextClass: option.nextClass || 'tips-nextClass',
    };

    this.hasRender = false;
    this.isExpand = false;
    this.viewMore = $('<div><a href="javascript:;">查看更多</a></div>');
    this.loading = $('<div>稍等。。</div>');
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

      tpl = '<div><div data-img-contanier><a class="'+ that.option.preClass +'" data-pre href="javascript:;">上</a>' + imgs + '<a data-next class="'+ that.option.nextClass +'" href="javascript:;">下</a></div>'+
            '<div data-text-contanier><p>'+ data.description +'</p></div></div>',
      dom = $(tpl);

      that.target.append(dom);
      that.contanier = dom;
      that.textContanier = that.target.find('[data-text-contanier]');
      that.setStlye(dom);

      if (imgs.indexOf('img') > -1) {
        new Banner(dom, {
          width: that.option.width
        });
      }
      that.textAction();
    });
  };

  Tips.prototype.setStlye = function (dom) {
    dom.find('ul').css({
      'width': '10000px',
      'margin': 0,
      'padding': 0,
      'font-size': 0
    });

    dom.find('li').css({
      'width': this.option.width,
      'display': 'inline-block'
    });

    dom.find('[data-img-contanier]').css({
      'overflow': 'hidden',
      'width': this.option.width,
      'position': 'relative',
      'height': '200px'
    });

    dom.css({
      'position': 'absolute',
      'z-index': '99'
    });

    this.textContanier.css({
      'background-color' : '#f2f2f2'
    });
  };

  Tips.prototype.initText = function () {

    var  that = this;
    this.viewMore.css({
      'text-align': 'center',
      'position': 'absolute',
      'width': '100%',
      'top': '100%',
      'background-color': '#f2f2f2'
    }).one('click', function (ev) {
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
        'height': '40',
        'overflow': 'hidden'
      });
    }

    this.initText();
  };

  Tips.prototype.getData = function cache (url) {

    var df = $.Deferred();

    setTimeout(function () {
      df.resolve({
        imgs: ['./imgs/1.jpg','./imgs/3.jpg','./imgs/2.jpg'],
        description: '测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市测试长沙市'
      });
    },1000);
    return df.promise();
    // if (cache[url]) {
    //   return;
    // }

    // var that = this;
    // $.ajax(url).done(function (res) {
    //   that.data = cache[url] = res;
    // });
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
    this.setStlye();
    this.openAutoStart = option.openAutoStart;

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
    this.ul.css({
      'position': 'relative',
    });

    this.preEle.css({
      'position': 'absolute',
      'left': '0',
      'top': '50%',
      'margin-top': '-' + this.preEle.height() / 2 + 'px',
      'z-index': '10'
    });

    this.nextEle.css({
      'position': 'absolute',
      'right': '0',
      'top': '50%',
      'margin-top': '-' + this.preEle.height() / 2 + 'px',
      'z-index': '10'
    });
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
    this.preEle.on('click', function () {
      that.pre();
    });

    this.nextEle.on('click', function () {
      that.next();
    });

    this.outer.on('mouseover', function () {
      window.clearTimeout(that.timer);
    }).on('mouseleave', function () {
      that.autoStart();
    });
  };

  $.fn.generateTip = function(option) {
    this.each(function (i, tip) {
      option.target = $(tip);
      new Tips(option);
    });
  };

})(window, jQuery);