const videoShot = document.createElement('video')
const player = document.getElementById('player')
const video = player.querySelector('video')
const overed = player.querySelector('.progress-overed')
const dot = player.querySelector('.progress-dot')
const statePlayIcon  = player.querySelector('.state-play-icon')

let requestID

//temp todo
videoShot.src = video.src

//全局快捷键
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') e.preventDefault()
    console.log(e.key)
    switch (e.key.toLowerCase()) {
        case ' ':
            toggle()
            break
        case 'arrowright':
        case 'd':
            video.currentTime += 5
            break
        case 'arrowleft':
        case 'a':
            video.currentTime -= 5
            break
        case 'arrowup':
        case 'w':
            if (video.volume + 0.5 < 1) video.volume = video.volume + 0.5
            break
        case 'arrowdown':
        case 's':
            if (video.volume - 0.5 > 0) video.volume -= 0.5
            break
        case 'm':
            video.muted = !video.muted
            break
        case 'q':
            video.playbackRate += 0.5
            break
        case 'e':
            video.playbackRate -= 0.5
            break
        case 'f':
            document.fullscreenElement ? document.exitFullscreen() : player.requestFullscreen()
            break
        case 'escape':
            player.setAttribute('data-screen','normal')
    }
})

//加载完全后显示时长
video.addEventListener('loadeddata', () => {
    player.querySelector('.time-duration').textContent = formatTime(video.duration)
})

//播放
video.addEventListener('play', () => {
    update()
})

//暂停
video.addEventListener('pause', () => {
    cancelAnimationFrame(requestID)
})

//实时更新时间
function update(){
    player.querySelector('.time-current').textContent = formatTime(video.currentTime)
    player.querySelector('.shadow-progress-overed').style.width = (video.currentTime / video.duration) * 100 + '%'
    overed.style.width = (video.currentTime / video.duration) * 100 + '%'
    dot.style.left = (video.currentTime / video.duration) * safeArea.clientWidth - 6 + 'px'
    requestID = requestAnimationFrame(update)
}

//小电视logo移动
dot.addEventListener('mousedown', (e) => {
    cancelAnimationFrame(requestID)
    let initX = e.clientX
    let startX = overed.offsetWidth
    document.onmousemove = (event) => {
        let newX = event.clientX - initX + startX
        if (0 <= newX && newX <= safeArea.offsetWidth) {
            dot.style.left = newX + "px"
            overed.style.width = newX + "px"
            video.currentTime = (newX / safeArea.clientWidth) * video.duration
        }
    }
    document.onmouseup = () => {
        document.onmousemove = null
        update()
    }
})

//判断是否双击
let timer = null
video.addEventListener("click", () => {
    if (timer !== null) {
        clearTimeout(timer)
        timer = null
        document.fullscreenElement ? document.exitFullscreen() : player.requestFullscreen()
    } else {
        timer = setTimeout(() => {
            toggle()
            timer = null
        }, 200)
    }
})

//播放暂停切换
function toggle() {
    video.paused ? video.play() : video.pause()
    statePlayIcon.style.visibility = video.paused ? 'visible' : 'hidden'
}

//格式化时间
function formatTime(seconds) {
    let min = Math.floor(seconds / 60)
    let sec = Math.floor(seconds % 60)
    return (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec)
}

//点击时间显示输入框
const time = player.querySelector('.player-time')
let timeListener,updateTime = null
time.addEventListener('click', (e) => {
    e.stopPropagation()
    time.querySelector('input').value = time.querySelector('.time-current').textContent
    time.classList.add('time-clicked')

    if (timeListener) {
        document.removeEventListener('click', timeListener)
    }

    let finish = () => {
        time.classList.remove('time-clicked')
        document.removeEventListener('click', timeListener)
        timeListener = null
        updateTime = null
    }

    timeListener = (e) => {
        if (!time.contains(e.target)) {
            finish()
        }
    }

    updateTime = (e) => {
        if (e.key === 'Enter') {
            let temp = document.querySelector('input').value
            if (temp.includes(':')) {
                temp = temp.split(':')
                temp = temp[0] * 60 + temp[1]
                video.currentTime = temp
            } else {
                if ([...temp].some(char => isNaN(parseInt(char)))) {
                    alert('输入错误')
                } else {
                    video.currentTime = Number(temp)
                    video.play()
                    statePlayIcon.style.visibility = 'hidden'
                }
            }
            finish()
        }
}

    document.addEventListener('click', timeListener)
    document.addEventListener('keydown',updateTime)
})

// 监听鼠标不移动4秒事件
let mouse_timer = null
video.addEventListener('mousemove', () => {
    if (mouse_timer) {
        player.setAttribute('data-stay','false')
        clearTimeout(mouse_timer)
    }

    mouse_timer = setTimeout(() => {
        player.setAttribute('data-stay','true')
    },4000)
})
video.addEventListener('mouseout', () => {
    if (mouse_timer) {
        clearTimeout(mouse_timer)
    }
    player.setAttribute('data-stay','false')
})

