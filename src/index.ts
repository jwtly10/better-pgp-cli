import { Command } from 'commander'
import figlet from 'figlet'
import fs from 'fs'
import { parse } from 'csv-parse'
const xl = require('excel4node')

const program = new Command()

console.log(figlet.textSync('Better PGP CLI'))

program
    .version('0.0.1')
    .description(
        'Better PGP CLI - A CLI app to bulk decrypt pgp encrypted files and format files in XLS. '
    )
    .option('-f, --file <path-to-file>', 'Choose file')
    .option('-k, --key <path-to-key>', 'Choose PGP key')
    .option('-p, --password <password>', 'Password for PGP key')
    .parse(process.argv)

const options = program.opts()

const data: string[][] = []
async function testFlow(filePath: string) {
    // read csv data

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
            console.log(data)
            // create excel file and add data to multiple worksheets
            var wb = new xl.Workbook()
            // this will be the name of the sql
            var ws = wb.addWorksheet('Example sheet 1')

            console.log('Data length: ', data.length)

            for (let x = 0; x < data.length; x++) {
                for (let y = 0; y < data[x].length; y++) {
                    ws.cell(x + 1, y + 1).string(data[x][y])
                }
            }

            wb.write('result.xlsx')
        })
}

if (options.file) {
    console.log(options.file)
    testFlow(options.file)
}

// async function getFile(filePath: string) {
//   fs.createReadStream(filePath)
//     .pipe(parse({ delimiter: ',', from_line: 1 }))
//     .on('data', function (row) {
//       console.log(row)
//     })
//     .on('error', function (error) {
//       console.log(error.message)
//     })
//     .on('end', function () {
//       console.log('finished')
//     })
//   // try {
//   //   const file = await fs.readFile(filePath, 'utf8')
//   // } catch (err) {
//   //   console.log('Error getting filePath')
//   // }
// }
