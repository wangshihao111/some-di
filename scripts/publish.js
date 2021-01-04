const { spawn } = require('child_process');
const inquirer = require('inquirer');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');
const prettier = require('prettier');
const chalk = require('chalk');
const commander = require('commander');

console.log(chalk.blueBright('Current version:'), require('../package.json').version);

commander.option('--dist-tag <distTag>').action((command) => {
  const { distTag = 'latest' } = command;
  runCommand(distTag);
});

commander.parse(process.argv);

function runCommand(tag = 'latest') {
  inquirer
    .prompt([
      {
        type: 'text',
        message: 'Please enter version: ',
        name: 'version',
      },
    ])
    .then(async (res) => {
      const { version } = res;
      if (version) {
        const pkgPath = path.resolve(__dirname, '../package.json');
        const content = JSON.parse(readFileSync(pkgPath, 'utf8'));
        content.version = version;
        const writeContent = prettier.format(JSON.stringify(content), { parser: 'json' });
        writeFileSync(pkgPath, writeContent, 'utf8');
        const queue = [
          `npm publish --tag ${tag}`,
          'git add .',
          `git commit -m "Publish: ${version}"`,
          'git push',
          `git tag v${version}`,
          'git push --tags',
        ];
        for (let index = 0; index < queue.length; index++) {
          const script = queue[index];
          await new Promise((resolve, reject) => {
            const child = spawn(script, {
              shell: true,
              cwd: process.cwd(),
              stdio: ['ignore', process.stdout, process.stderr],
            });
            child.on('error', (e) => {
              reject(e);
            });
            child.on('exit', (code) => {
              if (code !== 0) {
                reject();
                console.log(chalk.red(`Run command: ${script} failed.`));
              } else {
                console.log(chalk.green(`Run command: ${script} successfully.`));
                resolve();
              }
            });
          });
        }
      } else {
        console.log(chalk.red('Please enter a legal version number.'));
        process.exit(1);
      }
    })
    .catch((e) => {
      if (e) {
        console.error(e);
      }
      process.exit(1);
    });
}
