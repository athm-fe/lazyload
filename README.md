# Lazyload

支持图片懒加载，对于非图片内容，可以通过 `onAppear` 回调函数来自己处理加载逻辑

## Usage

首先你需要修改你的 HTML , 配置 `data-src` 来指定实际显示的图片. 另外, 要求指定图片的尺寸.

```html
<img class="lazy" data-src="img/example1.jpg" width="640" height="480">
<img class="lazy" data-src="img/example2.jpg" width="640" height="480">
<img class="lazy" data-src="img/example3.jpg" width="640" height="480">
```

然后通过脚本初始化

```javascript
$('img.lazy').lazyload();
```

### 自定义图片来源

```html
<img class="lazy" data-src2="img/example1.jpg" width="640" height="480">
<img class="lazy" data-src2="img/example2.jpg" width="640" height="480">
<img class="lazy" data-src2="img/example3.jpg" width="640" height="480">
```

```javascript
$('img.lazy').lazyload({
  attr: 'data-src2'
});
```

还可以配置函数

```javascript
$('img.lazy').lazyload({
  attr: function () {
    return $(this).attr('data-src2');
  }
});
```

### 使用 `srcset` 来支持 Retina 屏幕

```html
<img class="lazy"
  width="100" height="75"
  data-src="demo.jpg"
  data-srcset="demo.jpg 100w, demo_2x.jpg 200w"
  sizes="100px">
```

```javascript
$('img.lazy').lazyload();
```

当然, 你可以可以自定义 `srcset` 来源:

```javascript
$('img.lazy').lazyload({
  srcsetAttr: 'data-srcset2'
});
```

或者

```javascript
$('img.lazy').lazyload({
  srcsetAttr: function () {
    return $(this).attr('data-srcset2');
  }
});
```

### 区块懒加载

```html
<style>
  .box {
    margin: 20px auto;
    width: 500px;
    height: 500px;
    background-color: #f2f2f2;
    transition: all 0.3s;
  }
  .box.active {
    background-color: #f60;
  }
</style>
<div class="box"><div>
<div class="box"><div>
<div class="box"><div>
```

```javascript
$('.box').lazyload({
  onAppear: function () {
    $(this).html('<span>Loaded</span>').addClass('active');
  }
});
```

### 直接加载图片

当你不想要滚动懒加载时, 你可以直接指定一个延迟时间来加载图片, 比如 1000 毫秒后加载所有图片.

```javascript
$('.lazy').lazyload({
  delay: 1000
});
```

## Options

参数可以通过 data attributes 或者 JavaScript 两种方式来配置.

Name | Type | Default | Description
---- | ---- | ------- | -----------
container | object | `window` | 滚动容器, 默认是 `window` , 仅支持原生 Dom 对象做为参数.
threshold | number | 0 | 偏移值, 用户判断 DOM 是否满足条件.
direction | string | vertical | 方向, 用于判断 DOM 是否满足条件. 可配置 `'both'`(位于viewport内), `'vertical'`(仅考虑垂直方向), `'horizontal'`(仅考虑水平方向), `'above'`(位于viewport及上方即可).
skipInvisible | boolean | true | 是否忽略不可见 DOM . 不建议修改此项配置
failureLimit | number | 0 | 懒加载内部有一个依赖图片顺序的性能优化机制, 如果你的图片顺序是错乱的, 你可以适当调大该数值.
delay | number | -1 | 延迟加载时间, 单位毫秒, 当 delay >= 0 时, 会在 delay 时长后立即加载所有图片.
attr | string or function | data-src | 配置图片的 `src` 来源
srcsetAttr | string or function | data-srcset | 配置图片的 `srcset` 来源
removeAttr | boolean | true | 当图片加载完毕后，去掉 `attr` 和 `srcsetAttr` 配置的属性
onAppear | function | null | 当 DOM 满足条件时, 触发该回调函数, 仅触发一次.
onLoad | function | null | 仅针对图片, 当图片加载成功时触发该回调函数.
onError | function | null | 仅针对图片, 当图片加载失败时触发该回调函数.
placeholder | string | 一张 base64 透明图 | 仅针对图片, 占位图, 当没有默认 `src` 属性时, 会设置这个图片.

## Methods

### `.lazyload(options)`

初始化, 可以接受参数进行配置.

```javascript
$('img.lazy').lazyload({
  threshold: 100
});
```

# End

Thanks to [Bootstrap](http://getbootstrap.com/) and [tuupola/jquery_lazyload](https://github.com/tuupola/jquery_lazyload)
