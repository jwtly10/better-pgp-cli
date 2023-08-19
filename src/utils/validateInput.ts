import path from 'path'
function args(
    mode: string,
    dir: string,
    file: string,
    key: string,
    outputDir: string
): boolean {
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

    if (outputDir) {
        console.log('Output directory: ', path.resolve(outputDir))
    }
    if (mode == 'dd' && !file) {
        console.log('No file provided.')
        return false
    }

    return true
}

export default { args }
