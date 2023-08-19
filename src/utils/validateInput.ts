function args(mode: string, dir: string, file: string, key: string): boolean {
    if (!mode && !dir && !key) {
        console.log('No arguments provided.')
        return false
    }

    if (!mode) {
        console.log('No Mode provided.')
        return false
    }

    if (!key) {
        console.log('No private key provided.')
        return false
    }

    if (mode !== 'dd' && !file) {
        console.log('No file provided.')
        return false
    }

    if (!dir) {
        console.log(
            'Using Current Directory if no path specified: ',
            process.cwd()
        )
    }

    return true
}

export default { args }
