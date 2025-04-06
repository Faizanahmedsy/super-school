import path from 'path';
import fs from 'fs';

function logEnvironmentInfo(mode) {
  console.log(`\nEnvironment: ${mode.toUpperCase()}`);

  const envFilePath = mode === 'development' ? '.env' : `.env.${mode}`;
  const envFileContent = loadEnvironmentFile(envFilePath);
}

function loadEnvironmentFile(envFilePath) {
  try {
    if (fs.existsSync(envFilePath)) {
      return fs.readFileSync(envFilePath, 'utf8');
    }
    return 'No environment file found.';
  } catch (error) {
    return `Error reading environment file: ${error.message}`;
  }
}

export default logEnvironmentInfo;
