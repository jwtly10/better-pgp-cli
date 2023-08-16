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

export default { generateMonthlyReport }
