import fs from 'fs'
import path from 'path'
const xl = require('excel4node')
import { parse } from 'csv-parse'

type writeResponse = {
    err?: string
    file?: string
}

function writeDataToCSV(
    decryptedData: string,
    origFileName: string,
    outputDir: string,
    newFileName?: string
): writeResponse {
    // For some reports, files are in this specific format so ok to read first row for filename
    const fileName = newFileName
        ? newFileName
        : decryptedData.split(',')[0] + '.csv'

    try {
        const writableStream = fs.createWriteStream(outputDir + fileName)
        if (writableStream.write(decryptedData)) {
            return { file: fileName }
        }
        return { err: 'Error writing to file' }
    } catch (err: any) {
        // console.log('Error converting decrypted file to CSV: ', err)
        return { err: err.message }
    }
}

function writeCSVToXLSX(
    filePath: string,
    outputDir: string,
    outputFileName: string,
    workBook: any,
    sheetName?: string
) {
    console.log('Writing file to XLSX: ', filePath)
    let data: string[][] = []
    try {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.log('File does not exist: ', filePath)
                return
            }

            fs.createReadStream(filePath)
                .pipe(parse({ delimiter: ',', from_line: 1 }))
                .on('data', function (row: any) {
                    data.push(row)
                })
                .on('error', function (error: any) {
                    console.log('Error reading CSV: ', error)
                })
                .on('end', function () {
                    // this is allowed for monthly reporting flows
                    sheetName = sheetName ? sheetName : data[0][0]
                    let ws = workBook.addWorksheet(sheetName)

                    for (let x = 0; x < data.length; x++) {
                        for (let y = 0; y < data[x].length; y++) {
                            ws.cell(x + 1, y + 1).string(data[x][y])
                        }
                    }

                    workBook.write(outputDir + outputFileName + '.xlsx')
                })
        })
    } catch (err) {
        console.log('Error writing CSV to XLSX: ', err)
    }
}

function generateXLSX(
    filePath: string,
    fileNamesIn: string[],
    outputFile: string,
    outputDir: string
): writeResponse {
    try {
        const wb = new xl.Workbook()
        for (const fileIn of fileNamesIn) {
            const fileExtension = path.extname(fileIn)
            if (fileExtension == '.csv') {
                writeCSVToXLSX(filePath + fileIn, outputDir, outputFile, wb)
            }
        }

        return { file: outputFile + '.xlsx' }
    } catch (err: any) {
        return { err: err.message }
    }
}

export default { writeDataToCSV, generateXLSX }
