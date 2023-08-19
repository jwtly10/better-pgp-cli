#!/usr/bin/env node
import { Command } from 'commander'
const xl = require('excel4node')
import figlet from 'figlet'
import promptly from 'promptly'
import cli from './services/cliFunctions'
import validate from './utils/validateInput'

const program = new Command()

console.log(figlet.textSync('PGP Job CLI'))

program
    .version('1.0.2')
    .description(
        'PGP Job CLI - A CLI app to decrypt CSV files using PGP and perform automated tasks.'
    )
    .option(
        '-m, --mode <mode>',
        'mr - Monthly Report Job, df - Decrypt CSV File, dd - Decrypt CSV in Directory'
    )
    .option(
        '-d, --dir <path>',
        'Path to directory to decrypt files. If none chosen will use current dir.'
    )
    .option('-f, --file <path>', 'Path to file to decrypt')
    .option('-r, --name <path>', 'Rename output file')
    .option('-k, --key <path>', 'Path to private key')
    .option('-o, --output <path>', 'Path to output directory')
    .parse(process.argv)

const options = program.opts()

// Handle arguments
if (
    !validate.args(
        options.mode,
        options.dir,
        options.file,
        options.key,
        options.output
    )
) {
    program.help()
}

var password = ''

;(async () => {
    password = await promptly.password('Passphrase for key (if required): ', {
        replace: '*',
    })

    switch (options.mode) {
        case 'df':
            await cli.generateDecryptedFile(
                options.file,
                options.key,
                password,
                options.name,
                options.output
            )
            break
        case 'mr':
            await cli.generateMonthlyReport(
                options.dir ? options.dir : process.cwd() + '/',
                options.key,
                password,
                options.output
            )
            break
    }
})()
