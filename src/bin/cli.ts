#!/usr/bin/env node

import { program } from 'commander';
import express from 'express';
import { createTestServer } from '../server';
import { spawn } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

program
  .name('promptproof')
  .description('LLM testing made easy')
  .version('0.1.0')
  .option('-p, --port <number>', 'port to run the server on', '3001')
  .option('-d, --dashboard-port <number>', 'port to run the dashboard on', '3000')
  .option('--no-open', 'don\'t open the dashboard automatically')
  .parse(process.argv);

const options = program.opts();

async function openBrowser(url: string) {
  const platform = process.platform;
  const cmd = platform === 'win32' ? 'start' :
              platform === 'darwin' ? 'open' :
              'xdg-open';
  
  spawn(cmd, [url], {
    stdio: 'ignore',
    detached: true
  }).unref();
}

async function main() {
  // Create and start the server
  const app = express();
  const server = createTestServer(app);
  
  server.listen(options.port, () => {
    console.log(chalk.blue(`🚀 Test server running on port ${options.port}`));
  });

  // Start the dashboard (Vite dev server)
  const dashboard = spawn('npx', ['vite', '--port', options.dashboardPort], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      VITE_SERVER_PORT: options.port
    }
  });

  // Handle process termination
  process.on('SIGINT', () => {
    dashboard.kill();
    server.close();
    process.exit();
  });

  // Wait for dashboard to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (options.open) {
    // Open the dashboard in the default browser
    const url = `http://localhost:${options.dashboardPort}`;
    await openBrowser(url);
  }

  console.log(chalk.green('\n✨ PromptProof is ready!'));
  console.log(chalk.cyan(`\n📊 Dashboard: http://localhost:${options.dashboardPort}`));
  console.log(chalk.cyan(`🔌 Server: http://localhost:${options.port}`));
  console.log(chalk.yellow('\n📝 Looking for test files in current directory...'));

  // Check for API keys
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    console.log(chalk.red('\n⚠️  Warning: No API keys found in environment'));
    console.log(chalk.yellow('Add OPENAI_API_KEY or ANTHROPIC_API_KEY to your .env file'));
  }
}

main().catch(error => {
  console.error(chalk.red('Error starting PromptProof:'), error);
  process.exit(1);
}); 