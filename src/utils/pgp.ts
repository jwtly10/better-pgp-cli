import * as openpgp from 'openpgp'
import fs from 'fs'
import handleError from './errorHandler'

export default async function decryptFile(
    filePath: string,
    keyPath: string,
    password: string
) {
    try {
        const encryptedFile = fs.readFileSync(filePath)
        const privkey = fs.readFileSync(keyPath)
        const privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0]
        await privKeyObj.decrypt(password)

        const { data: decrypted } = await openpgp.decrypt({
            message: await openpgp.message.read(encryptedFile),
            privateKeys: [privKeyObj],
        })
        return decrypted
    } catch (err: any) {
        handleError(err)
    }
}
