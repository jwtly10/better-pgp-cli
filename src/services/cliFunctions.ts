import fs from 'fs'
import path from 'path'
import csv from '../utils/csv'
import decryptFile from '../utils/pgp'

async function generateMonthlyReport(
    filePath: string,
    keyPath: string,
    password: string,
    outputDir: string = filePath
) {
    console.log("Parsing directory: '", filePath, "'\n")

    var files = await fs.promises.readdir(filePath)
    try {
        if (files.length === 0) {
            console.log('No files found in path: ', filePath)
        } else if (files.length > 20) {
            console.log('Too many files found in path (max 20): ', filePath)
        }

        var processedFiles: number = 0

        for (const file of files) {
            const fileExtension = path.extname(file)
            if (fileExtension !== '.pgp') {
                console.log('File extension is not .pgp, skipping file: ', file)
                continue
            }

            console.log('Processing file: ', file)
            processedFiles++
            const decrypted = await decryptFile(
                file,
                filePath,
                keyPath,
                password
            )

            csv.writeToCSV(decrypted, file, outputDir)
        }

        await fs.promises.readdir(filePath)
        files = fs.readdirSync(filePath)
        console.log('Processed ', processedFiles, ' file(s). \n')
        csv.generateXLSX(filePath, files, outputDir)
        console.log('\nXLSX File generated')
    } catch (err) {
        console.log('Error: ', err)
    }
    return
}

async function generateDecryptedFile(
    filePath: string,
    keyPath: string,
    password: string,
    outputDir: string = filePath
) {
    try {
        if (fs.lstatSync(filePath).isFile()) {
            const file = path.basename(filePath)
            const filename = path.parse(filePath).name
            if (!file.includes('csv')) {
                console.log('File type is not CSV.')
                return
            }
            console.log('Decrypting file: ', filePath)
            const decrypted = await decryptFile(filePath, keyPath, password)
            console.log('Decrypted file: ', filename)
            csv.writeToCSV(decrypted, file, outputDir, filename)
            return decrypted
        }
    } catch (err) {
        console.log('Error: ', err)
    }
}

export default { generateMonthlyReport, generateDecryptedFile }
