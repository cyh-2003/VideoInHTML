const music = document.querySelector("audio")
let requestID
let music_time
let songs_length = document.getElementsByClassName("id").length
music.volume = .6
music_time = Math.floor(music.duration)
let id = 1
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
function play() {
    music.pause()
    if (btn_play.className == "") {
        music.src == "" ? change(id) : undefined
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

btn_next.addEventListener("click", () => {
    next_song()
})
btn_prev.addEventListener("click", () => {
    prev_song()
})
//进度条
const update = () => {
    player_progress(event, (music.currentTime / music_time) * player_progress_inner.clientWidth)
    requestID = requestAnimationFrame(update)
}

function player_progress(event, width) {
    player_progress_dot.style.left = width + 'px'
    player_progress_played.style.width = width + "px"
    player_music_time.innerText = formatTime(music.currentTime) + " / " + formatTime(music_time)
}

player_progress_click.addEventListener("click", (event) => {
    music.currentTime = (event.offsetX / player_progress_inner.clientWidth) * music_time
    player_progress(event, event.offsetX)
})

voice_logo.addEventListener("click", () => {
    if (voice_logo.className == "") {
        voice_logo.className = "no_vocie"
        voice_logo_Fn(0, 0, 0)
    } else {
        voice_logo.classList.remove("no_vocie")
        voice_logo_Fn(.6, 60 * (voice_inner.clientWidth / 100), 50)
    }
})
function voice_logo_Fn(volume, left, width) {
    music.volume = volume
    voice_dot.style.left = left + "px"
    voice_overed.style.width = width + "px"
}

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

function song_list_dom(id, bool) {
    Array.from(document.getElementById('player__main').querySelectorAll('div')).forEach((div) => {
        div.style.opacity = .6
    })
    for (let i = 1; i < songs_length + 1; i++) {
        document.getElementById(i).innerHTML = i
    }
    if (bool) {
        document.getElementById(id).innerHTML = '<img src="./images/wave.gif">'
        Array.from(document.getElementById('player__main').querySelectorAll('div')).slice(-2 + 6 * id, 4 + id * 6).forEach((div) => {
            div.style.opacity = 1
        })
    }
}

function change(num) {
    id = num
    song_list_dom(id, true)
    music.pause()
    music.src = "./music/" + path[num]["path"]
    player_music_info.innerText = path[num]["name"]
    music.play()
    btn_play.className = "pause"
    update()
    song_img.style.backgroundImage = "url(./images/album/" + path[num]["album"] + ")"
    document.body.style.backgroundImage = "url(./images/album/" + path[num]["album"] + ")"
    song_name.innerText = "歌曲名：" + path[num]["name"]
    songer.innerText = "歌手：" + path[num]["songer"]
}

music.addEventListener('loadedmetadata', () => {
    music_time = Math.floor(music.duration)
})
voice_click.addEventListener("click", (event) => {
    voice_overed.style.width = event.offsetX + "px"
    voice_dot.style.left = event.offsetX + "px"
    music.volume = event.offsetX / voice_inner.clientWidth
})

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case " ":
            play()
            break
        case "a":
        case "A":
            music.currentTime -= 3
            break
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
        //case "w":
        //case "W":
        //    music.volume > 0.99 ? undefined : music.volume += 0.1, voice_logo.classList.remove("no_vocie")
        //    break
        //case "s":
        //case "S":
        //    music.volume < 0.1 ? undefined : music.volume -= 0.1
        //    music.volume < 0.1 ? voice_logo.classList.add("no_vocie") : undefined
        //    break
    }
})
function prev_song() {
    id--
    id == 0 ? id = songs_length : undefined
    change(id)
}
function next_song() {
    id++
    id < songs_length + 1 ? undefined : id = 1
    change(id)
}
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



