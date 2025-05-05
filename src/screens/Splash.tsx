import {Image, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import React, {useEffect} from 'react';

const Splash = ({navigation}: any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('OnBoarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Xlogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.brand}>XpenseMate</Text>
      <ActivityIndicator size="small" color="#fff" style={styles.loader} />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#63B5AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
    tintColor: 'white',
  },
  brand: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  loader: {
    marginTop: 10,
  },
});
