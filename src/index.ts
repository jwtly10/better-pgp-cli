import { Command } from 'commander'
const xl = require('excel4node')
import figlet from 'figlet'
import fs from 'fs'
import path from 'path'
import promptly from 'promptly'
import decryptFile from './utils/pgp'
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
    .option('-o, --output <path>', 'Path to output directory')

    .parse(process.argv)

const options = program.opts()

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
        await generateMonthlyReport(
            options.dir,
            options.key,
            password,
            options.output
        )
    })()
} else {
    console.log('Invalid arguments provided.')
    program.help()
}
