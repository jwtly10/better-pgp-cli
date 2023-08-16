import fs from 'fs'
const xl = require('excel4node')
import { parse } from 'csv-parse'

function writeToCSV(
    decryptedFile: string,
    file: string,
    outputDir: string
): boolean {
    // get the first item of the decrypted file, comma separated
    const filename = decryptedFile.split(',')[0]
    try {
        const writableStream = fs.createWriteStream(
            outputDir + filename + '.csv'
        )
        console.log(
            'Successfully converted decrypted file ',
            file,
            ' to ',
            filename + '.csv'
        )
        return writableStream.write(decryptedFile)
    } catch (err) {
        console.log('Error converting decrypted file to CSV: ', err)
        return false
    }
}

function writeToXLSX(filePath: string, outputDir: string, wb: any) {
    var data: string[][] = []
    fs.createReadStream(filePath)
        .pipe(parse({ delimiter: ',', from_line: 1 }))
        .on('data', function (row) {
            data.push(row)
        })
        .on('error', function (error) {
            console.log(error.message)
        })
        .on('end', function () {
            console.log('finished')
            var wb = new xl.Workbook()
            var ws = wb.addWorksheet(data[0][0])

            for (let x = 0; x < data.length; x++) {
                for (let y = 0; y < data[x].length; y++) {
                    ws.cell(x + 1, y + 1).string(data[x][y])
                }
            }

            wb.write(outputDir + 'result.xlsx')
        })
}

export default { writeToCSV, writeToXLSX }
