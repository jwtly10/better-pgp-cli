export default function handleErrors(err: any) {
    if (err.code === 'ENOENT') {
        console.log('File not found: ', err.path)
    } else {
        console.log('Error: ', err.message)
    }

    // debug
    // console.log(err)
}
