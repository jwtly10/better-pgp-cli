import { Command } from 'commander'
import figlet from 'figlet'

const program = new Command()

console.log(figlet.textSync('Better PGP CLI'))

program
  .version('0.0.1')
  .description(
    'Better PGP CLI - A CLI app to bulk decrypt pgp encrypted files and format files in XLS. ',
  )
  .option('-f, --file <path-to-file>', 'Choose file')
  .option('-k, --key <path-to-key>', 'Choose PGP key')
  .option('-p, --password <password>', 'Password for PGP key')
  .parse(process.argv)

const options = program.opts()
