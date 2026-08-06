#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const mcpServerPath = path.join(projectRoot, 'mcp_server.js');

const isDockerMode = process.argv.includes('--docker') || fs.existsSync('/host_gemini_config');

const homeDir = os.homedir();
const configPaths = [];

if (isDockerMode) {
  // Docker içinde çalışırken mount edilen host dizinini kullan
  if (fs.existsSync('/host_gemini_config')) {
    configPaths.push('/host_gemini_config/mcp_config.json');
  }
} else {
  // Host makinesinde çalışırken
  configPaths.push(path.join(homeDir, '.gemini', 'config', 'mcp_config.json'));
  
  if (process.platform === 'win32') {
    configPaths.push(path.join(process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json'));
  } else if (process.platform === 'darwin') {
    configPaths.push(path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'));
  } else {
    configPaths.push(path.join(homeDir, '.config', 'Claude', 'claude_desktop_config.json'));
  }
}

const hostProjectPath = process.env.HOST_PROJECT_PATH || projectRoot;
const hostMcpServerPath = path.join(hostProjectPath, 'mcp_server.js');

const updatedConfigs = [];

for (const configPath of configPaths) {
  try {
    const dir = path.dirname(configPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let config = { mcpServers: {} };
    if (fs.existsSync(configPath)) {
      try {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(fileContent) || { mcpServers: {} };
        if (!config.mcpServers) config.mcpServers = {};
      } catch (e) {
        config = { mcpServers: {} };
      }
    }

    config.mcpServers["interactive-coaching-mcp"] = {
      command: "node",
      args: [hostMcpServerPath]
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    updatedConfigs.push(configPath);
  } catch (err) {
    console.warn(`⚠️ Konfigürasyon dosyası güncellenirken uyarı (${configPath}): ${err.message}`);
  }
}

console.log('\n==================================================');
console.log('🎉 MCP Otomatik Kurulumu Başarıyla Tamamlandı!');
console.log('==================================================');
console.log(`📌 Sunucu Yolu: ${hostMcpServerPath}`);
if (updatedConfigs.length > 0) {
  console.log('✅ Güncellenen MCP Konfigürasyon Dosyaları:');
  updatedConfigs.forEach(p => console.log(`   - ${p}`));
}
console.log('==================================================\n');
