import { StyleSheet, View } from 'react-native';

import { StackCardView } from '@/components/stack-card-view';

export default function HomeScreen() {
  const cards = [
    { id: '1', front: 'Hello', back: 'Xin chào' },
    { id: '2', front: 'Goodbye', back: 'Tạm biệt' },
    { id: '3', front: 'Thank you', back: 'Cảm ơn' },
    { id: '4', front: 'Please', back: 'Vui lòng' },
    { id: '5', front: 'How are you?', back: 'Bạn khỏe không?' },
  ];

  return (
    <View style={styles.container}>
      <StackCardView 
        cards={cards}
        onSwipeLeft={(card) => console.log('Swiped left:', card.front)}
        onSwipeRight={(card) => console.log('Swiped right:', card.front)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
