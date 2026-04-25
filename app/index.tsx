import { View, Text, StyleSheet } from 'react-native';

export default function WorldMap() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dinophonics</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
});
