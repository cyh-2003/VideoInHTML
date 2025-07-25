const channel = new BroadcastChannel('music_channel')
const img = new Image()

network()

globalThis.songs_length = null
const music = new Audio()
let requestID
let music_time
let id = 1
let music_Volume = .6
music.volume = .6
//歌词变量
let song_lrc_list = []
let result
let re_time = /\[\d{2}:\d{2}(?:\.\d{2})?]/
//标签页通信,自动刷新
channel.addEventListener('message', (event) => {
    player__main.innerHTML = `<div class="light"></div>
                <div class="light">歌曲</div>
                <div class="light">歌手</div>
                <div class="light">时长</div>`
    network(true)
})

function network(bool) {
    fetch('/get_songs').then(res => res.json()).then(data => {
        globalThis.music_resource = data
        //根据json数据动态插入
        for (let i in music_resource) {
            player__main.insertAdjacentHTML('beforeend', `
        <div class="light id" id="${i}">${i}</div>
        <div>
            <div class="change">${music_resource[i].name}</div>
            <div class="change play_icon" onclick="change(${i})"></div>
        </div>
        <div class="light">${music_resource[i].singer}</div>
        <div class="light">${music_resource[i].time}</div>`)
        }
        songs_length = document.getElementsByClassName("id").length
        if (bool) change(id)
    })
}

//页面可见度API,可自行决定是否离开页面自动暂停
/*
window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === "hidden") {
        cancelAnimationFrame(requestID)
        music.pause()
    }else {
        music.play()
    }
})
*/

