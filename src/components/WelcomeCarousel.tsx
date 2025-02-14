import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';

const ANIMATION_DURATION = 5000; // Time each message is shown (5 seconds)
const TRANSITION_DURATION = 600; // Time for the transition animation
const VISIBLE_ITEMS = 3; // Number of items visible at once
const ITEM_HEIGHT = 50; // Height of each message

interface WelcomeMessage {
  lang: string;
  text: string;
}

const welcomeMessages: WelcomeMessage[] = [
  { lang: 'en', text: 'Say hello to Memo' },
  { lang: 'es', text: 'Empecemos con Memo' },
  { lang: 'fr', text: 'Prêts pour Memo?' },
  { lang: 'ja', text: 'Memoへようこそ' },
];

export function WelcomeCarousel() {
  const { i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState<WelcomeMessage[]>([]);

  useEffect(() => {
    // Reorder messages to start with current language
    const currentLang = i18n.language;
    const currentLangIndex = welcomeMessages.findIndex(
      msg => msg.lang === currentLang
    );

    if (currentLangIndex !== -1) {
      const reorderedMessages = [
        welcomeMessages[currentLangIndex],
        ...welcomeMessages.slice(currentLangIndex + 1),
        ...welcomeMessages.slice(0, currentLangIndex),
      ];
      // Duplicate messages for infinite scrolling
      setMessages([
        ...reorderedMessages,
        ...reorderedMessages,
        ...reorderedMessages,
      ]);
      // Start from the middle set
      setCurrentIndex(reorderedMessages.length);
    } else {
      setMessages([...welcomeMessages, ...welcomeMessages, ...welcomeMessages]);
      setCurrentIndex(welcomeMessages.length);
    }
  }, [i18n.language]);

  useEffect(() => {
    if (messages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(current => {
        const baseLength = messages.length / 3;
        const nextIndex = current + 1;

        // If we're at the end of the second set
        if (nextIndex >= baseLength * 2) {
          // Wait for the next frame to reset the index
          // This ensures the animation completes before jumping
          requestAnimationFrame(() => {
            setTimeout(() => {
              setCurrentIndex(baseLength);
            }, TRANSITION_DURATION);
          });
        }
        return nextIndex;
      });
    }, ANIMATION_DURATION);

    return () => clearInterval(interval);
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {messages.map((message, index) => {
          const position = index - currentIndex;
          const isVisible = Math.abs(position) <= 2; // Show two items in each direction

          if (!isVisible) return null;

          return (
            <MotiView
              key={`${message.lang}-${index}`}
              style={[
                styles.messageContainer,
                {
                  zIndex: 10 - Math.abs(position),
                },
              ]}
              from={{
                opacity: position > 1 ? 0 : 1 - Math.abs(position) * 0.5,
                translateY: position * ITEM_HEIGHT,
              }}
              animate={{
                opacity: 1 - Math.abs(position) * 0.5,
                translateY: position * ITEM_HEIGHT,
              }}
              transition={{
                type: 'timing',
                duration: TRANSITION_DURATION,
              }}
            >
              <Text style={styles.title}>{message.text}</Text>
            </MotiView>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: ITEM_HEIGHT * 3,
    width: '100%',
  },
  container: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    height: ITEM_HEIGHT,
    width: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
});
