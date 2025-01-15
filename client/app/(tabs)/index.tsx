import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Audio } from 'expo-av';
import { Recording } from 'expo-av/build/Audio';

type RecordingData = {
  sound: Audio.Sound;
  duration: string;
  file: string;
};

export default function App() {
  const [recording, setRecording] = useState<Recording | undefined>(undefined);
  const [recordings, setRecordings] = useState<RecordingData[]>([]);
  const [summary, setSummary] = useState<string>('');

  const startRecording = async (): Promise<void> => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          (Audio as unknown as any).RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
      }
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = async (): Promise<void> => {
    if (recording) {
      setRecording(undefined);
      try {
        await recording.stopAndUnloadAsync();
        const audioUri = recording.getURI();

        if (!audioUri) {
          console.error('Failed to retrieve audio URI');
          return;
        }

        const audioBlob = await fetch(audioUri).then((res) => res.blob());
        const formData = new FormData();
        formData.append('audioData', audioBlob, 'audio.webm');

        // Send the audio data to the server
        const response = await fetch(process.env.SERVER_URL as string, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.error('Failed to process audio:', response.statusText);
          return;
        }

        const { summary } = await response.json();

        console.log('Summary:', summary);

        setSummary(summary);
      } catch (err) {
        console.error('Error stopping and sending recording:', err);
      }
    }
  };

  const getRecordingLines = (): JSX.Element => (
    <View style={styles.row}>
      <Text style={styles.fill}>{summary ? summary : ''}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button
        title={recording ? 'Stop' : 'Start'}
        onPress={recording ? stopRecording : startRecording}
      />
      {!recording && getRecordingLines()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 40,
  },
  fill: {
    flex: 1,
    margin: 15,
  },
});
