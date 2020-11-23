function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Modify Waypoints</Text>}>
        <TextInput
        label="Waypoint 1"
        placeholder = "Enter new name..."
        settingsKey="newName"
        />
        <Button
          list
          label="Clear Settings Storage"
          onClick={() => props.settingsStorage.clear()}
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
