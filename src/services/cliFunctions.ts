import fs from 'fs'
import path from 'path'
import csv from '../utils/csv'
import decryptFile from '../utils/pgp'

async function generateMonthlyReport(
    filePath: string,
    keyPath: string,
    password: string,
    outputDir?: string
) {
    console.log("Parsing directory: '", filePath, "'\n")

    outputDir = outputDir ? outputDir : filePath

    if (fs.lstatSync(path.join(filePath)).isFile()) {
        console.log('Dir must be a directory, not a file.')
        return
    }

    var files = await fs.promises.readdir(filePath)

    try {
        if (files.length === 0) {
            console.log('No files found in path: ', filePath)
        } else if (files.length > 20) {
            console.log('Too many files found in path (max 20): ', filePath)
        }

        var processedFiles: number = 0

        for (const fileIn of files) {
            const fileExtension = path.extname(fileIn)
            if (fileExtension !== '.pgp') {
                console.log(
                    'File extension is not .pgp, skipping file: ',
                    fileIn
                )
                continue
            }

            console.log('Processing file: ', fileIn)
            const decrypted = await decryptFile(
                filePath + '/' + fileIn,
                keyPath,
                password
            )

            const res = csv.writeDataToCSV(decrypted, fileIn, outputDir)
            if (res.err) {
                console.log('Error converting file: ', res.err)
            } else {
                console.log('Generated CSV ', res.file, ' from ', fileIn)
                processedFiles++
            }
        }

        await fs.promises.readdir(filePath)
        files = fs.readdirSync(filePath)
        console.log('Successfully processed: ', processedFiles, ' file(s). \n')
        csv.generateXLSX(filePath, files, 'results', outputDir)
    } catch (err) {
        console.log(err)
    }
}

async function generateDecryptedFile(
    filePath: string,
    keyPath: string,
    password: string,
    outputDir?: string
) {
    outputDir = outputDir ? outputDir : filePath
    try {
        if (fs.lstatSync(filePath).isFile()) {
            const fileLoc = path.basename(filePath)
            const filename = path.parse(filePath).name

            if (!fileLoc.includes('csv')) {
                console.log('File type is not CSV.')
                return
            }

            console.log('Decrypting file: ', filePath)
            const decrypted = await decryptFile(filePath, keyPath, password)
            if (!decrypted) {
                console.log('Error decrypting file')
                return
            }

            console.log('Decrypted file: ', filename)

            csv.writeDataToCSV(
                decrypted,
                fileLoc,
                path.dirname(outputDir) + '/',
                filename
            )
        }
    } catch (err) {
        console.log('Error: ', err)
    }
}

export default { generateMonthlyReport, generateDecryptedFile }
