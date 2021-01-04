const { spawn } = require('child_process');
const inquirer = require('inquirer');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');
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
  .then(async (res) => {
    const { version } = res;
    if (version) {
      const pkgPath = path.resolve(__dirname, '../package.json');
      const content = JSON.parse(readFileSync(pkgPath, 'utf8'));
      content.version = version;
      const writeContent = prettier.format(JSON.stringify(content), { parser: 'json' });
      writeFileSync(pkgPath, writeContent, 'utf8');
      const queue = ['npm publish', 'git add .', `git commit -m "Publish: ${version}"`, 'git push'];
      for (let index = 0; index < queue.length; index++) {
        const script = queue[index];
        await new Promise((resolve, reject) => {
          const child = spawn(script, {
            shell: true,
            cwd: process.cwd(),
            stdio: ['ignore', process.stdout, process.stderr],
          });
          // child.stdout.pipe(process.stdout);
          // child.stderr.pipe(process.stderr);

          child.on('error', (e) => {
            reject(e);
          });
          child.on('exit', (code) => {
            if (code !== 0) {
              reject();
              console.log(chalk.red(`执行命令: ${script} 失败.`));
            } else {
              console.log(chalk.green(`执行命令: ${script} 成功.`));
              resolve();
            }
          });
        });
      }
    } else {
      console.log(chalk.red('请输入合法的版本号.'));
      process.exit(1);
    }
  })
  .catch((e) => {
    if (e) {
      console.error(e);
    }
  });
