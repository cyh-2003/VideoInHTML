class Player extends HTMLElement {
    #music = new Audio()
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
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(document.querySelector('template').content.cloneNode(true))

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
        if (this.#parse_lrc.length > 1) {
            for (let i = 0; i < this.#parse_lrc.length; i++) {
                let div_lrc = document.createElement('div')
                div_lrc.textContent = this.#parse_lrc[i].text
                this.#lrc_contents.appendChild(div_lrc)
            }
        }

        this.#update()
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
        volume.addEventListener('click', (event) => {
            event.stopPropagation()
            let volume_height = volume.clientHeight
            btn_volume.className = 'controller volume_down'
            this.#music_volume = Math.abs(event.clientY - btn_volume.getBoundingClientRect().top) / volume_height
            if (this.#music_volume > 1) {
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
                let moveX = event.clientX
                let newX = moveX - initX + startX
                if (0 <= newX && newX <= this.#player_progress_inner.offsetWidth) {
                    this.#player_progress_dot.style.left = newX - 5 + "px"
                    this.#player_progress_played.style.width = newX + "px"
                    this.#music.muted = true
                    this.#music.currentTime = (newX / this.#player_progress_inner.clientWidth) * this.#music_time
                }
            }
        }

        this.shadowRoot.getElementById('button_lrc').onclick = () => {
            this.shadowRoot.querySelector('.music_lrc').style.opacity = this.shadowRoot.querySelector('.music_lrc').style.opacity == '0' ? '1' : '0'
        }

        this.#music.addEventListener('loadedmetadata', () => {
            this.#music_time = Math.floor(this.#music.duration)
        })

        document.onmouseup = () => {
            if (this.#music.muted) {
                this.#music.muted = false
            }
            document.onmousemove = null
        }

        this.#music.addEventListener('timeupdate', () => {
            let index = this.#parse_lrc.findIndex((e) => e.time >= this.#music.currentTime)
            if (index == -1) {
                index = this.#lrc_contents.children.length - 1
                this.#lrc_contents.style.transform = 'translateY(-' + index * 16 + 'px)'
            } else {
                index = (index == 0 ? 0 : index - 1)
                this.#lrc_contents.style.transform = 'translateY(-' + index * 16 + 'px)'
            }
            this.shadowRoot.querySelector('.lrc_current')?.classList.remove('lrc_current')
            this.#lrc_contents.children[index].classList.add('lrc_current')
        })

        this.#music.src = './music/' + this.#music_data[0].path
        let clicked = this.shadowRoot.querySelector('.clicked')
        if (clicked) clicked.className = 'list_block'
        if (this.#music_data[0].theme_color) {
            this.#setProgressBarColors(this.#music_data[0].theme_color)
        } else if (this.#auto_theme_color) {
            this.#getMainImageColor().then(data => { this.#setProgressBarColors(data) })
        }

        this.shadowRoot.querySelector('.player_left').style.backgroundImage = `url('./album/${this.#music_data[0].album}')`
        this.shadowRoot.getElementById('music_title').innerHTML = this.#music_data[0].name
        this.shadowRoot.getElementById('music_singer').innerHTML = '-&nbsp;' + this.#music_data[0].singer
        this.shadowRoot.querySelector('.player_left').onclick = () => {
            this.toggle()
        }

        this.#update()
    }

    toggle() {
        if (this.#icon.classList.contains('icon_pause')) {
            this.pause()
        }
        else {
            this.play()
        }
    }

    play() {
        if (this.#music.src == '') this.change(this.#id, false)
        this.#music.play()
        this.#icon.classList.replace('icon_play', 'icon_pause')
        this.#svg.classList.replace('svg_play', 'svg_pause')
        this.#svg.style.backgroundImage = 'url("./assets/pause.svg")'
        this.#btn_play.style.backgroundImage = 'url("./assets/pause_button.svg")'
    }

    pause() {
        this.#music.pause()
        cancelAnimationFrame(this.#requestID)
        this.#svg.style.backgroundImage = "url('./assets/play.svg')"
        this.#icon.classList.replace('icon_pause', 'icon_play')
        this.#svg.classList.replace('svg_pause', 'svg_play')
        this.#btn_play.style.backgroundImage = 'url("./assets/play_controller.svg")'
    }

    //格式化时间
    #formatTime(seconds, number = 0) {
        let min = Math.floor(seconds / 60)
        let sec = Math.floor(seconds % 60)
        return (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : (sec + number))
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
        return new Promise((resolve, reject) => {
            img.onload = () => {
                const canvas = document.createElement("canvas")
                const ctx = canvas.getContext("2d")
                canvas.width = img.naturalWidth
                canvas.height = img.naturalHeight
                ctx.drawImage(img, 0, 0)
                const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
                const pixelArray = []
                for (let i = 0, offset, r, g, b, a; i < canvas.width * canvas.height; i = i + 20) {
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
                let r = 0, g = 0, b = 0
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

    #update = () => {
        this.#player_progress(event, (this.#music.currentTime / this.#music_time) * this.#player_progress_inner.clientWidth)
        this.#requestID = requestAnimationFrame(this.#update.bind(this))
    }

    #player_progress = (event, width) => {
        if (width >= this.#player_progress_inner.clientWidth) return
        this.#player_progress_dot.style.left = width - 5 + 'px'
        this.#player_progress_played.style.width = width + "px"
        this.shadowRoot.getElementById('time').innerText = this.#formatTime(this.#music.currentTime, 1) + " / " + this.#formatTime(this.#music_time)
    }
}
