const form = document.querySelector('form')
var form_ele_time = form.elements.time
var form_ele_speed = form.elements.speed
var form_ele_volume = form.elements.volume

form_ele_time.value = localStorage.getItem('time') || 3
form_ele_speed.value = localStorage.getItem('speed') || 1
form_ele_volume.value = localStorage.getItem('volume') || 1

form.addEventListener('input', (e) => {
    e.preventDefault()
    if (form_ele_time.value <= 0) return
    if (form_ele_speed.value <= 0 || form_ele_speed.value > 16) return
    localStorage.setItem('time', form_ele_time.value)
    localStorage.setItem('speed', form_ele_speed.value)
    localStorage.setItem('volume', form_ele_volume.value)
    chrome.storage.local.set({ time: form_ele_time.value, speed: form_ele_speed.value, volume: form_ele_volume.value })
})

document.querySelector('button').addEventListener('dbclick', (e) => {
    e.preventDefault()
    chrome.storage.local.set({ screenshot: Date.now() })
})