const main = document.getElementsByClassName('main')[0]
globalThis.music_data
globalThis.dia_id

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
        <div class="admin_border">${music_data[i].songer}</div>
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
    same(20)
})

//上移
function up(id) {
    let temp = music_data[id]
    if (id == 1) {
        music_data[1] = music_data[Object.keys(music_data).filter(key => !isNaN(key)).length]
        music_data[Object.keys(music_data).filter(key => !isNaN(key)).length] = temp
        console.log(music_data)
    } else {
        music_data[id] = music_data[id - 1]
        music_data[id - 1] = temp
    }
    admin_fetch('/update_song', JSON.stringify(music_data))
}

//下移
function down(id) {
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
function del(id) {
    delete music_data[id]
    let temp = Object.values(music_data)
    music_data = {}
    temp.forEach((item, index) => {
        music_data[index + 1] = item
    })
    admin_fetch('/update_song', JSON.stringify(music_data))
}
//编辑
function edit(id) {
    dia_id = id
    dia.showModal()
    dialog_time.value = music_data[id].time
    dialog_songer.value = music_data[id].songer
    dialog_name.value = music_data[id].name
    dialog_music_name.innerText = music_data[id].path
    dialog_preview.src = `images/album/${music_data[id].album}`
    dialog_preview.style.display = 'block'
    dialog_lrc.value = music_data[id].lrc
}
//侧边栏切换上传
upload.addEventListener('click', function () {
    admin.style.backgroundColor = ""
    main_upload.style.display = "flex"
    main_admin.style.display = "none"
    this.style.backgroundColor = "#daeafe"
    same(100)
})
function same(padding) {
    document.getElementsByClassName('weclcome')[0].style.display = 'none'
    main.style.display = 'block'
    main.style.padding = `${padding}px`
}
dialog_file.addEventListener('change', (e) => {
    file_preview(e, dialog_preview)
})

//文件上传预览
file.addEventListener('change', (e) => {
    file_preview(e, preview)
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

dialog_music.addEventListener('change', (e) => {
    dialog_music_name.innerText = e.target.files[0].name
})

submit.addEventListener('click', () => {
    music_data[dia_id] = {
        name: dialog_name.value,
        time: dialog_time.value,
        path: dialog_music_name.innerText,
        album: dialog_file.files[0]?.name ?? music_data[dia_id].album,
        songer: dialog_songer.value,
        lrc: dialog_lrc.value
    }
    dia.close()
})

cancel.addEventListener('click', () => {
    dia.close()
})

music.addEventListener('change', (e) => {
    music_name.innerText = e.target.files[0].name
})
//上传歌曲
upload_form.addEventListener("submit", (e) => {
    const formData = new FormData(e.target)
    admin_fetch('/add_song', formData)
})
//编辑歌曲信息
dia_form.addEventListener('submit', (e) => {
    const formData = new FormData(e.target)
    admin_fetch('/update_song_info', formData)
})
//退出登录
login_out.addEventListener('click', () => {
    fetch("/login_out").then(res => res.json()).then((data) => {
        msg.style.color = "white"
        msg.innerText = data.data.msg
        msg.classList.add('show')
        setTimeout(() => {
            msg.classList.remove('show')
            location.href = "/login"
        }, 600)
    })
})
/**
* 发送请求
* @param {string} url 
* @param {*} data 
*/
function admin_fetch(url, data) {
    let config = {
        method: 'POST',
        body: data
    }
    if (url == '/update_song') {
        config.headers = {
            'Content-Type': 'application/json'
        }
    }
    fetch(url, config).then(res => res.json()).then(data => {
        if (data.code != 0) {
            msg.style.color = "red"
        } else {
            msg.style.color = "white"
        }
        msg.innerText = data.data.msg
        msg.classList.add('show')
        main_admin_new()
        setTimeout(() => {
            msg.classList.remove('show')
        }, 600)
    })
}