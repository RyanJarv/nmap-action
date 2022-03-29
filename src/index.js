const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require("fs");

function getFilename(outputFile){
  const oFileA = outputFile.split('.');
  const filename = oFileA && oFileA.length == 2 ? oFileA[0] : 'nmapvuln';
  return filename;
}

async function run() {
  try {
    const workspace = process.env.GITHUB_WORKSPACE;
    const image = core.getInput('image');
    
    const outputDir = core.getInput('outputDir');
    const outputFile = core.getInput('outputFile');

    const nmapArgs = core.getInput('nmapArgs');

    const path = workspace + '/' + outputDir;

    
    await exec.exec(`mkdir -p ${path}`);
    await exec.exec(`docker pull ${image}`);
    
    const filename = getFilename(outputFile);
    
    console.log('nmapArgs')
    console.log(nmapArgs)

    console.log('Running: docker run --user 0:0 -v ' + path + ':/data --network="host" -t ' + image + ' ' + filename + ' ' + nmapArgs)
    const nmap = (`docker run --user 0:0 -v ${path}:/data --network="host" -t ${image} ${filename} ${nmapArgs}`);

    try {
      await exec.exec(nmap);
    } catch (error) {
      core.setFailed(error.message);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