//格式化时间
function formatTime(seconds) {
    let min = Math.floor(seconds / 60)
    let sec = Math.floor(seconds % 60)
    return (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec)
}
//按钮播放
btn_play.addEventListener("click", () => {
    play()
})
//处理播放是否暂停/继续
function play() {
    if (btn_play.className == "") {
        if (music.src == "") change(id)
        music.play()
        update()
        song_list_dom(id, true)
        btn_play.className = "pause"
    }
    else {
        btn_play.classList.remove("pause")
        music.pause()
        cancelAnimationFrame(requestID)
        song_list_dom(id, false)
    }
}
//绑定下一首事件
btn_next.addEventListener("click", () => {
    next_song()
})
//绑定上一首事件
btn_prev.addEventListener("click", () => {
    prev_song()
})
//进度条
const update = () => {
    player_progress(event, (music.currentTime / music_time) * player_progress_inner.clientWidth)
    requestID = requestAnimationFrame(update)
}
//歌曲进度条dom
function player_progress(event, width) {
    player_progress_dot.style.left = width + 'px'
    player_progress_played.style.width = width + "px"
    player_music_time.innerText = formatTime(music.currentTime) + " / " + formatTime(music_time)
}
//歌曲进度条点击
player_progress_click.addEventListener("click", (event) => {
    music.currentTime = (event.offsetX / player_progress_inner.clientWidth) * music_time
    player_progress(event, event.offsetX)
})
//音量图标点击逻辑
voice_logo.addEventListener("click", () => {
    if (voice_logo.className == "") {
        voice_logo.className = "no_vocie"
        voice_logo_Fn(0, 0, 0)
        if (music.volume != 0) music_Volume = music.volume
    } else {
        voice_logo.classList.remove("no_vocie")
        let voice_volume_restart = (music_Volume * 100) * (voice_inner.clientWidth / 100)
        voice_logo_Fn(music_Volume, voice_volume_restart, voice_volume_restart)
        if (music.volume == 0) { voice_logo.className = "no_vocie" }
    }
})
//音量条dom
function voice_logo_Fn(volume, left, width) {
    music.volume = volume
    voice_dot.style.left = left + "px"
    voice_overed.style.width = width + "px"
}
//更改播放模式,循环播放,重复播放，随机播放
let state = 1
btn_loop.addEventListener("click", () => {
    switch (state) {
        case 1:
            btn_loop.className = "btn_single"
            state = 2
            break
        case 2:
            btn_loop.className = "btn_random"
            state = 3
            break
        case 3:
            btn_loop.className = "btn_order"
            state = 1
            break
    }
})
//歌曲列表变化dom操作
function song_list_dom(id, bool) {
    Array.from(player__main.querySelectorAll('div')).forEach((div) => {
        div.style.opacity = .8
    })
    for (let i = 1; i < songs_length + 1; i++) {
        document.getElementById(i).innerHTML = i
    }

    if (bool) {
        document.getElementById(id).innerHTML = '<img src="./images/wave.gif">'
        Array.from(player__main.querySelectorAll('div')).slice(-2 + 6 * id, 4 + id * 6).forEach((div) => {
            div.style.opacity = 1
        })
    }
}
//歌曲切换逻辑
window.change = (num) => {
    id = num
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata.title = music_resource[id].name
        navigator.mediaSession.metadata.artist = music_resource[id].singer
        navigator.mediaSession.metadata.artwork = [{ src: "./images/album/" + music_resource[id].album, sizes: '300x300', type: 'image/webp' },]
    }

    img.src = "./images/album/" + music_resource[num].album


    //歌词逻辑
    //歌词解析
    //decodeURIComponent(escape(atob(music_resource[1].lrc)))
    result = new TextDecoder().decode(
        Uint8Array.from(atob(music_resource[num].lrc), c => c.charCodeAt(0))
    ).split('\n')

    //歌词显示(dom)
    song_lrc.innerHTML = ''
    song_lrc_list = []
    if (music_resource[num].lrc) {
        song_lrc.innerHTML = window.innerHeight > 800 ? '<br><br><br><br><br><br><br>' : '<br><br><br><br><br><br>'
        for (let i = 0; i < result.length; i++) {
            let div_lrc = document.createElement('div')
            if (result[i].match(re_time)) {
                let text = result[i].replace(re_time, '')
                let match = result[i].match(re_time)[0].match(/\[(\d{2}):(\d{2})(?:\.(\d{1,2}))?\]/)
                const milliseconds = match[3] ? parseInt(match[3], 10) : 0
                const totalSeconds = parseInt(match[1], 10) * 60 + parseInt(match[2], 10) + milliseconds / 100
                if (text) {
                    song_lrc_list.push({ time: totalSeconds, text: text })
                    div_lrc.textContent = text
                    song_lrc.appendChild(div_lrc)
                }
            }
        }
    } else {
        song_lrc.innerHTML = '<br><br><br><br><br><br><br>'
    }
    song_list_dom(num, true)
    music.src = "./music/" + music_resource[num].path
    player_music_info.innerText = music_resource[num].name
    music.play()
    btn_play.className = "pause"
    update()
    song_img.style.backgroundImage = "url(./images/album/" + music_resource[num].album + ")"
    bg.style.backgroundImage = "url(./images/album/" + music_resource[num].album + ")"
    song_name.innerText = "歌曲名：" + music_resource[num].name
    singer.innerText = "歌手：" + music_resource[num].singer

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
            if (typeof a === "undefined" || a >= 125) {
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
        document.body.style = `background:rgb(${r},${g},${b})`
    }
}
//确保获得音乐的时长
music.addEventListener('loadedmetadata', () => {
    music_time = Math.floor(music.duration)
})
//音乐进度条dom操作
voice_click.addEventListener("click", (event) => {
    voice_overed.style.width = event.offsetX + "px"
    voice_dot.style.left = event.offsetX + "px"
    music.volume = event.offsetX / voice_inner.clientWidth
    if (music.volume > 0) {
        music_Volume = music.volume
        voice_logo.classList.remove("no_vocie")
    }
})
//实现快捷键
document.addEventListener('keydown', (event) => {
    let music_volume = Math.floor(music.volume * 100)
    switch (event.key) {
        case " ":
            event.preventDefault()//阻止网页滚动
            play()
            break
        case "ArrowLeft":
        case "a":
        case "A":
            music.currentTime -= 3
            break
        case "ArrowRight":
        case "d":
        case "D":
            music.currentTime += 3
            break
        case "q":
        case "Q":
            prev_song()
            break
        case "e":
        case "E":
            next_song()
            break
        case "ArrowUp":
        case "w":
        case "W":
            let music_volume_up = Math.ceil(music_volume / 10) * 10 + 10
            let width_left = Math.floor(music_volume_up * (voice_inner.clientWidth / 100))
            if (music_volume_up <= 100) {
                voice_logo_Fn(music_volume_up * .01, width_left, width_left)
                voice_logo.classList.remove("no_vocie")
                music_Volume = music.volume
            }
            break
        case "ArrowDown":
        case "s":
        case "S":
            let music_volume_down = Math.ceil(music_volume / 10) * 10 - 10
            let width_right = Math.floor(music_volume_down * (voice_inner.clientWidth / 100))
            if (music_volume_down >= 0) {
                voice_logo_Fn(music_volume_down * .01, width_right, width_right)
                music_Volume = music.volume
            }
            if (music.volume == 0) voice_logo.className = "no_vocie"
            break
    }
})
//上一首歌
function prev_song() {
    id--
    if (id == 0) id = songs_length
    change(id)
}
//下一首歌
function next_song() {
    id++
    id < songs_length + 1 ? undefined : id = 1
    change(id)
}
//音乐结束的操作
music.onended = () => {
    switch (state) {
        case 1:
            next_song()
            break
        case 2:
            change(id)
            break
        case 3:
            let oldId = id
            while (true) {
                id = Math.floor(Math.random() * songs_length) + 1
                if (id != oldId) { break }
            }
            change(id)
            break
    }
}
//实现移动按钮改变音乐播放位置
player_progress_dot.onmousedown = (event) => {
    dot_move(event, player_progress_dot, player_progress_inner, player_progress_played, true)
}

