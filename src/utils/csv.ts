import fs from 'fs'
import path from 'path'
const xl = require('excel4node')
import { parse } from 'csv-parse'

function writeToCSV(
    decryptedFile: string,
    file: string,
    outputDir: string,
    fileName?: string
): string {
    const filename = fileName ? fileName : decryptedFile.split(',')[0]
    try {
        if (filename.includes('csv')) {
            const writableStream = fs.createWriteStream(outputDir + filename)
            if (writableStream.write(decryptedFile)) {
                console.log(
                    'Successfully converted encrypted file ',
                    file,
                    ' to ',
                    filename
                )
                return filename
            }
        }

        const writableStream = fs.createWriteStream(
            outputDir + filename + '.csv'
        )
        if (writableStream.write(decryptedFile)) {
            console.log(
                'Successfully converted encrypted file ',
                file,
                ' to ',
                filename + '.csv'
            )
            return filename + '.csv'
        }
        return ''
    } catch (err) {
        console.log('Error converting decrypted file to CSV: ', err)
        return ''
    }
}

function writeAnonCSVToXLSX(filePath: string, outputDir: string, wb: any) {
    let data: string[][] = []
    fs.createReadStream(filePath)
        .pipe(parse({ delimiter: ',', from_line: 1 }))
        .on('data', function (row) {
            data.push(row)
        })
        .on('error', function (error) {
            console.log(error.message)
        })
        .on('end', function () {
            let ws = wb.addWorksheet(data[0][0])

            for (let x = 0; x < data.length; x++) {
                for (let y = 0; y < data[x].length; y++) {
                    ws.cell(x + 1, y + 1).string(data[x][y])
                }
            }

            wb.write(outputDir + 'result.xlsx')
        })
}

function generateXLSX(filePath: string, files: string[], outputDir: string) {
    try {
        const wb = new xl.Workbook()
        for (const file of files) {
            const fileExtension = path.extname(file)
            if (fileExtension == '.csv') {
                console.log('Writing file: ', file)
                writeAnonCSVToXLSX(filePath + file, outputDir, wb)
            } else {
            }
        }
    } catch (err) {
        console.log('Error: ', err)
        return
    }
}

export default { writeToCSV, generateXLSX }
