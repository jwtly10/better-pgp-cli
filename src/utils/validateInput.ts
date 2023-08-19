function args(mode: string, dir: string, key: string): boolean {
    if (!mode && !dir && !key) {
        console.log('No arguments provided.')
        return false
    }

    if (!mode) {
        console.log('No Mode provided.')
        return false
    }

    if (!dir) {
        console.log('Using Current Directory: ', process.cwd())
        return true
    }

    if (!key) {
        console.log('No private key provided.')
        return false
    }

    return true
}

export default { args }
