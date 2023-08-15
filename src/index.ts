import { Command } from 'commander'
import figlet from 'figlet'
import fs from 'fs'
import path from 'path'
import promptly from 'promptly'
import { parse } from 'csv-parse'
import pgp from './utils/pgp'
const xl = require('excel4node')

const program = new Command()

console.log(figlet.textSync('Better PGP CLI'))

program
    .version('0.0.1')
    .description(
        'Better PGP CLI - A CLI app to bulk decrypt pgp encrypted files and format files in XLS. '
    )
    .option('-m, --mode <mode>', "Available Modes: 'mr' - (Monthly Reporting)")
    .option('-d, --dir <directory>', 'Path to directory containing files')
    .option('-k, --key <filename>', 'Name of private key in dir')
    .parse(process.argv)

const options = program.opts()

async function generateMonthlyReport(
    filePath: string,
    keyPath: string,
    password: string
) {
    // Iterate through path to find pgp files to process.
    console.log("Parsing directory: '", filePath, "'")
    try {
        const files: string[] = await fs.promises.readdir(filePath)
        if (files.length === 0) {
            console.log('No files found in path: ', filePath)
            return
        } else if (files.length > 20) {
            console.log('Too many files found in path (max 20): ', filePath)
            return
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const fileExtension = path.extname(file)
            if (fileExtension !== '.pgp') {
                console.log('File extension is not .pgp, skipping file: ', file)
                continue
            }
            console.log('Processing file: ', file)
            // Decrypt file
            await pgp.decryptFile(file, keyPath, password)
            // what is the type of this file

            // Write decrypted file to XLSX
        }
    } catch (err) {
        console.log('Error: ', err)
    }
    // If folder has too many records, return an error

    // Else read through the files and process them
    // 1. Decrypt the files -- throw error if decryption fails
    // 2. Write the decrypted files to individual sheets in workbook
}

// async function testFlow(filePath: string) {
//     fs.createReadStream(filePath)
//         .pipe(parse({ delimiter: ',', from_line: 1 }))
//         .on('data', function (row) {
//             data.push(row)
//         })
//         .on('error', function (error) {
//             console.log(error.message)
//         })
//         .on('end', function () {
//             console.log('finished')
//             console.log(data)
//             // create excel file and add data to multiple worksheets
//             var wb = new xl.Workbook()
//             // this will be the name of the sql
//             var ws = wb.addWorksheet('Example sheet 1')

//             console.log('Data length: ', data.length)

//             for (let x = 0; x < data.length; x++) {
//                 for (let y = 0; y < data[x].length; y++) {
//                     ws.cell(x + 1, y + 1).string(data[x][y])
//                 }
//             }

//             wb.write('result.xlsx')
//         })
// }

// Handle arguments
if (process.argv.length === 0) {
    console.log('No arguments provided.')
    program.help()
}

if (!options.mode) {
    console.log('No mode specified.')
    program.help()
}

if (options.mode === 'mr' && options.dir && options.key) {
    console.log('Generating Monthly Reporting XLSX')
    ;(async () => {
        const password = await promptly.password('Passphrase for key: ', {
            replace: '*',
        })
        await generateMonthlyReport(options.dir, options.key, password)
    })()
}
