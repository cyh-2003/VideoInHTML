var time
var bool = true
var videos = new WeakSet()
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            // 跳过非元素节点（如文本节点）
            if (node.nodeType !== Node.ELEMENT_NODE) return

            // 检查节点本身是否是 <video> 或 <iframe>
            if (node.nodeName === 'video') {
                alert(node.nodeType)
                setupVideoControls(node) // 假设有控制逻辑
            } else if (node.nodeName === 'iframe') {
                watchIframe(node) // 监控 iframe 内部
            }

            //检查节点内部的 <video> 和 <iframe>
            node.querySelectorAll('video').forEach(video => {
                bool = false
                setupVideoControls(video)
            })

            node.querySelectorAll('iframe').forEach(iframe => {
                watchIframe(iframe)
            })


            // 延迟 1s 再次检查,适用于南极洲公司
            setTimeout(() => {
                if (bool) {
                    document.querySelectorAll('video').forEach(video => {
                        setupVideoControls(video)
                    })
                }
            }, 1000)
        })
    })
})

// 监控 iframe 内部的 video
function watchIframe(iframe) {
    try {
        // 避免跨域错误
        if (!iframe.contentDocument) {
            iframe.addEventListener('load', () => {
                try {
                    iframe.contentDocument.querySelectorAll('video').forEach(video => {
                        setupVideoControls(video)
                    })
                } catch (e) {
                    console.warn('无法访问 iframe 内容（跨域限制）:', e)
                }
            })
            return
        }

        // 直接访问已加载的 iframe
        iframe.contentDocument.querySelectorAll('video').forEach(video => {
            setupVideoControls(video)
        })

        // 监听 iframe 内部的动态变化
        const iframeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.nodeName === 'VIDEO') {
                            setupVideoControls(node)
                        }
                        node.querySelectorAll?.('video').forEach(setupVideoControls)
                    }
                })
            })
        })

        iframeObserver.observe(iframe.contentDocument.documentElement, {
            childList: true,
            subtree: true
        })
    } catch (e) {
        console.warn('无法访问 iframe 内容（跨域限制）:', e)
    }
}

// 初始化
observer.observe(document.documentElement, {
    childList: true,
    subtree: true
})

// 设置 video 控制逻辑
function setupVideoControls(video) {
    if (videos.has(video)) return
    videos.add(video)
    chrome.storage.onChanged.addListener((data) => {
        if (data.time) time = Number(data.time.newValue)
        if (data.speed) video.playbackRate = Number(data.speed.newValue)
        if (data.volume) video.volume = Number(data.volume.newValue)
        if (data.back) video.currentTime -= time
        if (data.forward) video.currentTime += time
        if (data.pause) video.paused ? video.play() : video.pause()
        if (data.screenshot) debounce(getScreenShot(video), 250)()
    })

    video.onloadeddata = () => {
        chrome.storage.local.get(['speed', 'time', 'volume'], (data) => {
            video.playbackRate = Number(data.speed) || 1
            time = Number(data.time) || 3
            video.volume = Number(data.volume) || 1
        })
    }
}

// 从视频中截图
function getScreenShot(video) {
    if (videos.has(video)) {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = 'video.png'
            a.click()
        }, 'image/png')
    }
}

window.addEventListener('beforeunload', () => {
    videos = null
})

function debounce(func, delay) {
    let timer
    return function () {
        let context = this
        let args = arguments
        clearTimeout(timer)
        timer = setTimeout(() => {
            func.apply(context, args)
        }, delay)
    }
}