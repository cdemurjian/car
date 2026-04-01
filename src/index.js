#!/usr/bin/env node
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { runClaudePicker } from './claude.js';

const { tool } = await inquirer.prompt([
  {
    type: 'list',
    name: 'tool',
    message: 'Which tool do you want to resume?',
    choices: [
      { name: 'Claude Code', value: 'claude' },
      { name: 'Codex', value: 'codex' },
    ],
  },
]);

if (tool === 'codex') {
  try {
    execSync('codex resume --all', { stdio: 'inherit' });
  } catch {
    console.error(chalk.red('codex is not installed or `codex resume --all` failed.'));
    console.error('Install it with: npm install -g @openai/codex');
    process.exit(1);
  }
} else {
  await runClaudePicker();
}
