```js
const a = document.createElement('a')
//命令式编程
a.style.backgroundColor = 'red'
a.style.color = 'blue'
a.style.fontSize = '2em'
a.href = 'http://www.shubaobaomumen.com'
a.target = '_blank'
a.textContent = '树宝宝木门'

document.body.appendChild(a)
```

```js
const a = document.createElement('a')
//使用模板字符串后
a.styles`background-color:red;color:blue;font-size:2em;`
.props`href:http://www.shubaobaomumen.com;target:_blank;`.content`树宝宝木门`

document.body.appendChild(a)
```

结果:

```html
<a style="background-color: red; color: blue; font-size: 2em;" href="http://www.shubaobaomumen.com" target="_blank">树宝宝木门</a>
```

# 备注

## 添加id

```js
a.props`id:myId;`
```
结果:
```html
<a id="myId">
```
## 添加class

```js
a.class`classOne classTwo;`//空格隔开
```
结果:
```html
<a class="classOne classTwo">
```