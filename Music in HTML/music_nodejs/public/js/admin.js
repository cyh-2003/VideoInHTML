import SHA256 from "./SHA256.js"
const main = document.getElementsByClassName('main')[0]
const channel = new BroadcastChannel('music_channel')
const xhr = new XMLHttpRequest()
const audio = new Audio()

globalThis.format_time = null
globalThis.music_data = null
globalThis.dia_id = null
globalThis.music_file_name = null
globalThis.music_path_name = null
globalThis.album_path_name = null

fetch('/get_songs').then(res => res.json()).then(data => {
    music_data = data
    main_admin_new()
})

//进行重绘重排
function main_admin_new() {
    main_admin.innerHTML = ''
    main_admin.insertAdjacentHTML('beforeend', `
                <div class="admin_border">id</div>
                <div class="admin_border">歌曲名</div>
                <div class="admin_border">歌手</div>
                <div class="admin_border">时间</div>
                <div class="admin_border">图片</div>
                <div class="admin_border">操作</div>`)
    for (let i in music_data) {
        main_admin.insertAdjacentHTML('beforeend', `
        <div class="admin_border">${i}</div>
        <div class="admin_border">${music_data[i].name}</div>
        <div class="admin_border">${music_data[i].singer}</div>
        <div class="admin_border">${music_data[i].time}</div>
        <div class="admin_border"><img src="/images/album/${music_data[i].album}"></div>
        <div class="admin_border">
        <button onclick="up(${i})">
        <span class="button_top">上移</span>
        </button>
        <button onclick="down(${i})">
        <span class="button_top">下移</span>
        </button>
        <button onclick="edit(${i})">
        <span class="button_top">编辑</span>
        </button>
        <button onclick="del(${i})">
        <span class="button_top">删除</span>
        </button>
        </div>
        `)
    }
}

//侧边栏切换
side_button.addEventListener('click', function () {
    sidebar.classList.toggle('collapsed')
    this.style.backgroundImage = sidebar.classList.contains('collapsed') ? "url(./images/side_right.svg)" : "url(./images/side_left.svg)"
    this.style.right = sidebar.classList.contains('collapsed') ? "0" : "-150px"
})

//侧边栏切换管理
admin.addEventListener('click', function () {
    main_upload.style.display = "none"
    main_admin.style.display = "grid"
    this.style.backgroundColor = "#daeafe"
    upload.style.backgroundColor = ""
    main.style.padding = "30px"
    document.getElementsByClassName('weclcome')[0].style.display = 'none'
    main.style.display = 'block'
    main_admin_new()
})

//拖拽样式
// var lastDrop = null
// document.addEventListener('dragenter',  (ev) => {
//     if (lastDrop) lastDrop.toggleAttribute('over', false)
//     const dropbox = ev.target.closest('[allowdrop]') // 获取最近的放置目标
//     if (dropbox) {
//         dropbox.toggleAttribute('over', true)
//         lastDrop = dropbox
//     }
// })
document.querySelectorAll('div[allowdrop]').forEach((element) => {
    element.addEventListener('dragover', (e) => {
        e.currentTarget.setAttribute('over', 'true')
    })

    element.addEventListener('dragleave', (e) => {
        e.currentTarget.removeAttribute('over')
    })
})

//侧边栏切换上传
upload.addEventListener('click', function () {
    admin.style.backgroundColor = ""
    main_upload.style.display = "flex"
    main_admin.style.display = "none"
    this.style.backgroundColor = "#daeafe"
    main.style.padding = `85px 0 0 85px`
    document.getElementsByClassName('weclcome')[0].style.display = 'none'
    main.style.display = 'block'
})

//上移
globalThis.up=(id)=>{
    let temp = music_data[id]
    if (id == 1) {
        music_data[1] = music_data[Object.keys(music_data).filter(key => !isNaN(key)).length]
        music_data[Object.keys(music_data).filter(key => !isNaN(key)).length] = temp
    } else {
        music_data[id] = music_data[id - 1]
        music_data[id - 1] = temp
    }
    admin_fetch('/update_song', JSON.stringify(music_data))
}

//下移
globalThis.down = (id)=>{
    let temp = music_data[id]
    if (id == Object.keys(music_data).filter(key => !isNaN(key)).length) {
        music_data[Object.keys(music_data).filter(key => !isNaN(key)).length] = music_data[1]
        music_data[1] = temp
    } else {
        music_data[id] = music_data[id + 1]
        music_data[id + 1] = temp
    }
    admin_fetch('/update_song', JSON.stringify(music_data))
}

