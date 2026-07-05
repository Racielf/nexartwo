const LOCAL_PLACEHOLDER_SUPABASE_URL = 'https://local-placeholder.supabase.co';
const LOCAL_PLACEHOLDER_SUPABASE_ANON_KEY = 'local-placeholder-publishable-key';

function readEnv(primary, fallback) {
  return (process.env[primary] || process.env[fallback] || '').trim();
}

function localPlaceholdersAllowed() {
  return process.env.ALLOW_LOCAL_ENV_PLACEHOLDERS === 'true';
}

function requireBuildEnv(values) {
  const missing = [];
  if (!values.supabaseUrl) missing.push('NEXARTWO_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  if (!values.supabaseAnonKey) missing.push('NEXARTWO_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY');

  if (missing.length === 0) return values;

  if (localPlaceholdersAllowed()) {
    console.warn(
      'Using local placeholder public env values because ALLOW_LOCAL_ENV_PLACEHOLDERS=true. ' +
      'Do not use this mode for production builds.'
    );
    return {
      supabaseUrl: values.supabaseUrl || LOCAL_PLACEHOLDER_SUPABASE_URL,
      supabaseAnonKey: values.supabaseAnonKey || LOCAL_PLACEHOLDER_SUPABASE_ANON_KEY,
    };
  }

  throw new Error(
    'Missing required public environment variable(s): ' + missing.join(', ') + '. ' +
    'Set them in Vercel or run local validation with ALLOW_LOCAL_ENV_PLACEHOLDERS=true.'
  );
}

function buildPublicEnv() {
  const requiredEnv = requireBuildEnv({
    supabaseUrl: readEnv('NEXARTWO_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'),
    supabaseAnonKey: readEnv('NEXARTWO_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'),
  });
  const emailFunctionUrl = readEnv(
    'NEXARTWO_PUBLIC_EMAIL_FUNCTION_URL',
    'SUPABASE_EMAIL_FUNCTION_URL'
  ) || `${requiredEnv.supabaseUrl.replace(/\/+$/, '')}/functions/v1/send-email`;

  return {
    SUPABASE_URL: requiredEnv.supabaseUrl,
    SUPABASE_ANON_KEY: requiredEnv.supabaseAnonKey,
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
