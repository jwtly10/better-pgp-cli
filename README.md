### Better-PGP-Cli


`better-pgp-cli` is a CLI tool that allows PGP encrypted CSV manipulation.

![image](https://github.com/jwtly10/better-pgp-cli/assets/39057715/66f96abc-83f2-488e-ac81-a88286b60495)


## Usage

### Install:

    npm install better-pgp-cli

### Example:
 
    // Decrypting a single file and changing output folder

    pgp -m df -f ~/Desktop/PrivateData.csv.pgp -k ~/private/keys/privatekey.asc -o ~/OneDrive/DecryptedFiles/
    
    // A new file ~/OneDrive/DecryptedFiles/PrivateData.csv will be generated.


### Arguments

    -m, --mode <mode>
        Options:
        mr - Monthly Report Job
        df - Decrypt CSV File
        dd - Decrypt CSV in Directory'
        
Modes allow running predefined jobs  
        
        
    -d, --dir <path> Path to directory to decrypt files. If none chosen will use current dir.
    -f, --file <path> Path to file to decrypt
    -r, --name <path> Rename output file
    -k, --key <path> Path to private key
    -o, --output <path> Path to output directory


