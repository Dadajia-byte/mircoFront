const axios = require('axios');
const { createSpinner } = require('nanospinner'); // 创建一个加载动画
const git = require('git-promise'); // 用于执行git命令
const fs = require('fs-extra'); // 用于文件操作
const path = require('path'); // 用于处理路径

const TEMPLATE_DIR = path.resolve(__dirname, '../template');

class Init {
  templates = {};
  async setup(options) {
    if (typeof options.template === 'string') {
      const templates = await this.checkTemplate(options.template);
      if (templates) {
        this.templates = templates;
      }
    }
    await this.selectTemplate();
  }

  async checkTemplate(url) {
    const res = await axios.get(url);
    return res.data;
  }

  async selectTemplate() {
    const inquirer = (await import('inquirer')).default;
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '请输入项目名称',
        default: function() {
          return 'zmp-project';
        }
      },
      {
        type: 'list',
        name: 'template',
        message: '请选择项目模板',
        choices: Object.keys(this.templates),
      }
    ]);
    const gitRepo = this.templates[answers.template];
    await this.downloadRepo(gitRepo, answers.name);
  }

  async downloadRepo(repoPath, localPath) {
    const spinner = createSpinner('下载模板中...').start();
    await git(`clone ${repoPath} ./${localPath}`);
    spinner.success({ text: `cd ${localPath} & npm install & npm run dev` });
  }
}

module.exports = new Init();