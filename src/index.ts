import { Command } from 'commander'
const xl = require('excel4node')
import figlet from 'figlet'
import fs from 'fs'
import path from 'path'
import promptly from 'promptly'
import pgp from './utils/pgp'
import csv from './utils/csv'

const program = new Command()

console.log(figlet.textSync('Better PGP CLI'))

program
    .version('0.0.1')
    .description(
        'Better PGP CLI - A CLI app to bulk decrypt pgp encrypted files and format files in XLS. \n' +
            'Modes Explained: \n' +
            'MR: \n' +
            'To use this tool, you must create a folder containing preferably only csv.pgp ' +
            'files. This tool will decrypt all pgp files, create decrypted CSVs ' +
            'and format them in an excel.'
    )
    .option('-m, --mode <mode>', "Available Modes: 'mr' - (Monthly Reporting)")
    .option('-d, --dir <directory>', 'Path to directory containing files')
    .option('-k, --key <path/key>', 'Path to private key')
    .option(
        '-o, --output <directory>',
        'Path to output directory, default is -d directory'
    )
    .parse(process.argv)

const options = program.opts()

async function generateMonthlyReport(
    filePath: string,
    keyPath: string,
    password: string,
    outputDir: string = filePath
) {
    console.log("Parsing directory: '", filePath, "'")

    const files: string[] = await fs.promises.readdir(filePath)
    try {
        if (files.length === 0) {
            console.log('No files found in path: ', filePath)
            return
        } else if (files.length > 20) {
            console.log('Too many files found in path (max 20): ', filePath)
            return
        }

        var processedFiles: number = 0
        files.forEach(async (file) => {
            const fileExtension = path.extname(file)
            if (fileExtension !== '.pgp') {
                console.log('File extension is not .pgp, skipping file: ', file)
            } else {
                console.log('Processing file: ', file)
                processedFiles++
                await processFile(file, filePath, keyPath, password, outputDir)
            }
        })
        console.log('Processed ', processedFiles, ' file(s). \n')
    } catch (err) {
        console.log('Error: ', err)
    }

    try {
        const wb = new xl.Workbook()
        files.forEach(async (file) => {
            const fileExtension = path.extname(file)
            if (fileExtension == '.csv') {
                console.log('Writing file: ', file)
                csv.writeToXLSX(filePath + file, outputDir, wb)
            } else {
            }
        })
    } catch (err) {
        console.log('Error: ', err)
        return
    }
}

async function processFile(
    file: string,
    filePath: string,
    keyPath: string,
    password: string,
    outputDir: string
) {
    const decryptedFile = await pgp.decryptFile(
        file,
        filePath,
        keyPath,
        password
    )
    // Write this decrypted file to csv
    csv.writeToCSV(decryptedFile, file, outputDir)
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
} else {
    console.log('Invalid arguments provided.')
    program.help()
}
