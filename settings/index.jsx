function mySettings(props) {
  return (
    <Page>
      <Section
        description={<Text>Manually set your heading from 0 to 360.</Text>}>
        <TextInput
            label="Heading"
            settingsKey="heading"
        />
      </Section>
      
      <Section
        description={<Text>Enable or disable idly monitoring position when not navigating.</Text>}
        title="">        
        <Toggle
          label="Idle"
          settingsKey="idle"
        />
      </Section>
      
      <Section
        description={<Text>Enable or disable haptic feedback upon arrival.</Text>}
        title="">        
        <Toggle
          label="Haptic Feedback"
          settingsKey="haptics"
        />
      </Section>

    </Page>
  );
}

registerSettingsPage(mySettings);
