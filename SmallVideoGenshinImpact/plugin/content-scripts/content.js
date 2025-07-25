var videos = document.querySelectorAll('video')
var time
if (videos){
    videos.forEach(video => {
        chrome.storage.onChanged.addListener((data)=>{
            if (data.time) time = Number(data.time.newValue)
            if (data.speed) video.playbackRate = Number(data.speed.newValue)
            if (data.back) video.currentTime -= time
            if (data.forward) video.currentTime += time
            if (data.pause) video.paused ? video.play() : video.pause()
        })

        video.onloadeddata = ()=> {
            chrome.storage.local.get(['speed', 'time'], (data) => {
                video.playbackRate = Number(data.speed) || 1
                time = Number(data.time) || 3
            })
        }
    })
}
