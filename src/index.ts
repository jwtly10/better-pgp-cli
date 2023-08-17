import { Command } from 'commander'
const xl = require('excel4node')
import figlet from 'figlet'
import promptly from 'promptly'
import cli from './services/cliFunctions'

const program = new Command()

// console.log(figlet.textSync('Better PGP CLI'))

program
    .version('0.0.1')
    .description(
        'Better PGP CLI - A CLI app to bulk decrypt pgp encrypted files and format files in XLS.'
    )
    .option('-m, --mode <mode>', 'mf, df, dd')
    .option('-d, --dir <path>', 'Path to directory/file to decrypt')
    .option('-k, --key <path/key>', 'Path to private key')
    .option('-o, --output <path>', 'Path to output directory')
    .parse(process.argv)

const options = program.opts()

// Handle arguments
if (process.argv.length === 0) {
    console.log('No arguments provided.')
    program.help()
}

switch (options.mode) {
    case 'df':
        if (options.dir && options.key) {
            ;(async () => {
                const password = await promptly.password(
                    'Passphrase for key: ',
                    {
                        replace: '*',
                    }
                )
                await cli.generateDecryptedFile(
                    options.dir,
                    options.key,
                    password
                )
            })()
        } else {
            console.log('Invalid arguments provided.')
            program.help()
        }
        break
    case 'mr':
        if (options.mode === 'mr' && options.dir && options.key) {
            console.log('Generating Monthly Reporting XLSX')
            ;(async () => {
                const password = await promptly.password(
                    'Passphrase for key: ',
                    {
                        replace: '*',
                    }
                )
                await cli.generateMonthlyReport(
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
        break
    default:
        console.log('No mode specified.')
        program.help()
        break
}
