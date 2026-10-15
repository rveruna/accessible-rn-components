import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Banner, Button, TextField, Toggle, colors, spacing } from './src';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function App() {
  const [email, setEmail] = useState('');
  const [reminders, setReminders] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  // Only true once a save has finished, and cleared by any edit, so the banner never claims an unsaved change
  const [saved, setSaved] = useState(false);

  const error = submitted && !EMAIL_PATTERN.test(email) ? 'Enter a valid email address' : undefined;

  function changeEmail(next: string) {
    setEmail(next);
    setSaved(false);
  }

  function handleSubmit() {
    setSubmitted(true);
    setSaved(false);
    if (!EMAIL_PATTERN.test(email)) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 1200);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text role="heading" style={styles.title}>
          Accessible components
        </Text>
        <Banner
          kind="info"
          message="Every colour pair in this palette is checked against WCAG AA in the tests."
        />
        <View style={styles.form}>
          <TextField
            label="Email"
            value={email}
            onChangeText={changeEmail}
            helperText="We only use this to send reminders"
            error={error}
          />
          <Toggle label="Email reminders" value={reminders} onValueChange={setReminders} />
          <Button label="Save preferences" onPress={handleSubmit} loading={saving} />
          <Button label="Cancel" variant="secondary" onPress={() => changeEmail('')} />
        </View>
        {saved ? <Banner kind="success" message="Preferences saved" /> : null}
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  form: { gap: spacing.md },
});
