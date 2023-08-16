import * as openpgp from 'openpgp'
import fs from 'fs'

export default async function decryptFile(
    filePath: string,
    keyPath: string,
    password: string,
    file: string = ''
): Promise<string> {
    try {
        const encryptedFile = fs.readFileSync(filePath + file)
        const privkey = fs.readFileSync(keyPath)
        const privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0]
        await privKeyObj.decrypt(password)

        const { data: decrypted } = await openpgp.decrypt({
            message: await openpgp.message.read(encryptedFile),
            privateKeys: [privKeyObj],
        })
        return decrypted
    } catch (err) {
        console.log('Error: ', err)
        return 'Error'
    }
}
