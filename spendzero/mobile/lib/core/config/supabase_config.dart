/// Supabase project config for SpendSense (Project Future's auth backend).
///
/// The anon key is a public client key by design — it's safe to ship in the
/// app. It only permits what Row Level Security allows and is what every
/// Supabase mobile client embeds. The values can be overridden at build time
/// with --dart-define (SUPABASE_URL / SUPABASE_ANON_KEY) for other envs.
class SupabaseConfig {
  static const String url = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://jnnnqkuwyuyrjcjobeit.supabase.co',
  );

  static const String anonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impubm5xa3V3eXV5cmpjam9iZWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3ODY4NzcsImV4cCI6MjA5OTM2Mjg3N30.3iA-yerTWXWI8zTOZooGx4-MdlpYaMyyI01DSJiV6g0',
  );

  /// Deep-link redirect used by the Google/OAuth browser flow to return to
  /// the app. Must be registered in Supabase → Auth → URL Configuration and
  /// matched by the Android intent filter (see setup_mobile_platforms.sh).
  static const String oauthRedirect = 'com.projectfuture.app://login-callback';
}
