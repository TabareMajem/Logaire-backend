"use client";

import { SettingsForm } from '@/components/settings/settings-form';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      {/* <SettingsTabs> */}
        <SettingsForm />
      {/* </SettingsTabs> */}
    </div>
  );
}