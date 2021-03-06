import $ from 'jquery';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'lazyload';
const DATA_KEY = 'fe.lazyload';
const EVENT_KEY = `.${DATA_KEY}`;
const JQUERY_NO_CONFLICT = $.fn[NAME];

const Event = {
  SCROLL: `scroll${EVENT_KEY}`,
  RESIZE: `resize${EVENT_KEY}`,
};

const Direction = {
  BOTH: 'both',
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
  ABOVE: 'above',
};

/**
 * ------------------------------------------------------------------------
 * Utils
 * ------------------------------------------------------------------------
 */

function aboveTheTop(element, options) {
  let fold;

  if (options.container === undefined || options.container === window) {
    fold = 0;
  } else {
    fold = $(options.container)[0].getBoundingClientRect().top;
  }

  return fold >= $(element)[0].getBoundingClientRect().bottom + options.threshold;
}

function leftTheBegin(element, options) {
  let fold;

  if (options.container === undefined || options.container === window) {
    fold = 0;
  } else {
    fold = $(options.container)[0].getBoundingClientRect().left;
  }

  return fold >= $(element)[0].getBoundingClientRect().right + options.threshold;
}

function belowTheFold(element, options) {
  let fold;

  if (options.container === undefined || options.container === window) {
    const height = window.innerHeight ? window.innerHeight : $(window).height();
    fold = height;
  } else {
    fold = $(options.container)[0].getBoundingClientRect().bottom;
  }

  return fold <= $(element)[0].getBoundingClientRect().top - options.threshold;
}

function rightTheFold(element, options) {
  let fold;

  if (options.container === undefined || options.container === window) {
    fold = $(window).width();
  } else {
    fold = $(options.container)[0].getBoundingClientRect().right;
  }

  return fold <= $(element)[0].getBoundingClientRect().left - options.threshold;
}

const uuid = (() => {
  let counter = 0;
  return () => ++counter;
})();

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

function Lazyload(elements, options) {
  this.options = $.extend({}, Lazyload.Default, options);
  this.$elements = $(elements);
  this.$container = $(this.options.container);
  this._timer = null;
  this._unique = uuid();
  this._event = `${Event.SCROLL}.${this._unique},${Event.RESIZE}.${this._unique}`;

  // 图片预处理
  this._prepareImg();

  // 如果设置了 delay , 则直接加载
  if (this.options.delay >= 0) {
    setTimeout(() => {
      this._loadDirectly();
    }, this.options.delay);

    return;
  }

  // 绑定事件
  this.bind();

  // Document Ready 后触发一次
  $(() => {
    this.update();
  });
}

Lazyload.Default = {
  container: window,
  threshold: 0,
  direction: Direction.VERTICAL,
  skipInvisible: false,
  failureLimit: 0,
  delay: -1,
  attr: "data-src",
  srcsetAttr: "data-srcset",
  removeAttr: true,
  onAppear: null,
  onLoad: null, // only for img
  onError: null, // only for img
  placeholder: "data:image/gif;base64,R0lGODlhAQABAJEAAAAAAP///////wAAACH5BAEHAAIALAAAAAABAAEAAAICVAEAOw=="
};

Lazyload.prototype.update = function () {
  const that = this;
  const options = this.options;
  let counter = 0;

  function process(elem) {
    // if we found an elem we'll load, reset the counter
    counter = 0;

    // 已经出现过, 不再处理
    if (elem._lazyload_appear) {
      return;
    }

    // 设置为出现过
    elem._lazyload_appear = true;

    if (options.onAppear) {
      options.onAppear.call(elem, that.$elements.length, options);
    }

    if ($(elem).is('img')) {
      that._processImg(elem);
    }

    // Remove elem from array so it is not looped next time.
    setTimeout(function () {
      const temp = $.grep(that.$elements, function(element) {
        return !element._lazyload_appear;
      });
      that.$elements = $(temp);

      // 当处理完毕后, 解除事件绑定
      if (that.$elements.length <= 0) {
        that.$container.off(that._event);
      }
    }, 100);
  }

  this.$elements.each((index, elem) => {
    var $elem = $(elem);

    if (options.skipInvisible && !$elem.is(":visible")) {
      return;
    }

    if (options.direction === Direction.BOTH) {
      if (aboveTheTop(elem, options) || leftTheBegin(elem, options)) {
        // Nothing
      } else if (!belowTheFold(elem, options) && !rightTheFold(elem, options)) {
        process(elem);
      } else {
        if (++counter > options.failureLimit) {
          return false;
        }
      }
    } else if (options.direction === Direction.HORIZONTAL) {
      if (leftTheBegin(elem, options)) {
        // Nothing
      } else if (!rightTheFold(elem, options)) {
        process(elem);
      } else {
        if (++counter > options.failureLimit) {
          return false;
        }
      }
    } else if (options.direction === Direction.ABOVE) {
      if (!belowTheFold(elem, options)) {
        process(elem);
      } else {
        if (++counter > options.failureLimit) {
          return false;
        }
      }
    } else { // default: Direction.VERTICAL
      if (aboveTheTop(elem, options)) {
        // Nothing
      } else if (!belowTheFold(elem, options)) {
        process(elem);
      } else {
        if (++counter > options.failureLimit) {
          return false;
        }
      }
    }
    // end
  });
};