voice_dot.onmousedown = (event) => {
    dot_move(event, voice_dot, voice_inner, voice_overed, false)
}

function dot_move(event, dot, inner, overed, bool) {//bool为true时调整播放进度条,false调整音量
    let initX = event.clientX
    let startX = overed.offsetWidth
    document.onmousemove = (event) => {
        let moveX = event.clientX
        let newX = moveX - initX + startX
        if (0 <= newX && newX <= inner.offsetWidth) {
            dot.style.left = newX + "px"
            overed.style.width = newX + "px"
            if (bool) {
                music.muted = true
                music.currentTime = (newX / inner.clientWidth) * music_time
            } else {
                music.volume = newX / inner.clientWidth
                if (music.volume == 0) {
                    voice_logo.className = "no_vocie"
                } else {
                    voice_logo.classList.remove("no_vocie")
                }
            }
        }
    }
    document.onmouseup = () => {
        document.onmousemove = null
        if (bool) {
            music.muted = false
            update()
        }
    }
}
//支持Media Session API
if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata()
    navigator.mediaSession.setActionHandler('play', () => { play() })
    navigator.mediaSession.setActionHandler('pause', () => { play() })
    navigator.mediaSession.setActionHandler('seekbackward', () => { music.currentTime -= 3 })
    navigator.mediaSession.setActionHandler('seekforward', () => { music.currentTime += 3 })
    navigator.mediaSession.setActionHandler('previoustrack', () => { prev_song() })
    navigator.mediaSession.setActionHandler('nexttrack', () => { next_song() })
}
//歌词向下移动
music.addEventListener('timeupdate', () => {
    if (music_resource[id].lrc) {
        let index = song_lrc_list.findIndex((e) => e.time > music.currentTime)
        if (index == -1) {
            song_lrc.style.transform = 'translateY(-' + song_lrc_list.length * 34 + 'px)'
            index = song_lrc_list.length + song_lrc.querySelectorAll('br').length - 1
        } else {
            song_lrc.style.transform = 'translateY(-' + (index - 1) * 34 + 'px)'
            index = index + song_lrc.querySelectorAll('br').length - 1
        }
        document.querySelector('.on')?.classList.remove('on')
        song_lrc.children[index].classList.add('on')
    }
})

document.querySelector('a').addEventListener('click', () => {
    window.open('/login', 'login')
})