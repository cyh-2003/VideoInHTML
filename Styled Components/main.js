function generateString(fragment, ...args) {
    const insets = Array.prototype.slice.call(args, 1)
    let result = ''
    for (let i = 0; i < fragment.length; i++) {
        result += fragment[i]
        if (i < fragment.length - 1) {
            result += insets[i]
        }
    }
    return result
}

HTMLElement.prototype.styles = function () {
    const styles = generateString(arguments)
    let curStyle = this.getAttribute('style')
    if (curStyle) {
        curStyle += styles
    } else {
        curStyle = styles
    }
    this.setAttribute('style', curStyle)
    return this
}

HTMLElement.prototype.props = function () {
    const propString = generateString(arguments).split('\n')
    if (!propString.at(-1)) {
        propString.pop()
    }
    propString.map((it) => {
        const parts = it.trim().split(':')
        const key = parts[0].trim()
        let value = parts.slice(1).join(':').trim()
        if (value.indexOf(';') === value.length - 1) {
            value = value.substring(0, value.length - 1)
        }
        return [key, value]
    }).forEach(([key, value]) => {
        if (!key) return
        this[key] = value
    })
    return this
}

HTMLElement.prototype.content = function () {
    this.textContent = generateString(arguments)
    return this
}

HTMLElement.prototype.class = function () {
    let classList = generateString(arguments).split(' ')
    for (let i = 0; i < classList.length; i++) {
        this.classList.add(classList[i])
    }
    return this
}