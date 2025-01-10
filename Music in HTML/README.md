# 在浏览器中播放音乐

在`player_main`后添加，依次类推

> 以下为例子

```html
<div class="light id" id="1">1</div>
<!-- id 两个数字都要改 -->
<div>
  <div class="change">シカ色デイズ (鹿色days)</div>
  <!-- 歌曲名称 -->
  <div class="change play_icon" onclick="change(1)"></div>
  <!-- 依次更改数字 -->
</div>
<div class="light"></div>
<!-- 歌手 -->
<div class="light"></div>
<!-- 歌曲时间 -->
```

`path`中

```js
let path = {
  1: {
    name: "",//歌曲名称
    path: "",//音乐路径
    album: "",//音乐封面
    songer: "",、//歌手
  },
}
```

音频路径为 music

音乐路径为\images\album
