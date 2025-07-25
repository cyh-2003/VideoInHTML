class Player extends HTMLElement {
    #music =  new Audio()
    #music_time
    #music_volume
    #id
    #parse_lrc
    #requestID
    #icon
    #music_data
    #auto_theme_color
    #default_theme_color
    #player_progress_dot
    #player_progress_played
    #player_progress_inner
    #volume_bar_over
    #svg
    #btn_play
    #lrc_contents
    constructor() {
        super()
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(Player.template.content.cloneNode(true))

        //设置数据
        this.#music_data = this.data

        this.#icon = this.shadowRoot.querySelector('.play_icon')
        this.#player_progress_dot = this.shadowRoot.getElementById('player_progress_dot')
        this.#player_progress_played = this.shadowRoot.getElementById('player_progress_played')
        this.#player_progress_inner = this.shadowRoot.getElementById('player_progress_inner')
        this.#volume_bar_over = this.shadowRoot.getElementById('volume_bar_over')
        this.#svg = this.shadowRoot.getElementById('svg')
        this.#btn_play = this.shadowRoot.getElementById('button_play')

        let lrc = new TextDecoder().decode(
            Uint8Array.from(atob(this.#music_data[0].lrc), c => c.charCodeAt(0))
        )
        this.#parse_lrc = this.#parseLRC(lrc)
        this.#lrc_contents = this.shadowRoot.getElementById('lrc_contents')
        this.#lrc_contents.innerHTML = ''
        if (this.#parse_lrc.length > 1){
            for (let i = 0; i < this.#parse_lrc.length; i++) {
                let div_lrc = document.createElement('div')
                div_lrc.textContent = this.#parse_lrc[i].text
                this.#lrc_contents.appendChild(div_lrc)
            }
        }

        this.#update()
    }

    static get template() {
        const template = document.createElement('template')
        template.innerHTML = `
        <style>
  .player {
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .07),
    0 1px 5px 0 rgba(0, 0, 0, .1);
    border-radius: 2px;
    margin: 5px;
    user-select: none;
    transition: all .3s ease;

    *{
        box-sizing: border-box;
    }

    .big{
        .player_left{
            .icon_play{
                bottom: -32px !important;
                right: -32px !important;
                width: 30px !important;
                height: 30px !important;
            }
            .icon_pause{
                width: 20px !important;
                height: 20px !important;
                bottom: -65px !important;
                right: -65px !important;
            }
        }

        .player_right{
            margin-left:90px !important;
            height: 90px !important;
        }
    }

    .main {
        background: white;
        position: relative;
        .switcher:hover {
            opacity: 1;
        }

        .switcher {
            position: absolute;
            right: -4.6%;
            bottom: 0;
            height: 66px;
            background: #e6e6e6;
            width: 18px;
            border-radius: 0 2px 2px 0;
            cursor: pointer;
            opacity: .8;

            .switcher_icon {
                position: relative;
                transform: rotateY(180deg);
                top: 36%;
                width: 100%;
                height: 100%;
                vertical-align: middle;
                background: no-repeat url("./assets/right.svg");
            }
        }


        .player_left {
            z-index: 1;
            transition: all .3s ease;
            width: 90px;
            height: 90px;
            position: relative;
            cursor: pointer;
            background-size: cover;
            float: left;

            .play_icon {
                transition: all .1s ease;
                position: relative;
                border: 2px solid white;
                border-radius: 50%;
                opacity: .8;

                #svg {
                    position: absolute;
                    background: url("./assets/play.svg") no-repeat;
                }

                .svg_play {
                    width: 22px;
                    height: 22px;
                    left: 8.5px;
                    top: 2px;
                }

                .svg_pause {
                    width: 12px;
                    height: 12px;
                    top: 2px;
                    right: -.5px;
                }
            }

            .icon_play {
                bottom: -27%;
                right: -27%;
                width: 30px;
                height: 30px;
            }

            .icon_pause {
                width: 20px;
                height: 20px;
                bottom: -45px;
                right: -45px;
            }
        }

        .player_left:hover {
            .play_icon {
                opacity: 1;
            }
        }

        .player_right {
            margin-left: 66px;
            height: 66px;
            padding: 14px 7px 0 10px;
            will-change: transform, width;
            .music_name {
                width: 100%;
                height: 1em;
                margin: 0 0 13px 5px;
                position: relative;
                top: 0px;
                z-index: 1;
                #music_title {
                    display: inline-block;
                    font-size: 14px;
                }

                #music_singer {
                    display: inline-block;
                    font-size: 12px;
                    color: #666;
                    margin-left: 5px;
                }
            }

            .music_lrc {
                top: -2px;
                bottom: 22px;
                position: relative;
                height: 30px;
                overflow: hidden;

                #lrc_contents {
                    transition: all .5s ease-out;
                    font-size: 12px;
                    color: #666;
                    text-align: center;
                    line-height: 16px;

                    .lrc_current {
                        opacity: 1;
                        height:auto !important;
                        min-height: 16px;
                    }

                    div {
                        position: relative;
                        opacity: .4;
                        margin: 0;
                        padding: 0;
                        height: 16px !important;
                        overflow: hidden;
                    }
                }
            }

            .music_lrc::after {
                display: block;
                position: absolute;
                width: 100%;
                content: '';
                bottom: 0;
                height: 33%;
                background: linear-gradient(180deg, hsla(0, 0%, 100%, 0) 0, hsla(0, 0%, 100%, .8))
            }

            .music_lrc::before {
                display: block;
                position: absolute;
                width: 100%;
                content: '';
                height: 10%;
                background: linear-gradient(180deg, #fff 0, hsla(0, 0%, 100%, 0));
                top: 0;
            }

            .music_bottom {
                position: relative;
                display: flex;
                bottom: 0px;

                .player_progress {
                    flex: 1;
                    height: 2px;
                    position: relative;
                    top: 6px;

                    #player_progress_inner {
                        width: 100%;
                        top: 10px;
                        background-color: #cdcdcd;
                        height: 2px;
                    }

                    #player_progress_played {
                        position: relative;
                        width: 0;
                        top: -2px;
                        height: 2px;
                    }

                    #player_progress_dot {
                        transform: scale(0);
                        width: 10px;
                        height: 10px;
                        position: relative;
                        border-radius: 50%;
                        top: -4.5px;
                        transition: transform .3s ease-in-out;
                    }

                    #player_progress_click:hover #player_progress_dot {
                        transform: scale(1);
                    }

                    #player_progress_click {
                        width: 100%;
                        position: absolute;
                        top: 0;
                        height: 14px;
                        cursor: pointer;
                    }
                }

                .music_controller {
                    color: #999;
                    position: relative;
                    bottom: 5px;
                    margin-left: 5px;

                    .controller {
                        cursor: pointer;
                        opacity: .8;
                        display: inline-block;
                        width: 15px;
                        height: 15px;
                        background-repeat: no-repeat;
                    }

                    .controller:hover {
                        opacity: 1;
                    }

                    #time {
                        cursor: default;
                        opacity: 1;
                        position: relative;
                        width: auto;
                        font-size: 11px;
                        color: #999;
                        bottom: 3px;
                    }
               
                    #button_play {
                        position: relative;
                        left: 4px;
                        background-image: url("./assets/play_controller.svg");
                    }

                    #button_volume {

                        .volume {
                            position: relative;
                            width: 25px;
                            height: 35px;
                            top: -35px;
                            left: -5px;
                            transform: scaleY(0);
                            transition: all .2s ease-in-out;
                            transform-origin: bottom;

                            .volume_bar {
                                background: #aaa;
                                position: absolute;
                                height: 35px;
                                width: 5px;
                                left: 34%;
                                border-radius: 2.5px;

                                #volume_bar_over {
                                    transform-origin: bottom;
                                    width: 5px;
                                    bottom: 0;
                                    height: 100%;
                                    border-radius: 2.5px;
                                    position: absolute;
                                    transition: all .1s ease;
                                }
                            }
                        }
                    }

                    #button_volume:hover {
                        .volume {
                            transform: scaleY(1);
                        }
                    }

                    .volume_up {
                        background-image: url("./assets/volume-up.svg");
                    }

                    .volume_off {
                        background-image: url("./assets/volume-off.svg");
                    }

                    .volume_down {
                        background-image: url("./assets/volume-down.svg");
                    }
                }
            }

            .order_list {
                background-image: url("./assets/order-list.svg");
            }

            .order_random {
                background-image: url("./assets/order-random.svg");
            }

            .loop_all {
                background-image: url("./assets/loop-all.svg");
            }

            .loop_one {
                background-image: url("./assets/loop-one.svg");
            }

            .loop_none {
                background-image: url("./assets/loop-none.svg");
            }

            #button_lrc {
                background-image: url("./assets/lrc.svg");
            }
        }
    }

    .list_out {
        overflow: hidden;
        font-size: 12px;

        .list {
            cursor: pointer;
            max-height: 600px;
            transition: all 1s ease;

            .list_block {
                display: flex;
                align-items: center;
                height: 32px;
                border-top: 1px solid #e9e9e9;
                padding: 0 15px;

                .list_cur {
                    display: inline-block;
                    position: relative;
                    width: 3px;
                    height: 22px;
                    left: -15px;
                }

                .list_index {
                    color: #666;
                    margin-right: 12px;
                }

                .list_singer {
                    color: #666;
                    margin-left: auto
                }

            }

            .list_block:hover {
                background: #efefef;
            }

            .clicked {
                background: #e9e9e9;
            }

        }

        .list_hide {
            max-height: 0 !important;
            transition: all .4s ease;

            .list_block {
                display: flex;
                align-items: center;
                height: 32px;
                border-top: 1px solid #e9e9e9;
                padding: 0 15px;

                .list_cur {
                    display: inline-block;
                    position: relative;
                    width: 3px;
                    height: 22px;
                    left: -15px;
                }

                .list_index {
                    color: #666;
                    margin-right: 12px;
                }

                .list_singer {
                    color: #666;
                    margin-left: auto
                }
            }
            .clicked {
                background: #e9e9e9;
            }
        }
    }
}
        </style>
        <div class="player" style="width: 600px">
        <div class="big main">
            <div class="player_left">
                <div class="play_icon icon_play">
                    <div id="svg" class="svg_play"></div>
                </div>
            </div>
        <div class="player_right">
            <div class="music_name">
                <div id="music_title"></div>
                <div id="music_singer"></div>
            </div>
            <div class="music_lrc">
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
                    <div class="controller" id="button_play"></div>
                    <div class="controller volume_up" id="button_volume">
                        <div class="volume">
                            <div class="volume_bar">
                                <div id="volume_bar_over"></div>
                            </div>
                        </div>
                    </div>
                    <div class="controller" id="button_lrc"></div>
                </div>
            </div>
        </div>
    </div>
        `
        return template
    }

    // 组件创建完成的生命周期
    connectedCallback() {
        this.#btn_play.onclick = () => {
            this.toggle()
        }

        this.shadowRoot.getElementById('player_progress_click').onclick = (event) => {
            if (event.target == this.#player_progress_dot) return//防止事件冒泡
            this.#music.currentTime = (event.offsetX / this.#player_progress_inner.clientWidth) * this.#music_time
            this.#player_progress(event, event.offsetX)
        }

        let bool = true
        let btn_volume = this.shadowRoot.getElementById('button_volume')
        btn_volume.onclick = () => {
            if (this.#music.volume == 1) {
                btn_volume.className = 'controller volume_off'
                this.#music.volume = 0
                this.#music_volume = 0
                this.#volume_bar_over.style.height = '0'
            } else {
                if (this.#music_volume == 0) {
                    this.#music_volume = 1
                    btn_volume.className = 'controller volume_up'
                    this.#music.volume = this.#music_volume
                    this.#volume_bar_over.style.height = `${this.#music_volume * 100}%`
                } else {
                    if (bool) {
                        this.#volume_bar_over.style.height = `0`
                        this.#music.volume = 0
                        btn_volume.className = 'controller volume_off'
                        bool = false
                    } else {
                        this.#volume_bar_over.style.height = `${this.#music_volume * 100}%`
                        this.#music.volume = this.#music_volume
                        btn_volume.className = 'controller volume_down'
                        bool = true
                    }
                }
            }
        }

        let volume = this.shadowRoot.querySelector('.volume')
        volume.addEventListener('click',(event)=>{
            event.stopPropagation()
            let volume_height = volume.clientHeight
            btn_volume.className = 'controller volume_down'
            this.#music_volume =  Math.abs(event.clientY - btn_volume.getBoundingClientRect().top) / volume_height
            if (this.#music_volume > 1){
                this.#music_volume = 1
                btn_volume.className = 'controller volume_up'
            }
            this.#volume_bar_over.style.height = `${this.#music_volume * 100}%`
            this.#music.volume = this.#music_volume
        })

        this.#player_progress_dot.onmousedown = (event) => {
            let initX = event.clientX
            let startX = this.#player_progress_played.offsetWidth
            document.onmousemove = (event) => {
                let  moveX = event.clientX
                let newX = moveX - initX + startX
                if (0 <= newX && newX <= this.#player_progress_inner.offsetWidth) {
                    this.#player_progress_dot.style.left = newX-5 + "px"
                    this.#player_progress_played.style.width = newX + "px"
                    this.#music.muted = true
                    this.#music.currentTime = (newX / this.#player_progress_inner.clientWidth) * this.#music_time
                }
            }
        }

        this.shadowRoot.getElementById('button_lrc').onclick = ()=> {
            this.shadowRoot.querySelector('.music_lrc').style.opacity = this.shadowRoot.querySelector('.music_lrc').style.opacity == '0' ?  '1' : '0'
        }

        this.#music.addEventListener('loadedmetadata', () => {
            this.#music_time = Math.floor(this.#music.duration)
        })

        document.onmouseup = () => {
            if (this.#music.muted){
                this.#music.muted = false
            }
            document.onmousemove = null
        }

        this.#music.addEventListener('timeupdate', () => {
            let index = this.#parse_lrc.findIndex((e) => e.time >= this.#music.currentTime)
            if (index == -1) {
                index = this.#lrc_contents.children.length - 1
                this.#lrc_contents.style.transform = 'translateY(-' + index * 16  + 'px)'
            } else {
                index = (index == 0 ? 0 : index -1)
                this.#lrc_contents.style.transform = 'translateY(-' + index * 16  + 'px)'
            }
            this.shadowRoot.querySelector('.lrc_current')?.classList.remove('lrc_current')
            this.#lrc_contents.children[index].classList.add('lrc_current')
        })

        this.#music.src = './music/' + this.#music_data[0].path
        let clicked = this.shadowRoot.querySelector('.clicked')
        if (clicked) clicked.className = 'list_block'
        if (this.#music_data[0].theme_color){
            this.#setProgressBarColors(this.#music_data[0].theme_color)
        } else if (this.#auto_theme_color) {
            this.#getMainImageColor().then(data=>{this.#setProgressBarColors(data)})
        }

        this.shadowRoot.querySelector('.player_left').style.backgroundImage = `url('./album/${this.#music_data[0].album}')`
        this.shadowRoot.getElementById('music_title').innerHTML = this.#music_data[0].name
        this.shadowRoot.getElementById('music_singer').innerHTML = '-&nbsp;' + this.#music_data[0].singer
        this.shadowRoot.querySelector('.player_left').onclick = () => {
            this.toggle()
        }

        this.#update()
    }

    toggle(){
        if (this.#icon.classList.contains('icon_pause')) {
            this.pause()
        }
        else {
            this.play()
        }
    }

    play() {
        if (this.#music.src == '')  this.change(this.#id,false)
        this.#music.play()
        this.#icon.classList.replace('icon_play', 'icon_pause')
        this.#svg.classList.replace('svg_play','svg_pause')
        this.#svg.style.backgroundImage = 'url("./assets/pause.svg")'
        this.#btn_play.style.backgroundImage = 'url("./assets/pause_button.svg")'
    }

    pause(){
        this.#music.pause()
        cancelAnimationFrame(this.#requestID)
        this.#svg.style.backgroundImage = "url('./assets/play.svg')"
        this.#icon.classList.replace('icon_pause', 'icon_play')
        this.#svg.classList.replace('svg_pause','svg_play')
        this.#btn_play.style.backgroundImage = 'url("./assets/play_controller.svg")'
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
        this.#player_progress_played.style.background = color
        this.#player_progress_dot.style.background = color
        this.#volume_bar_over.style.background = color
    }

    #update = ()=> {
        this.#player_progress(event, (this.#music.currentTime / this.#music_time) * this.#player_progress_inner.clientWidth)
        this.#requestID = requestAnimationFrame(this.#update.bind(this))
    }

    #player_progress = (event, width) => {
        if (width >= this.#player_progress_inner.clientWidth) return
        this.#player_progress_dot.style.left = width-5 + 'px'
        this.#player_progress_played.style.width = width + "px"
        this.shadowRoot.getElementById('time').innerText = this.#formatTime(this.#music.currentTime,1) + " / " + this.#formatTime(this.#music_time)
    }
}

