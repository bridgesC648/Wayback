
function mySettings(props) {
  return (
    <Page>
      <Section
        description={<Text>Enable or disable haptic feedback upon arrival.</Text>}
        title="">        
        <Toggle
          label="Haptic Feedback"
          settingsKey="haptics"
        />
      </Section>

      <Section
        title={<Text bold align="center">Modify Waypoints</Text>}>
        <TextInput
        label= {props.settingsStorage.getItem("Waypoint1")}
        placeholder = "Enter new name..."
        settingsKey="newName1"
        />
        <TextInput
        label= {props.settingsStorage.getItem("Waypoint2")}
        placeholder = "Enter new name..."
        settingsKey="newName2"
        />
        <TextInput
        label= {props.settingsStorage.getItem("Waypoint3")}
        placeholder = "Enter new name..."
        settingsKey="newName3"
        />
        <TextInput
        label= {props.settingsStorage.getItem("Waypoint4")}
        placeholder = "Enter new name..."
        settingsKey="newName4"
        />
        <TextInput
        label= {props.settingsStorage.getItem("Waypoint5")}
        placeholder = "Enter new name..."
        settingsKey="newName5"
        />
        <TextInput
        label= {props.settingsStorage.getItem("Waypoint6")}
        placeholder = "Enter new name..."
        settingsKey="newName6"
        />
        <TextInput
        label= {props.settingsStorage.getItem("Waypoint7")}
        placeholder = "Enter new name..."
        settingsKey="newName7"
        />
        <TextInput
        label= {props.settingsStorage.getItem("Waypoint8")}
        placeholder = "Enter new name..."
        settingsKey="newName8"
        />
        <TextInput
        label= {props.settingsStorage.getItem("Waypoint9")}
        placeholder = "Enter new name..."
        settingsKey="newName9"
        />
        <TextInput
        label= {props.settingsStorage.getItem("Waypoint10")}
        placeholder = "Enter new name..."
        settingsKey="newName10"
        />
      </Section>      
    </Page>
  );
}

registerSettingsPage(mySettings);
