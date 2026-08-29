#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n🔥 Triangle Social - Firebase Credentials Helper\n');
console.log('Get these keys from https://console.firebase.google.com -> Project Settings\n');

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

async function run() {
  const apiKey = await ask('1. Enter VITE_FIREBASE_API_KEY: ');
  const authDomain = await ask('2. Enter VITE_FIREBASE_AUTH_DOMAIN (e.g. app.firebaseapp.com): ');
  const projectId = await ask('3. Enter VITE_FIREBASE_PROJECT_ID: ');
  const storageBucket = await ask('4. Enter VITE_FIREBASE_STORAGE_BUCKET: ');
  const messagingSenderId = await ask('5. Enter VITE_FIREBASE_MESSAGING_SENDER_ID: ');
  const appId = await ask('6. Enter VITE_FIREBASE_APP_ID: ');

  const content = `# Triangle Social Web App Environment Variables
VITE_FIREBASE_API_KEY=${apiKey.trim() || 'AIzaSyDemoKey_ReplaceWithYourActualFirebaseKey'}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain.trim() || 'triangle-social-events.firebaseapp.com'}
VITE_FIREBASE_PROJECT_ID=${projectId.trim() || 'triangle-social-events'}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket.trim() || 'triangle-social-events.appspot.com'}
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId.trim() || '1234567890'}
VITE_FIREBASE_APP_ID=${appId.trim() || '1:1234567890:web:abcdef123456'}
VITE_API_URL=http://localhost:8000/api/v1
`;

  fs.writeFileSync(envPath, content, 'utf8');
  console.log(`\n✅ Saved credentials safely to ${envPath}\n`);
  rl.close();
}

run();