//删除
globalThis.del= (id, bool = true)=>{
    delete music_data[id]
    let temp = Object.values(music_data)
    music_data = {}
    temp.forEach((item, index) => {
        music_data[index + 1] = item
    })
    admin_fetch('/update_song', JSON.stringify(music_data), bool)
}

//编辑
globalThis.edit = (id)=> {
    dia_id = id
    dia.showModal()
    submit.style.visibility = 'visible'
    dialog_singer.value = music_data[id].singer
    dialog_name.value = music_data[id].name
    dialog_music_name.innerText = music_data[id].path
    dialog_preview.src = `images/album/${music_data[id].album}`
    dialog_preview.style.display = 'block'
    dialog_lrc.value = music_data[id].lrc
}

dialog_file.addEventListener('change', (e) => {
    if (lastDrop) lastDrop.toggleAttribute('over', false)
    if (e.target.files[0].type.includes('image')) {
        file_preview(e, dialog_preview)
    } else {
        alert('不是图片')
    }
})

//文件上传预览
file.addEventListener('change', (e) => {
    if (lastDrop) lastDrop.toggleAttribute('over', false)
    if (e.target.files[0].type.includes('image')) {
        file_preview(e, preview)
    } else {
        alert('不是图片')
    }
})

function file_preview(e, tag) {
    const file = e.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = function (e) {
            tag.src = e.target.result
            tag.style.display = 'block'
        }
        reader.readAsDataURL(file)
    }
}

dialog_music.addEventListener('change', async (e) => {
    if (lastDrop) lastDrop.toggleAttribute('over', false)
    if (e.target.files[0].type.includes('audio')) {
        submit.style.visibility = 'visible'
        dialog_music_name.innerText = e.target.files[0].name
        format_time = await formatTime(e.target.files[0])
    } else {
        alert('不是音频文件')
    }
})



cancel.addEventListener('click', () => {
    dia.close()
    if (submit.style.visibility !== 'visible') cancel_xhr()
})

music.addEventListener('change', async (e) => {
    if (lastDrop) lastDrop.toggleAttribute('over', false)
    if (e.target.files[0].type.includes('audio')) {
        music_name.innerText = e.target.files[0].name
        format_time = await formatTime(e.target.files[0])
    } else {
        alert('不是音频文件')
    }
})

function formatTime(file) {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file)
        audio.src = objectUrl
        audio.onloadedmetadata = () => {
            const seconds = audio.duration
            const min = Math.floor(seconds / 60)
            const sec = Math.floor(seconds % 60)
            // 释放资源
            URL.revokeObjectURL(objectUrl)
            resolve((min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec))
        }
    })
}

//上传歌曲
upload_form.addEventListener("submit", async (e) => {
    const formData = new FormData(e.target)
    formData.append('time', format_time)
    formData.delete('image')
    album_path_name = `${random_string()}.${file.files[0].name.split('.').pop()}`
    formData.append('image', new File([file.files[0]], album_path_name, { type: file.files[0].type }))
    music_path_name = `${random_string()}.${music.files[0].name.split('.').pop()}`
    const music_file = new File([music.files[0]], music_path_name, { type: music.files[0].type })
    formData.delete('music')
    let bool = true
    if (music.files[0].size > 5242880) {
        send_xhr(music_file)
        bool = false
        //const chunks = chunkFun(music.files[0])
        //uploadFile(chunks)
    } else {
        formData.append('music', music_file)
    }
    formData.append('musicname', music_path_name)
    admin_fetch('/add_song', formData, bool)
    preview.style.display = 'none'
    music_name.textContent = ''
    upload_form.reset()
})

