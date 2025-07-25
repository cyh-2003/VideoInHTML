chrome.commands.onCommand.addListener((command) => {
    switch (command) {
        case "back":
             chrome.storage.local.set({ back: Date.now() })
            break;
        case "forward":
             chrome.storage.local.set({ forward: Date.now() })
            break;
        case "pause":
             chrome.storage.local.set({ pause: Date.now() })
            break
    }
})
