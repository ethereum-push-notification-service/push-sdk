// Load FS and Other dependency
import * as fs from 'fs';
import * as readline from 'readline';

export default async () => {
  /* try {
    // Load environment files
    const envpath = `${__dirname}/../.env`
    const envsamplepath = `${__dirname}/../.env.sample`

    // First check .env if it doesn't exists
    if (!fs.existsSync(envpath)) {
      console.log('     Checking for ENV File... Not Found     ')
    } else {
      console.log('     Checking for ENV File... Found     ')
    }

    // Now Load the environment
    const envData = fs.readFileSync(envpath, 'utf8')
    const envObject = envfile.parse(envData)

    const envSampleData = fs.readFileSync(envsamplepath, 'utf8')
    const envSampleObject = envfile.parse(envSampleData)

    const readIntSampleENV = readline.createInterface({
      input: fs.createReadStream(envsamplepath),
      output: false
    })

    let realENVContents = ''
    console.log('     Verifying ENV File...     ')

    for await (const line of readIntSampleENV) {
      let moddedLine = line

      // Check if line is comment or environment variable
      if (
        moddedLine.startsWith('#') ||
        moddedLine.startsWith('\n') ||
        moddedLine.trim().length == 0
      ) {
        // do nothing, just include it in the line
        // console.log("----");
      } else {
        // This is an environtment variable, first segregate the comment if any and the variable info
        const delimiter = '#'

        const index = moddedLine.indexOf('#')
        const splits =
          index == -1
            ? [moddedLine.slice(0, index), '']
            : [moddedLine.slice(0, index), ' ' + delimiter + moddedLine.slice(index + 1)]

        const envVar = splits[0].split('=')[0] //  Get environment variable by splitting the sample and then taking first seperation
        const comment = splits[1]

        // Check if envVar exists in real env
        // console.log(envObject[`${envVar}`])
        if (!envObject[`${envVar}`] || envObject[`${envVar}`].trim() == '') {
          // env key doesn't exist, throw error
          console.log(`     ${envVar} not found in .env file, please provide value      `)
          process.exit(1)
        } else {
          // Value exists so just replicate
          moddedLine = `${envVar}=${envObject[envVar]}${comment}`
        }
      }

      // finally append the line
      realENVContents = `${realENVContents}\n${moddedLine}`
    }

    console.log('     ENV file verified!     ')

    return null
  } catch (e) {
    console.log('     Error on env verifier loader: %o     ', e)
    throw e
  }*/
};