//编辑歌曲信息
dia_form.addEventListener('submit', async (e) => {
    const formData = new FormData(e.target)
    let bool = true
    submit.style.visibility = 'hidden'
   if (dialog_file.files[0]){
       formData.delete('image')
       album_path_name = `${random_string()}.${dialog_file.files[0].name.split('.').pop()}`
       formData.append('image',new File([dialog_file.files[0]],album_path_name, { type: dialog_file.files[0].type }))
   }
    if (dialog_music.files[0]) {
        formData.delete('music')
        formData.append('time', format_time)
        music_path_name = `${random_string()}.${dialog_music.files[0].name.split('.').pop()}`
        formData.append('music', music)
        const music_file = new File([dialog_music.files[0]], music_path_name, { type: dialog_music.files[0].type })
        if (dialog_music.files[0].size > 5242880) {
            dia_music.classList.add('progress')
            dialog_music_name.textContent = ''
            send_xhr(music_file)
            bool = false
            //const chunks = chunkFun(music_file)
            //uploadFile(chunks)
        } else {
            formData.append('music', music_file)
        }
    }
    music_data[dia_id] = {
        name: dialog_name.value,
        path: dialog_music.files[0] ? music_path_name : music_data[dia_id].path,
        time: dialog_music.files[0] ? format_time : music_data[dia_id].time,
        album: dialog_file.files[0] ? album_path_name : music_data[dia_id].album,
        singer: dialog_singer.value,
        lrc: dialog_lrc.value
    }
    admin_fetch('/update_song_info', formData, bool, false)
    admin_fetch('/update_song', JSON.stringify(music_data))
})

//退出登录
login_out.addEventListener('click', () => {
    fetch("/login_out").then(res => res.json()).then((data) => {
        msg(data.data.msg, () => { location.href = "/login" })
    })
})

/**
 * 发送请求
 * @param {string} url
 * @param {FormData} data
 * @param {boolean} bool 用于控制msg函数调用
 * @param {boolean} bool2 用于控制channel.postMessage调用
 */
function admin_fetch(url, data, bool = true,bool2 = true) {
    let config = {
        method: 'POST',
        body: data
    }
    if (url === '/update_song') {
        config.headers = {
            'Content-Type': 'application/json'
        }
    }
    fetch(url, config).then(res => res.json()).then(data => {
            if (bool) msg(data.data.msg, () => { }, main_admin_new)
            fetch('/get_songs').then(res => res.json()).then(data => {
                music_data = data
                if (bool2) channel.postMessage('new_music_data')
            })
        }

    )
}

//大文件上传分片,5MB一个分片
const chunkFun = (file, size = 5242880) => {
    const chunks = []
    for (let i = 0; i < file.size; i += size) {
        chunks.push(file.slice(i, i + size))
    }
    return chunks
}

//大文件分片上传
const uploadFile = (chunks) => {
    const List = []
    for (let i = 0; i < chunks.length; i++) {
        const formData = new FormData()
        formData.append('index', i)
        formData.append('total', chunks.length)
        formData.append('fileName', 'music')
        formData.append('music', chunks[i])
        List.push(fetch('/upload_large_file', {
            method: 'POST',
            body: formData
        }))
    }
    Promise.all(List).then(res => {
        fetch('/merge_large_file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileName: music_file_name
            })
        }).then(res => res.json()).then(data => {
            msg(data.data.msg)
        })
    })
}


/**
 * 展示消息
 * @param {String} msg 消息
 * @param {function} code 回调函数,拓展代码
 * @param {function} code2 回调函数,拓展代码
 */
function msg(msg, code = () => { }, code2 = () => { }) {
    const div = document.createElement('div')
    div.className = 'msg'
    div.innerText = msg
    document.body.appendChild(div)
    code2()
    setTimeout(() => {
        div.remove()
        code()
    }, 1500)
}

xhr.addEventListener('readystatechange', () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
        dia.close()
        div_music.classList.remove('progress')
        dia_music.classList.remove('progress')
        msg(JSON.parse(xhr.responseText).data.msg)
    }
})

xhr.addEventListener('error', () => {
    msg('上传失败')
})

xhr.upload.addEventListener('progress', (event) => {
    document.querySelector('.progress .div_music_progress').firstElementChild.textContent = Math.trunc(event.loaded / event.total * 100) + '%'
})

// 定义一个函数xhr，接收一个参数params
function send_xhr(data) {
    div_music.classList.add('progress')
    const file = new FormData()
    file.append('music', data)
    xhr.open('POST', '/upload_large_single_file')
    xhr.send(file)
}

// 取消xhr上传
globalThis.cancel_xhr = ()=>{
    xhr.abort()
    div_music.classList.remove('progress')
    dia_music.classList.remove('progress')
    submit.style.visibility = 'visible'
    del(Object.keys(music_data).length - 1, false)
}

function random_string(){
    return  Date.now().toString(36) + Math.random().toString(36).slice(2)
}