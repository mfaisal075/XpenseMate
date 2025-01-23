import {
  Alert,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {TextInput} from 'react-native-paper';
import {FIREBASE_AUTH} from '../../FirebaseConfig';
import {
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import Toast from 'react-native-toast-message';

const RestPassword = ({navigation}: any) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please fill in all the fields');
      return;
    }
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      const auth = FIREBASE_AUTH;

      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length === 0) {
        Alert.alert('Error', 'No account found with this email address');
        return;
      }
      
      await sendPasswordResetEmail(auth, email);

      Toast.show({
        type: 'success',
        text1: 'Password Reset Email Sent',
        text2: `Please check your email for instructions to reset your password.`,
      });

      await signOut(auth);
      navigation.replace('Login');
    } catch (error: any) {
      console.error('Error sending password reset email:', error.message);
      Alert.alert('Password Reset Failed', error.message);
    }
  };

  useEffect(() => {
    const backPress = () => {
      navigation.replace('Login');
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backPress);
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.headerText}>Rest Password</Text>
        <View style={styles.textContainer}>
          <Text
            style={{
              color: 'gray',
              marginBottom: 8,
              fontWeight: '600',
            }}>
            Forget Password?
          </Text>
          <Text
            style={{
              color: 'gray',
              fontSize: 12,
              marginBottom: 5,
              fontWeight: '600',
            }}>
            No worries, we'll send you reset instructions.
          </Text>
        </View>
        <TextInput
          label="Enter Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          textColor="#000"
          style={styles.inputField}
          theme={{
            colors: {
              primary: '#1F615C',
              text: '#000',
              placeholder: '#666',
              background: '#fff',
            },
          }}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleResetPassword()}>
          <Text style={styles.btnText}>Rest Password</Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <View
          style={{
            marginTop: 10,
            marginBottom: 10,
            width: 250,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            onPress={() => navigation.replace('Login')}
            style={styles.backToLogin}>
            <Image
              source={require('../assets/up-arrow.png')}
              style={styles.backToLoginArrow}
            />
            <Text
              style={{
                color: 'gray',
                fontSize: 14,
                fontWeight: '600',
              }}>
              Back to log in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RestPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF8F7',
  },
  contentContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#438883',
    alignSelf: 'center',
    marginBottom: 20,
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginBottom: 8,
    marginTop: 15,
    alignSelf: 'center',
    backgroundColor: '#3E7C78',
    width: 270,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputField: {
    backgroundColor: '#fff',
    color: '#000',
    marginVertical: 5,
  },
  backToLogin: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  backToLoginArrow: {
    width: 20,
    height: 20,
    marginRight: 5,
    transform: [{rotate: '-90deg'}],
  },
});
