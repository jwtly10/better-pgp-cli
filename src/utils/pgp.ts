import * as openpgp from 'openpgp'
import fs from 'fs'
import path from 'path'

async function decryptFile(file: string, key: string, password: string) {
    try {
        const encryptedFile = fs.readFileSync('../../../../test/' + file)
        // const encryptedFile = fs.readFileSync(path.join(__dirname, file), 'utf8')
        // const privKey = fs.readFileSync(path.join(__dirname, key), 'utf8')
        const privkey = fs.readFileSync('../../../../test/' + key)
        const privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0]
        await privKeyObj.decrypt(password)

        const { data: decrypted } = await openpgp.decrypt({
            message: await openpgp.message.read(encryptedFile),
            privateKeys: [privKeyObj],
        })
        // console.log('Decrypted file in await: ', decrypted)
        return decrypted
    } catch (err) {
        console.log('Error: ', err)
        return err
    }
}

export default { decryptFile }
