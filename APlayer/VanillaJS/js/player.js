class music_player {
    #music_time
    #state
    #music_volume
    #id = 0
    #parse_lrc
    #requestID
    #button_play
    #button_next
    #button_prev
    #button_lrc
    #button_list
    #mini
    #button_order
    #size
    #fixed
    #default_theme_color
    #music_data
    #music_length
    #icon
    #listFolded
    #fixedBar
    #container
    #width
    #auto_theme_color
    music  = new Audio()
    constructor(options) {
        this.#fixedBar = options.fixedBar ? options.fixedBar : false
        this.#music_length = options.audio.length
        this.#music_data = options.audio
        this.#fixed = options.fixed ? options.fixed :false
        this.#button_play = options.play ? options.play : false
        this.#button_next = options.next ? options.next : false
        this.#button_prev = options.prev ? options.prev : false
        this.#button_lrc = options.lrc ? options.lrc : false
        this.#button_list = options.list ? options.list : this.#fixed
        this.#mini = options.mini ? options.mini : false
        this.#button_order = options.order ? options.order : false
        this.#size = options.size ? options.size : 'normal'
        this.#listFolded = options.listFolded ? options.listFolded :true
        this.#default_theme_color = options.default_theme_color ? options.default_theme_color : '#000'
        this.#container = options.container
        this.#width = options.width ? options.width : '590px'
        this.#auto_theme_color = options.auto_theme_color ? options.auto_theme_color : false
        this.#container.insertAdjacentHTML('beforeend',`
    <div class="player ${this.#fixed ? 'player_fixed': (this.#fixedBar ? 'player_fixedBar': null)}" style="width: ${this.#mini ? '66px':this.#width}">
        <div class="${this.#size == 'normal' ? '':'big'} main">
            <div class="player_left">
                <div class="play_icon icon_play">
                    <div id="svg" class="svg_play"></div>
                </div>
            </div>
        <div class="player_right" style="display: ${this.#mini ? 'none':null} ;border-top: ${this.#fixed?'1px solid #e9e9e9':null}">
            <div class="music_name">
                <div id="music_title"></div>
                <div id="music_singer"></div>
            </div>
            <div class="music_lrc" style="opacity: ${!this.#button_lrc||this.#fixed ? '0': '1'}">
                <div id="lrc_contents"></div>
            </div>
            <div class="music_bottom">
                <div class="player_progress">
                        <div id="player_progress_inner"></div>
                        <div id="player_progress_played">
                        </div>
                        <div id="player_progress_click">
                            <div id="player_progress_dot"></div>
                        </div>
                </div>
                <div class="music_controller">
                    <div class="controller" id="time">00:00 / 00:00</div>
                    <div class="controller" id="button_prev" style="display: ${this.#button_prev||this.#fixed||this.#fixedBar ? null:'none'}"></div>
                    <div class="controller" id="button_play" style="display: ${this.#button_play||this.#fixed||this.#fixedBar ? null:'none'}"></div>
                    <div class="controller" id="button_next" style="display: ${this.#button_next||this.#fixed||this.#fixedBar ? null:'none'}"></div>
                    <div class="controller volume_up" id="button_volume">
                        <div class="volume">
                            <div class="volume_bar">
                                <div id="volume_bar_over"></div>
                            </div>
                        </div>
                    </div>
                    <div class="controller order_list" id="button_order" style="display: ${this.#mini||this.#music_length == 1||this.#button_order  ? 'none':null}"></div>
                    <div class="controller loop_all" id="button_loop"></div>
                    <div class="controller" id="button_menu" style="display: ${this.#music_length == 1 ||this.#button_list||this.#fixed||this.#fixedBar ? null:'none'}"></div>
                    <div class="controller" id="button_lrc" style="display: ${!this.#button_lrc ? (this.#fixed?null :'none'):null}"></div>
                </div>
            </div>
        </div>
        <div class="switcher" style="display: ${this.#fixed ? null: 'none'}">
            <div class="switcher_icon"></div></div>
        </div>
    </div>
 `)
        document.querySelector('.main').insertAdjacentHTML(`${this.#fixed||this.#fixedBar ? 'beforebegin':'beforeend'}`,`<div class="list_out" style="display: ${this.#mini||this.#music_length == 1||this.#button_list||!this.#fixed||this.#fixedBar?'':'none'}">
            <div class="${this.#listFolded ? 'list_hide':'list'}">
            </div>
        </div>`)

        if (!this.#button_lrc)document.querySelector('.music_name').style.top = '-4px'

        for (let i in options.audio) {
            document.querySelector(`.${this.#listFolded ? "list_hide" : "list"}`).insertAdjacentHTML('beforeend',`<div class="list_block">
                <span class="list_cur"></span>
                <span class="list_index">${Number(i)+1}</span>
                <span class="list_title">${options.audio[i].name}</span>
                <span class="list_singer">${options.audio[i].singer}</span>
            </div>`)
        }
        this.#icon = document.querySelector('.play_icon')

        document.querySelectorAll('.list_block').forEach(((element,i) => {
            element.addEventListener('click',()=>{
                this.change(i)
            })
        }))

        globalThis.img_cover = document.querySelector('.player_left')
        document.querySelector('.player_left').style.backgroundImage = `url('./album/${options.audio[0].album}')`
        this.music.src = './music/'+options.audio[0].path

        music_title.innerHTML = options.audio[0].name
        music_singer.innerHTML = '-&nbsp;'+ options.audio[0].singer
        let lrc = new TextDecoder().decode(
            Uint8Array.from(atob(this.#music_data[0].lrc), c => c.charCodeAt(0))
        )
        this.#parse_lrc = this.#parseLRC(lrc)

        lrc_contents.innerHTML = ''
        if (this.#parse_lrc.length > 1){
            for (let i = 0; i < this.#parse_lrc.length; i++) {
                let div_lrc = document.createElement('div')
                div_lrc.textContent = this.#parse_lrc[i].text
                lrc_contents.appendChild(div_lrc)
            }
        }

        if (this.#music_data[0].theme_color){
            this.#setProgressBarColors(options.audio[0].theme_color)
        } else if (this.#auto_theme_color) {
            this.#getMainImageColor().then(data=>{
                this.#setProgressBarColors(data)
            })
        } else {
            this.#setProgressBarColors(this.#default_theme_color)
        }


        document.querySelectorAll('.list_cur')[0].style = `background:${options.audio[0].theme_color ? options.audio[0].theme_color : this.#default_theme_color};`
        document.querySelectorAll('.list_block')[0].classList.add('clicked')
        document.querySelector('.player_left').addEventListener('click',()=>{
            this.toggle()
        })

        document.querySelector('.switcher').addEventListener('click',  () =>{
            const player = document.querySelector('.player')
            player.classList.toggle('player_close')

            // 强制触发浏览器重绘（解决过渡失效问题）
            void player.offsetWidth
        })

        button_play.addEventListener('click',()=>{
            this.toggle()
        })

        //绑定下一首事件
        button_next.addEventListener('click', () => {
            this.next_song()
        })

        //绑定上一首事件
        button_prev.addEventListener('click', () => {
            this.prev_song()
        })

        //歌曲进度条点击
        player_progress_click.addEventListener("click", (event) => {
            if (event.target == player_progress_dot) return//防止事件冒泡
            this.music.currentTime = (event.offsetX / player_progress_inner.clientWidth) * this.#music_time
            this.#player_progress(event, event.offsetX)
        })

        let bool = true
        //音量图标点击逻辑
        button_volume.addEventListener('click',()=>{
            if (this.music.volume == 1){
                button_volume.className = 'controller volume_off'
                this.music.volume = 0
                this.#music_volume = 0
                volume_bar_over.style.height = '0'
            } else {
                if (this.#music_volume == 0){
                    this.#music_volume = 1
                    button_volume.className = 'controller volume_up'
                    this.music.volume = this.#music_volume
                    volume_bar_over.style.height = `${this.#music_volume*100}%`
                }else {
                    if (bool){
                        volume_bar_over.style.height = `0`
                        this.music.volume = 0
                        button_volume.className = 'controller volume_off'
                        bool = false
                    }else  {
                        volume_bar_over.style.height = `${this.#music_volume*100}%`
                        this.music.volume = this.#music_volume
                        button_volume.className = 'controller volume_down'
                        bool = true
                    }
                }
            }
        })

        //支持Media Session API
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata()
            navigator.mediaSession.setActionHandler('play', () => { this.toggle() })
            navigator.mediaSession.setActionHandler('pause', () => { this.toggle() })
            navigator.mediaSession.setActionHandler('seekbackward', () => { this.music.currentTime -= 3 })
            navigator.mediaSession.setActionHandler('seekforward', () => { this.music.currentTime += 3 })
            navigator.mediaSession.setActionHandler('previoustrack', () => { this.prev_song() })
            navigator.mediaSession.setActionHandler('nexttrack', () => { this.next_song() })
        }

        document.querySelector('.volume').addEventListener('click',(event)=>{
            event.stopPropagation()
            let volume_height = document.querySelector('.volume').clientHeight
            button_volume.className = 'controller volume_down'
            this.#music_volume =  Math.abs(event.clientY - button_volume.getBoundingClientRect().top) / volume_height
            if (this.#music_volume > 1){
                this.#music_volume = 1
                button_volume.className = 'controller volume_up'
            }
            volume_bar_over.style.height = `${this.#music_volume * 100}%`
            this.music.volume = this.#music_volume
        })

        if (this.#music_length == 1){
            this.#state = 2
        }else {
            this.#state = 1
        }
        button_loop.addEventListener("click", () => {
            switch (this.#state) {
                case 1:
                    button_loop.className = "loop_one controller"
                    this.#state = 2
                    break
                case 2:
                    button_loop.className = "loop_none controller"
                    this.#state = 3
                    break
                case 3:
                    button_loop.className = "loop_all controller"
                    if (this.#music_length == 1){
                        this.#state = 2
                    }else {
                        this.#state = 1
                    }
                    break
            }
        })

        button_order.addEventListener('click',()=>{
            button_order.classList.contains('order_list') ? button_order.classList.replace('order_list','order_random'): button_order.classList.replace('order_random','order_list')
        })

        //实现移动按钮改变音乐播放位置
        player_progress_dot.onmousedown = (event) => {
            let initX = event.clientX
            let startX = player_progress_played.offsetWidth
            document.onmousemove = (event) => {
                let  moveX = event.clientX
                let newX = moveX - initX + startX
                if (0 <= newX && newX <= player_progress_inner.offsetWidth) {
                    player_progress_dot.style.left = newX-5 + "px"
                    player_progress_played.style.width = newX + "px"
                    this.music.muted = true
                    this.music.currentTime = (newX / player_progress_inner.clientWidth) * this.#music_time
                }
            }
        }

        button_menu.addEventListener('click', () => {
            const Element = document.querySelector('.list, .list_hide')
            Element.classList.toggle('list_hide')
            Element.classList.toggle('list')
        })

        button_lrc.addEventListener('click', () => {
            document.querySelector('.music_lrc').style.opacity = document.querySelector('.music_lrc').style.opacity == '0' ?  '1' : '0'
        })

        //实现快捷键
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case " ":
                    event.preventDefault()//阻止网页滚动
                    this.toggle()
                    break
                case "ArrowLeft":
                case "a":
                case "A":
                    this.music.currentTime -= 3
                    break
                case "ArrowRight":
                case "d":
                case "D":
                    this.music.currentTime += 3
                    break
                case "q":
                case "Q":
                    this.prev_song()
                    break
                case "e":
                case "E":
                    this.next_song()
                    break
                case "ArrowUp":
                case "w":
                case "W":
                    let music_volume_up = Math.ceil(Math.floor(this.music.volume * 100) / 10) * 10 + 10
                    if (music_volume_up <= 100) {
                        volume_bar_over.style.height = `${music_volume_up}%`
                        this.music.volume = music_volume_up/100
                        this.#music_volume = music_volume_up /100
                    }
                    if (this.music.volume == 1){
                        button_volume.className = 'controller volume_up'
                    } else {
                        button_volume.className = 'controller volume_down'
                    }
                    break
                case "ArrowDown":
                case "s":
                case "S":
                    let music_volume_down = Math.ceil(Math.floor(this.music.volume * 100) / 10) * 10 - 10
                    if (music_volume_down >= 0) {
                        this.#music_volume = music_volume_down /100
                        this.music.volume = music_volume_down / 100
                        volume_bar_over.style.height = `${music_volume_down}%`
                        button_volume.className = 'controller volume_down'
                    }
                    if (this.music.volume == 0) button_volume.className = 'controller volume_off'
                    break
            }
        })

        //确保获得音乐的时长
        this.music.addEventListener('loadedmetadata', () => {
            this.#music_time = Math.floor(this.music.duration)
        })

        //音乐结束的操作
        this.music.onended = () => {
            switch (this.#state){
                case 1:
                    if (button_order.classList.contains('order_list')){
                        this.next_song()
                    }else {
                        let oldId = this.#id
                        while (true) {
                            this.#id = Math.floor(Math.random() * this.#music_length) + 1
                            if (this.#id != oldId) { break }
                        }
                        this.change(this.#id)
                    }
                    break
                case 2:
                    this.change(this.#id)
                    break
                case 3:
                    this.toggle()
                    break
            }
        }

        document.onmouseup = () => {
            if (this.music.muted){
                this.music.muted = false
            }
            document.onmousemove = null
        }

        //歌词向下移动
        this.music.addEventListener('timeupdate', () => {
            let index = this.#parse_lrc.findIndex((e) => e.time >= this.music.currentTime)
            if (index == -1) {
                index = lrc_contents.children.length - 1
                lrc_contents.style.transform = 'translateY(-' + index * 16  + 'px)'
            } else {
                index = (index == 0 ? 0 : index -1)
                lrc_contents.style.transform = 'translateY(-' +   index * 16  + 'px)'
            }
            document.querySelector('.lrc_current')?.classList.remove('lrc_current')
            lrc_contents.children[index].classList.add('lrc_current')
        })
        this.#update()
    }

    #update =()=> {
        this.#player_progress(event, (this.music.currentTime / this.#music_time) * player_progress_inner.clientWidth)
        this.#requestID = requestAnimationFrame(this.#update.bind(this))
    }

    #player_progress = (event, width) => {
        if (width >= player_progress_inner.clientWidth) return
        player_progress_dot.style.left = width-5 + 'px'
        player_progress_played.style.width = width + "px"
        time.innerText = this.#formatTime(this.music.currentTime,1) + " / " + this.#formatTime(this.#music_time)
    }


    //处理播放是否暂停/继续
    toggle(){
        if (this.#icon.classList.contains('icon_pause')) {
            this.pause()
        }
        else {
            this.play()
        }
    }

    //播放
    play() {
        if (this.music.src == '')  this.change(this.#id,false)
        this.music.play()
        this.#icon.classList.replace('icon_play', 'icon_pause')
        svg.classList.replace('svg_play','svg_pause')
        svg.style.backgroundImage = 'url("./assets/pause.svg")'
        button_play.style.backgroundImage = 'url("./assets/pause_button.svg")'
    }

    //暂停
    pause(){
        this.music.pause()
        cancelAnimationFrame(this.#requestID)
        svg.style.backgroundImage = "url('./assets/play.svg')"
        this.#icon.classList.replace('icon_pause', 'icon_play')
        svg.classList.replace('svg_pause','svg_play')
        button_play.style.backgroundImage = 'url("./assets/play_controller.svg")'
    }

    //歌曲切换逻辑
    change(num,bool=true) {
        this.#id = num
        if (bool) {
            this.music.src = './music/' + this.#music_data[num].path
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata.title = this.#music_data[num].name
                navigator.mediaSession.metadata.artist = this.#music_data[num].singer
                navigator.mediaSession.metadata.artwork = [{
                    src: "./album/" + this.#music_data[num].album,
                    sizes: '300x300',
                    type: 'image/*'
                },]
            }

            if (document.querySelector('.clicked')) document.querySelector('.clicked').className = 'list_block'
            document.querySelectorAll('.list_cur').forEach((element, index) => {
                element.style = ''
            })
            document.querySelectorAll('.list_cur')[num].style = `background:${this.#music_data[num].theme_color};`
            document.querySelectorAll('.list_block')[num].classList.add('clicked')

            if (this.#music_data[num].theme_color){
                this.#setProgressBarColors(this.#music_data[num].theme_color)
            } else if (this.#auto_theme_color) {
                this.#getMainImageColor().then(data=>{
                    this.#setProgressBarColors(data)
                })
            } else {
                this.#setProgressBarColors(this.#default_theme_color)
            }

            button_play.style.backgroundImage = 'url("./assets/pause_button.svg")'
            img_cover.style.backgroundImage = `url('./album/${this.#music_data[num].album}')`
            music_title.innerHTML = this.#music_data[num].name
            music_singer.innerHTML = '-&nbsp;' + this.#music_data[num].singer
            this.#icon.classList.replace('icon_play', 'icon_pause')
            svg.classList.replace('svg_play', 'svg_pause')
            svg.style.backgroundImage = "url('./assets/pause.svg')"
        }
        //歌词逻辑
        //歌词解析
        let lrc = new TextDecoder().decode(
            Uint8Array.from(atob(this.#music_data[num].lrc), c => c.charCodeAt(0))
        )
        this.#parse_lrc = this.#parseLRC(lrc)

        lrc_contents.innerHTML = ''
        if (this.#parse_lrc.length > 1){
            for (let i = 0; i < this.#parse_lrc.length; i++) {
                let div_lrc = document.createElement('div')
                div_lrc.textContent = this.#parse_lrc[i].text
                lrc_contents.appendChild(div_lrc)
            }
        }

        this.music.play()
        this.#update()
    }

    //上一首歌
    prev_song() {
        this.#id--
        if (this.#id == -1) this.#id = this.#music_length-1
        this.change(this.#id)
    }

    //下一首歌
    next_song() {
        this.#id++
        this.#id <= this.#music_length - 1 ? null : this.#id = 0
        this.change(this.#id)
    }

    //设置音量
    volume(percentage,bool){
        if (bool) this.music.volume = percentage
    }

    //销毁
    destroy(){
        this.#container.remove()
    }

    //跳转到特定时间,时间的单位为秒
    seek(time){
        this.music.currentTime = time
    }

    //格式化时间
    #formatTime(seconds,number=0) {
        let min = Math.floor(seconds / 60)
        let sec = Math.floor(seconds % 60)
        return (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : (sec+number))
    }

    #parseLRC(lrcText) {
        const regex = /^\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.+)$/gm
        const lyrics = []
        let match
        while ((match = regex.exec(lrcText)) !== null) {
            const [_, minutes, seconds, milliseconds = "000", text] = match
            if (text.trim()) {
                lyrics.push({
                    time: parseInt(minutes) * 60 + parseInt(seconds) + parseFloat(`0.${milliseconds}`),
                    text: text.trim()
                })
            }
        }
        return lyrics
    }

    //提取主题色
    #getMainImageColor() {
        const img = new Image()
        img.src = `./album/${this.#music_data[this.#id].album}`
        return new Promise((resolve,reject)=>{
        img.onload =  () =>{
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            ctx.drawImage(img, 0, 0)
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
            /* K-Means 算法
            const centers = quantize(data, 5)
            resolve(centers[1])*/
            const pixelArray = []
            for (let i = 0, offset, r, g, b, a; i < canvas.width*canvas.height; i = i + 20) {
                offset = i * 4
                r = data[offset]
                g = data[offset + 1]
                b = data[offset + 2]
                a = data[offset + 3]

                // 只提取非透明且不是白色的像素数据
                if (typeof a === "null" || a >= 125) {
                    if (!(r > 250 && g > 250 && b > 250)) {
                        pixelArray.push([r, g, b])
                    }
                }
            }
            let r=0,g=0,b=0
            for (let i = 0; i < pixelArray.length; i++) {
                r += pixelArray[i][0]
                g += pixelArray[i][1]
                b += pixelArray[i][2]
            }
            r = Math.trunc(r / pixelArray.length)
            g = Math.trunc(g / pixelArray.length)
            b = Math.trunc(b / pixelArray.length)
            resolve(`rgb(${r},${g},${b})`)
        }
    })
    }

    //设置进度条颜色
    #setProgressBarColors(color) {
        player_progress_played.style.background = color
        player_progress_dot.style.background = color
        volume_bar_over.style.background = color
    }
}

