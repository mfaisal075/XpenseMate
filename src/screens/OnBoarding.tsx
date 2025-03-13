import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';

const OnBoarding = ({navigation}: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.bg} />
      <Image
        source={require('../assets/Donut.png')}
        style={styles.donut}
        resizeMode="contain"
      />
      <Image
        source={require('../assets/Coint.png')}
        style={styles.coin}
        resizeMode="contain"
      />
      <Image
        source={require('../assets/Man.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.textContainer}>
        <Text style={styles.text}>Spend Smarter</Text>
        <Text style={styles.text}>Save More</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.replace('Signup')}>
          <Text style={[styles.btnText, {color: '#fff'}]}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.replace('Login')}>
          <Text style={styles.btnText}>Already Have an Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnBoarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bg: {
    position: 'absolute',
    top: -30,
    width: 800,
    height: '60%',
    backgroundColor: '#EEF8F7',
    transform: [{rotate: '10deg'}],
  },
  donut: {
    position: 'absolute',
    top: 90,
    left: 50,
  },
  image: {
    marginTop: 80,
    width: '80%',
    height: '45%',
  },
  coin: {
    position: 'absolute',
    top: 130,
    right: 50,
    height: 90,
  },
  textContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#438883',
  },
  buttonContainer: {
    marginTop: 40,
    width: '80%',
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#3E7C78',
    width: '100%',
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#EEF8F7',
    width: '100%',
    height: '22%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3E7C78',
  },
  btnText: {
    color: '#3E7C78',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