//进度条点击事件
const safeArea = player.querySelector('.progress-safe-area')
safeArea.addEventListener('click', (e) => {
    let percent = (e.offsetX / safeArea.clientWidth) * 100
    video.currentTime = video.duration * (percent / 100)
    overed.style.width = percent + '%'
    dot.style.left = (video.currentTime / video.duration) * safeArea.clientWidth + 4 + 'px'
})

//进度条鼠标悬浮移动事件
let innerTimer = null
const popup = player.querySelector('.progress-popup')
const indicator =  player.querySelector('.progress-move-indicator')
safeArea.addEventListener('mousemove', (e) => {
    let percent = e.offsetX / safeArea.clientWidth
    let o = e.offsetX - 68
    o < 20 ? o = 20 : o > safeArea.offsetWidth - 150 && (o = safeArea.offsetWidth - 150)
    popup.style.left = o + 'px'

    indicator.style.left = percent  * 100 + '%'
    popup.querySelector('.popup-time').textContent = formatTime(video.duration * percent)
    throttle(get_video_shot(video.duration * (e.offsetX / safeArea.clientWidth)), 100)

    if (innerTimer) {
        clearTimeout(innerTimer)
    }
    innerTimer = setTimeout(() => {
        popup.classList.add('active')
        indicator.classList.add('active')
    }, 150)
})

safeArea.addEventListener('mouseleave', () => {
    popup.classList.remove('active')
    indicator.classList.remove('active')
    if (innerTimer) {
        clearTimeout(innerTimer)
    }
})

//获取视频在指定时间的缩略图
function get_video_shot(time = 0) {
       videoShot.currentTime = time
       const canvas = document.createElement('canvas')
       canvas.width = video.videoWidth
       canvas.height = video.videoHeight
       const ctx = canvas.getContext('2d')
       videoShot.oncanplay = () => {
           ctx.drawImage(videoShot, 0, 0, canvas.width, canvas.height)
           player.querySelector('img').src = canvas.toDataURL('image/jpeg')
       }
}

//节流
function throttle(fn, delay) {
    let lastTime = null
    return function (...args) {
        const now = Date.now()
        if (lastTime === null || now - lastTime > delay) {
            fn.apply(this, args)
            lastTime = now
        }
    }
}

player.querySelector('.control-top').addEventListener('mousemove',()=>{
    dot.classList.add("active")
})

player.querySelector('.control-top').addEventListener('mouseleave',()=>{
    dot.classList.remove("active")
})

player.querySelector('.btn-play').addEventListener('click',(e)=>{
    toggle()
})

//画中画
player.querySelector('.pip').addEventListener('click',()=>{
    document.pictureInPictureElement ? document.exitPictureInPicture() : video.requestPictureInPicture()
})

let dataScreen
player.querySelector('.widescreen').addEventListener('click',()=>{
    dataScreen = player.getAttribute('data-screen')
    if (document.fullscreenElement) document.exitFullscreen()
    dataScreen == 'widescreen' ? player.setAttribute('data-screen','normal') : player.setAttribute('data-screen','widescreen')
})

player.querySelector('.webscreen').addEventListener('click',()=>{
    dataScreen = player.getAttribute('data-screen')
    if (document.fullscreenElement) document.exitFullscreen()
    dataScreen == 'webscreen' ? player.setAttribute('data-screen','normal') : player.setAttribute('data-screen','webscreen')
})

//全屏
player.querySelector('.fullscreen').addEventListener('click',()=>{
    document.fullscreenElement ? document.exitFullscreen() : player.requestFullscreen()
})

    /*
    mediaSource.addEventListener('sourceopen', () => {
    const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
    fetch('/video').then(res => res.arrayBuffer()).then(data => sourceBuffer.appendBuffer(data))
    sourceBuffer.addEventListener('updateend', () => {
    mediaSource.endOfStream()
})
})*/



   /* const subtitle = document.querySelector('div[aria-label="字幕"]')
    subtitle.style.animation = 'move .3s ease-in-out 2 forwards'
    subtitle.addEventListener('mouseover', (e) => {
    subtitle.setAttribute("transform", `matrix(1, 0, 0, 1, 66, 54)`)
    setTimeout(
    ()=>{
    subtitle.setAttribute("transform", `matrix(1, 0, 0, 1, 56,44)`)
}
    , 1000)
})
*/

//MediaElementAudioSourceNode
//todo 视频音频自定义处理
function text() {
    const audCtx = new AudioContext()
    const source = audCtx.createMediaElementSource(video)
    const analyser = audCtx.createAnalyser()
    audCtx.createStereoPanner()
    source.connect(analyser)
    analyser.connect(audCtx.destination)
    analyser.fftSize = 256
}

//todo 视频色彩
///*filter: saturate(0.264107) brightness(1) contrast(1);*/
function videoColorChange(){
    let saturate
    let brightness
    let contrast
    return `filter:saturate(${saturate}) brightness(${brightness}) contrast(${contrast});`
}