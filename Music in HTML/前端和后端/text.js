import fs from "node:fs"

let data = {
    1: {
        name: 'シカ色デイズ (鹿色days)'
    },
    2: {
        name: 'Unwelcome School',
        time: '02:00',
        path: 'C400000m5mFz14eBqO.m4a',
        album: 'T002R300x300M0000048C4cu1I0uBy_2.webp',
        songer: 'Mitsukiyo',
        lrc: ''
    },
    3: {
        name: 'Make debut!',
    }
}
// 删除指定id
function del(id) {
    let temple = Object.values(data)
    delete data[id]
    temple.forEach((item, index) => {
        data[index + 1] = item
    })
}
del(1)

console.log(data)

//fs.writeFileSync("./data.json", JSON.stringify(data))
