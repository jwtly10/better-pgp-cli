import fs from 'fs'
import path from 'path'
import csv from '../utils/csv'
import decryptFile from '../utils/pgp'
import handleError from '../utils/errorHandler'

async function generateMonthlyReport(
    filePath: string,
    keyPath: string,
    password: string,
    outputDir?: string
) {
    console.log("Parsing directory: '", filePath, "'\n")

    outputDir = outputDir ? outputDir : filePath
    outputDir = path.resolve(outputDir)

    try {
        fs.lstatSync(outputDir).isDirectory()
    } catch (err) {
        console.log('Output directory does not exist: ', outputDir)
        return
    }

    if (fs.lstatSync(path.join(filePath)).isFile()) {
        console.log('Dir must be a directory, not a file.')
        return
    }

    var files = await fs.promises.readdir(filePath)

    var processedFiles: number = 0

    try {
        if (files.length === 0) {
            console.log('No files found in path: ', filePath)
        } else if (files.length > 20) {
            console.log('Too many files found in path (max 20): ', filePath)
        }

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
                path.join(filePath, fileIn),
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
        files = fs.readdirSync(outputDir)
        console.log('Successfully processed: ', processedFiles, ' file(s). \n')
        const res = csv.generateXLSX(outputDir, files, 'results', outputDir)
        if (res.err) {
            console.log('Error generating XLSX: ', res.err)
            return
        }

        //@ts-ignore
    } catch (err) {
        handleError(err)
    }
}

async function generateDecryptedFile(
    filePath: string,
    keyPath: string,
    password: string,
    outputFileName?: string,
    outputDir?: string
) {
    outputDir = outputDir
        ? outputDir
        : path.dirname(path.resolve(filePath)) + '/'

    // Checks here ensure that the output file has .csv whether given or not
    outputFileName = outputFileName
        ? outputFileName.includes('.csv')
            ? outputFileName
            : outputFileName + '.csv'
        : path.parse(filePath).name.includes('.csv')
        ? path.parse(filePath).name
        : path.parse(filePath).name + '.csv'

    try {
        if (fs.lstatSync(filePath).isFile()) {
            const fullFileName = path.basename(filePath)
            const decryptedData = await decryptFile(filePath, keyPath, password)
            if (!decryptedData) {
                console.log('Error decrypting file')
                return
            }

            console.log('Decrypted file: ', fullFileName)

            const res = csv.writeDataToCSV(
                decryptedData,
                fullFileName,
                outputDir,
                outputFileName
            )

            if (res.err) {
                console.log('Error converting file: ', res.err)
            }

            console.log('Generated CSV ', res.file, ' from ', fullFileName)
        } else {
            console.log('File not found: ', filePath)
        }
    } catch (err: any) {
        handleError(err)
    }
}

export default { generateMonthlyReport, generateDecryptedFile }
