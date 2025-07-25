const form = document.querySelector('form')
var form_ele_time = form.elements.time
var form_ele_speed = form.elements.speed

form_ele_time.value = localStorage.getItem('time') || 3
form_ele_speed.value = localStorage.getItem('speed') || 1

form.addEventListener('input', (e) => {
    e.preventDefault()
    if (form_ele_time.value <= 0){
        form_ele_time.value = 3
    }
    if (form_ele_speed.value <= 0 || form_ele_speed.value > 16){
        form_ele_speed.value = 1
    }
    localStorage.setItem('time', form_ele_time.value)
    localStorage.setItem('speed', form_ele_speed.value)
    chrome.storage.local.set({time:form_ele_time.value, speed: form_ele_speed.value})
})
