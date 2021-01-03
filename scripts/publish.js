const { spawnSync } = require('child_process');
const inquirer = require('inquirer');
const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const prettier = require('prettier');
const chalk = require('chalk');

console.log(chalk.blueBright('当前版本：'), require('../package.json').version);

inquirer
  .prompt([
    {
      type: 'text',
      message: '请输入版本号',
      name: 'version',
    },
  ])
  .then((res) => {
    const { version } = res;
    if (version) {
      const pkgPath = resolve(__dirname, '../package.json');
      const content = JSON.parse(readFileSync(pkgPath, 'utf8'));
      content.version = version;
      const writeContent = prettier.format(JSON.stringify(content), { parser: 'json' });
      writeFileSync(pkgPath, writeContent, 'utf8');
      const queue = [
        'npm publish',
        'git add .',
        `git commit -m "Publish: ${version}"`,
        'git push',
      ];
      queue.forEach((script) => {
        spawnSync(script, {shell: true, cwd: process.cwd()});
      });
    } else {
      console.log(chalk.red('请输入合法的版本号.'));
      process.exit(1);
    }
  })
  .catch((e) => console.log(e));
