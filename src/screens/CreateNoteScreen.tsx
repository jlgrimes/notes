import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { NoteForm } from '../components/NoteForm';
import { useNavigation } from '@react-navigation/native';

interface CreateNoteScreenProps {
  handleSubmit: (title: string, content: string) => Promise<void>;
}

export function CreateNoteScreen({ handleSubmit }: CreateNoteScreenProps) {
  const navigation = useNavigation();

  const onSubmit = async (title: string, content: string) => {
    await handleSubmit(title, content);
    // @ts-ignore - navigation type is complex here
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <NoteForm onSubmit={onSubmit} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
});
