const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..'); // proyecto root (one level up from scripts)
const EXTS = ['.js', '.php', '.css', '.html', '.md'];

const PRESERVE_SIGNATURE = 'Configura los eventos del dado';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    const filePath = path.join(dir, file);
    let stat;
    try { stat = fs.statSync(filePath); } catch (e) { return; }
    if (stat && stat.isDirectory()) {

      if (file === 'node_modules' || file === '.git') return;
      results = results.concat(walk(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

function shouldProcess(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return EXTS.includes(ext);
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  const blockRegex = /\/\*[\s\S]*?\*\//g;
  const blocks = content.match(blockRegex) || [];

  const placeholders = [];
  let i = 0;

  blocks.forEach(block => {
    if (block.includes(PRESERVE_SIGNATURE)) {
      const token = `___PRESERVE_BLOCK_${i}___`;
      placeholders.push({ token, block });
      content = content.replace(block, token);
      i++;
    }
  });

  content = content.replace(blockRegex, '');

  content = content.replace(/^\s*\/\/.*$/gm, '');

  content = content.split('\n').map(l => l.replace(/[ \t]+$/,'')).join('\n');

  placeholders.forEach(p => {
    content = content.replace(p.token, p.block);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
    return true;
  }
  return false;
}

function main() {
  console.log('Starting comment stripping in', ROOT);
  const files = walk(ROOT);
  let changedFiles = 0;
  files.forEach(f => {
    if (shouldProcess(f)) {
      try {
        if (processFile(f)) changedFiles++;
      } catch (e) {
        console.error('Error processing', f, e.message);
      }
    }
  });

  console.log(`Done. Files changed: ${changedFiles}`);
}

main();
