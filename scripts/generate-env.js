const DEFAULT_SUPABASE_URL = 'https://udaeifoibydcokefcmbg.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_8n5oHdP9MhT3hsZf-IRqiw__b4qcTfC';

function readEnv(primary, fallback, defaultValue) {
  return process.env[primary] || process.env[fallback] || defaultValue || '';
}

function buildPublicEnv() {
  const supabaseUrl = readEnv('NEXARTWO_PUBLIC_SUPABASE_URL', 'SUPABASE_URL', DEFAULT_SUPABASE_URL).trim();
  const supabaseAnonKey = readEnv('NEXARTWO_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY', DEFAULT_SUPABASE_ANON_KEY).trim();
  const emailFunctionUrl = readEnv(
    'NEXARTWO_PUBLIC_EMAIL_FUNCTION_URL',
    'SUPABASE_EMAIL_FUNCTION_URL',
    supabaseUrl ? `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/send-email` : ''
  ).trim();

  return {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
    SUPABASE_EMAIL_FUNCTION_URL: emailFunctionUrl,
  };
}

function envFileContents() {
  return `// Generated at build time. Do not edit by hand.\nwindow.NEXARTWO_ENV = Object.freeze(${JSON.stringify(buildPublicEnv(), null, 2)});\n`;
}

function writeEnvFile(outPath) {
  const fs = require('fs');
  const path = require('path');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, envFileContents());
  console.log(`Generated ${path.relative(process.cwd(), outPath)}`);
}

if (require.main === module) {
  const path = require('path');
  writeEnvFile(path.join(__dirname, '..', 'js', 'env.js'));
}

module.exports = {
  buildPublicEnv,
  envFileContents,
  writeEnvFile,
};