Lazyload.prototype.bind = function () {
  const event = this._event;
  this.$container.off(event).on(event, () => {
    // if (this._timer) {
    //   clearTimeout(this._timer);
    // }
    // this._timer = setTimeout(() => {
    //   this.update();

    //   clearTimeout(this._timer);
    //   this._timer = null;
    // }, 1000 / 60 * 2);

    if (!this._timer) {
      this._timer = setTimeout(() => {
        this.update();

        clearTimeout(this._timer);
        this._timer = null;
      }, 100);
    }
  });
};

Lazyload.prototype.unbind = function () {
  const event = this._event;
  this.$container.off(event);
};

Lazyload.prototype._processImg = function (item) {
  const that = this;
  const $item = $(item);
  const options = this.options;

  if (item._lazyloaded) {
    return;
  }

  const src = typeof options.attr === 'function' ? options.attr.call(item) : $item.attr(options.attr);
  const srcset = typeof options.srcsetAttr === 'function' ? options.srcsetAttr.call(item) : $item.attr(options.srcsetAttr);

  $("<img />")
    .one('load', function () {
      if (src !== $item.attr('src')) {
        $item.hide();

        $item.attr('src', src);
        if (srcset !== null) {
          $item.attr('srcset', srcset);
        }

        if (options.removeAttr) {
          if (typeof options.attr === 'string') {
            $item.removeAttr(options.attr);
          }
          if (typeof options.srcsetAttr === 'string') {
            $item.removeAttr(options.srcsetAttr);
          }
        }

        $item.show();
      }

      item._lazyloaded = true;

      /* Remove image from array so it is not looped next time. */
      const temp = $.grep(that.$elements, function(element) {
        return !element._lazyloaded;
      });
      that.$elements = $(temp);

      if (options.onLoad) {
        options.onLoad.call(item, that.$elements.length, options);
      }
    })
    .on('error', function () {
      if (options.onError) {
        options.onError.call(item, that.$elements.length, options);
      }
    })
    .attr({
      src: src,
      srcset: srcset || ''
    });
};

Lazyload.prototype._prepareImg = function () {
  const placeholder = this.options.placeholder;

  this.$elements.each(function () {
    const item = this;
    const $item = $(item);

    if (!$item.is('img')) {
      return;
    }

    // reset the status
    item._lazyloaded = false;

    // If no src attribute given use placeholder.
    if ($item.attr('src') === undefined || $item.attr('src') === false) {
      $item.attr('src', placeholder);
    }
  });
};

Lazyload.prototype._loadDirectly = function () {
  this.$elements.each((index, elem) => {
    if (this.options.onAppear) {
      this.options.onAppear.call(elem, this.$elements.length, this.options);
    }

    if ($(elem).is('img')) {
      this._processImg(elem);
    }
  });
};

/**
 * ------------------------------------------------------------------------
 * Plugin Definition
 * ------------------------------------------------------------------------
 */

function Plugin(config) {
  const $elements = this;
  const _config = $.extend({}, Lazyload.Default, typeof config === 'object' && config);

  new Lazyload($elements, _config);

  return this;
}


/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Plugin;
$.fn[NAME].Constructor = Lazyload;
$.fn[NAME].noConflict = function () {
  $.fn[NAME] = JQUERY_NO_CONFLICT;
  return Plugin;
}

export default Lazyload;
