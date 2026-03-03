export const dynamic = 'force-dynamic';

import { settingsRepository } from '@/lib/db/repositories/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AshbySettingsForm } from '@/components/funnel/AshbySettingsForm';

export default async function SettingsPage() {
  const [apiKeySetting, baseUrlSetting] = await Promise.all([
    settingsRepository.getByKey('ashby_api_key'),
    settingsRepository.getByKey('ashby_base_url'),
  ]);

  const isConfigured = Boolean(apiKeySetting?.value?.trim());
  const baseUrl = baseUrlSetting?.value || 'https://api.ashbyhq.com';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600">Configure integrations and application settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ashby ATS Integration</CardTitle>
          <CardDescription>
            Connect Ashby to automatically sync job postings and track screens booked.
            Your API key is stored securely in the database — never in environment variables or source code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AshbySettingsForm isConfigured={isConfigured} baseUrl={baseUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
