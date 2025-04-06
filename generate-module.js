import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the module name from the command line arguments
const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Please provide a module name.');
  process.exit(1);
}

// Convert the module name to lowercase for folder naming
const moduleFolder = moduleName.toLowerCase();

// Define the paths for folders and files
const paths = [
  `${moduleFolder}/list/${moduleName}List.tsx`,
  `${moduleFolder}/list/${moduleName}ListTable.tsx`,
  `${moduleFolder}/list/columns.tsx`,
  `${moduleFolder}/details/${moduleName}Detail.tsx`,
  `${moduleFolder}/mutate/CreateUpdate${moduleName}.tsx`,
  `${moduleFolder}/types.ts`,
];

// Use the directory where the script is located
const baseDir = __dirname;


// Create the folders and files relative to the script's directory
paths.forEach((filePath) => {
  const fullPath = path.join(baseDir, filePath);
  const dir = path.dirname(fullPath);

  // Create the folder if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }

  // Create the file if it doesn't exist
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, '');
    console.log(`Created file: ${fullPath}`);
  }
});

// ASCII art for success message
const oldasciiArt = `
*******************************************************
*                                                     *
*    Module "${moduleName}" generated successfully!   *
*                                                     *
*    _____                 _                          *
*  ____  __   __  ____   __   __ _     ___  __    __  *
* (  __)/ _\ (  )(__  ) / _\ (  ( \   / __)(  )  (  ) *
*  ) _)/    \ )(  / _/ /    \/    /  ( (__ / (_/\ )(  *
* (__) \_/\_/(__)(____)\_/\_/\_)__)   \___)\____/(__) *
*                                                     *
*    Happy Coding! 🚀                                 *
*******************************************************
`;

const asciiArt = `
*******************************************************
*                                                     *
*   _____      _                    ____ _     _       *
*  |  ___|_ _ (_)______ _ _ __     / ___| |   (_)      *
*  | |_ / _\` | | |_  / _\` | '_ \\  | |   | |   | |      *
*  |  _| (_| | | |/ / (_| | | | | | |___| |___| |      *
*  |_|  \\__,_|_|_/___\\__,_|_| |_|  \\____|_____|_|      *
*                                                     *
*    Module "${moduleName}" generated successfully!   *
*                                                     *
*                  Happy Coding! 🚀                   *
*******************************************************
`;