/*
K-Means 算法
function quantize(data, k,frequency = 20) {
    // 将颜色值转换为三维向量
    const vectors = []
    for (let i = 0; i < data.length; i += frequency) {
        if (!(data[i] > 250 && data[i+1] > 250 && data[i+2] > 250)) {
            vectors.push([data[i], data[i + 1], data[i + 2]])
        }
    }

    // 随机选择 K 个聚类中心
    const centers = []
    for (let i = 0; i < k; i++) {
        centers.push(vectors[Math.floor(Math.random() * vectors.length)])
    }

    // 迭代更新聚类中心
    let iterations = 0
    while (iterations < 90) {
        // 分配数据点到最近的聚类中心所在的簇中
        const clusters = new Array(k).fill().map(() => [])
        for (let i = 0; i < vectors.length; i++) {
            let minDist = Infinity
            let minIndex = 0
            for (let j = 0; j < centers.length; j++) {
                const dist = distance(vectors[i], centers[j])
                if (dist < minDist) {
                    minDist = dist
                    minIndex = j
                }
            }
            clusters[minIndex].push(vectors[i])
        }

        // 更新聚类中心
        let converged = true
        for (let i = 0; i < centers.length; i++) {
            const cluster = clusters[i]
            if (cluster.length > 0) {
                const newCenter = cluster
                    .reduce((acc, cur) => [
                        acc[0] + cur[0],
                        acc[1] + cur[1],
                        acc[2] + cur[2],
                    ])
                    .map((val) => val / cluster.length);
                if (!equal(centers[i], newCenter)) {
                    centers[i] = newCenter
                    converged = false
                }
            }
        }
        if (converged) {
            break
        }
        iterations++
    }

    // 将每个像素点的颜色值替换为所在簇的聚类中心的颜色值
    for (let i = 0; i < data.length; i += frequency) {
        const vector = [data[i], data[i + 1], data[i + 2]]
        let minDist = Infinity
        let minIndex = 0
        for (let j = 0; j < centers.length; j++) {
            const dist = distance(vector, centers[j])
            if (dist < minDist) {
                minDist = dist
                minIndex = j
            }
        }
        const center = centers[minIndex]
        data[i] = center[0]
        data[i + 1] = center[1]
        data[i + 2] = center[2]
    }

    // 计算每个颜色值在图像中出现的次数，并按出现次数从大到小排序
    const counts = {};
    for (let i = 0; i < data.length; i += frequency) {
        const color = `rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`
        counts[color] = counts[color] ? counts[color] + 1 : 1
    }
    const sortedColors = Object.keys(counts).sort(
        (a, b) => counts[b] - counts[a]
    )

    // 取前 k 个颜色作为主要颜色
    return sortedColors.slice(0, k)
}

function distance(a, b) {
    return Math.sqrt(
        (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
    )
}

function equal(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
}*/
