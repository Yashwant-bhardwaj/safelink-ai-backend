import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting SafeLink AI (Frontend + Backend)...\n');

// Start backend server
const backend = spawn('node', ['server.js'], {
  cwd: path.join(process.cwd(), 'server'),
  stdio: 'inherit',
  shell: true
});

// Start frontend vite dev server
const frontend = spawn('npm', ['run', 'vite'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true
});

// Handle kill signals to cleanly shut down both servers
const cleanup = () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
