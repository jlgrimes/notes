import React from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';

interface ModalOverlayProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}

export function ModalOverlay({
  visible,
  onDismiss,
  children,
}: ModalOverlayProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='fade'
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.contentContainer}>{children}</View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  contentContainer: {
    backgroundColor: 'transparent',
  },
});
