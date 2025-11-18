import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');

interface Card {
  id: string;
  front: string;
  back: string;
}

interface StackCardViewProps {
  cards: Card[];
  onSwipeLeft?: (card: Card) => void;
  onSwipeRight?: (card: Card) => void;
}

export function StackCardView({ cards, onSwipeLeft, onSwipeRight }: StackCardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const colorScheme = useColorScheme();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const rotation = useSharedValue(0);
  const textOpacity = useSharedValue(1);

  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? "#2E3856" : "#ffffff";
  const textColor = isDark ? Colors.dark.text : Colors.light.text;

  const onGestureEvent = (event: any) => {
    translateX.value = event.nativeEvent.translationX;
    translateY.value = event.nativeEvent.translationY;
    rotate.value = interpolate(
      event.nativeEvent.translationX,
      [-width / 2, 0, width / 2],
      [-30, 0, 30],
      Extrapolate.CLAMP
    );
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const swipeThreshold = width * 0.3;

      if (event.nativeEvent.translationX > swipeThreshold) {
        // Swipe right
        textOpacity.value = withTiming(0, { duration: 150 });
        translateX.value = withTiming(width, { duration: 300, easing: Easing.out(Easing.quad) });
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          translateX.value = withTiming(0, { duration: 0 });
          translateY.value = 0;
          rotate.value = 0;
          rotation.value = 0;
          setFlipped(false);
          textOpacity.value = withTiming(1, { duration: 150 });
          onSwipeRight?.(cards[currentIndex]);
        }, 300);
      } else if (event.nativeEvent.translationX < -swipeThreshold) {
        // Swipe left
        textOpacity.value = withTiming(0, { duration: 150 });
        translateX.value = withTiming(-width, { duration: 300, easing: Easing.out(Easing.quad) });
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          translateX.value = withTiming(0, { duration: 0 });
          translateY.value = 0;
          rotate.value = 0;
          rotation.value = 0;
          setFlipped(false);
          textOpacity.value = withTiming(1, { duration: 150 });
          onSwipeLeft?.(cards[currentIndex]);
        }, 300);
      } else {
        // Reset
        translateX.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
        translateY.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
        rotate.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(rotation.value, [0, 90, 180], [1, 0, 0]),
    transform: [
      {
        scaleX: interpolate(rotation.value, [0, 90, 180], [1, 0, -1], Extrapolate.CLAMP),
      },
    ],
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(rotation.value, [0, 90, 180], [0, 0, 1]),
    transform: [
      {
        scaleX: interpolate(rotation.value, [0, 90, 180], [-1, 0, 1], Extrapolate.CLAMP),
      },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const handleFlip = () => {
    rotation.value = withTiming(flipped ? 0 : 180, { 
      duration: 200,
      easing: Easing.inOut(Easing.cubic),
    });
    setFlipped(!flipped);
  };

  if (currentIndex >= cards.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: textColor }]}>
          Hoàn thành tất cả thẻ!
        </Text>
      </View>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <View style={styles.container}>
      {/* Stack background cards */}
      {cards.slice(currentIndex + 1, currentIndex + 3).map((_, index) => (
        <View
          key={index}
          style={[
            styles.stackCard,
            {
              backgroundColor,
              transform: [
                { translateY: (index + 1) * 8 },
                { scale: 1 - (index + 1) * 0.02 },
              ],
            },
          ]}
        >
            <Text style={[styles.cardText, { color: textColor }]}>
                  {cards[currentIndex + 1].front}
            </Text>
            <Text style={[styles.hint, { color: textColor, opacity: 0.6 }]}>
                Nhấn để xem nghĩa
            </Text>
        </View>
      ))}

      {/* Main card */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View style={[styles.card, animatedStyle, { backgroundColor }]}>
          <Pressable style={styles.cardContent} onPress={handleFlip}>
            {!flipped ? (
              <Animated.View style={[styles.cardFace, frontAnimatedStyle, textAnimatedStyle]}>
                <Text style={[styles.cardText, { color: textColor }]}>
                  {currentCard.front}
                </Text>
                <Text style={[styles.hint, { color: textColor, opacity: 0.6 }]}>
                  Nhấn để xem nghĩa
                </Text>
              </Animated.View>
            ) : (
              <Animated.View style={[styles.cardFace, backAnimatedStyle, textAnimatedStyle]}>
                <Text style={[styles.cardText, { color: textColor }]}>
                  {currentCard.back}
                </Text>
              </Animated.View>
            )}
          </Pressable>

          {/* Info text */}
          <Text style={[styles.cardInfo, { color: textColor, opacity: 0.5 }]}>
            {currentIndex + 1} / {cards.length}
          </Text>
        </Animated.View>
      </PanGestureHandler>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={[styles.instructionText, { color: textColor, opacity: 0.7 }]}>
          ← Kéo sang trái hoặc phải →
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#0A092D',
  },
  card: {
    width: width - 70,
    height: height - 270,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 10,
  },
  stackCard: {
    position: 'absolute',
    width: width - 70,
    height: height - 270,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 5,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFace: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  cardText: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  cardInfo: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    fontSize: 12,
  },
  instructions: {
    marginTop: 40,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A092D',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
