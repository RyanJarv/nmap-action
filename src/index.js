const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require("fs");
const util = require('util');

const copyFile = util.promisify(fs.copyFile);

async function run(nmapArgs, image, workspace) {
    const path = '/tmp/output'
    
    await exec.exec(`mkdir -p ${path}`);
    await exec.exec(`docker pull ${image}`);
    
    var files = fs.readdirSync(workspace);
    console.log('List of workspace files: ')
    try {
        files.forEach((f) => {
            console.log(workspace + '/' + f)
        })
    } catch (error) {
        core.setFailed(error.message);
    }
    
    var nmap = ''
    try {
      if (fs.existsSync(workspace+'/hosts.txt')) {
          console.log("Found hosts.txt file.")
          await copyFile(workspace+'/hosts.txt', path+'/hosts.txt')
          nmap = (`docker run --user 0:0 -v ${path}:/data --network="host" -t ${image} scan -iL /data/hosts.txt ${nmapArgs}`);
      } else {
          console.log("Did not find hosts.txt file.")
          nmap = (`docker run --user 0:0 -v ${path}:/data --network="host" -t ${image} scan ${nmapArgs}`);
      }
    } catch(err) {
      console.error(err)
    }
    console.log('Running: ' + nmap)

    try {
      await exec.exec(nmap);
    } catch (error) {
      core.setFailed(error.message);
    }

    files = fs.readdirSync(path);

    console.log('List of output files: ')
    files.forEach((f) => {
        console.log(path + '/' + f)
    })
}

async function main() {
  var files = fs.readdirSync('.');
  console.log('cwd: ')
  try {
      files.forEach((f) => {
          console.log('./' + f)
      })
  } catch (error) {
      core.setFailed(error.message);
  }

  try {
    const outputDir = core.getInput('outputDir');
    const outputFile = core.getInput('outputFile');
    const nmapArgs = core.getInput('nmapArgs');
    const image = core.getInput('image');
    const workspace = process.env.GITHUB_WORKSPACE;

    
    await run(nmapArgs, image, workspace, outputDir, outputFile)

  } catch (error) {
    core.setFailed(error.message);
  }
}

main();

module.exports = run;
