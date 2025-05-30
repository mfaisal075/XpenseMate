import {
  BackHandler,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../../FirebaseConfig';
import {createUserWithEmailAndPassword, signOut} from 'firebase/auth';
import {doc, setDoc} from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import {ActivityIndicator} from 'react-native';

const Signup = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const auth = FIREBASE_AUTH;
    const db = FIRESTORE_DB;

    if (!email || !password || !fullName || !userName || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all the fields',
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'The passwords you entered do not match. Please try again.',
      });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Save user details in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        userName: `@${userName}`,
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'User created successfully',
      });
      await signOut(auth);
      navigation.replace('Login');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'This email is already in use. Please try logging in.',
        });
      } else if (error.code === 'auth/invalid-email') {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'The email address is not valid.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message,
        });
      }
      console.error(error.message);
    } finally {
      setLoading(false);
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
        <Text style={styles.headerText}>Signup</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholderTextColor={'gray'}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={userName}
            onChangeText={text => setUserName(text.toLowerCase())}
            placeholderTextColor={'gray'}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={'gray'}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholderTextColor={'gray'}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            placeholderTextColor={'gray'}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={() => handleSignup()}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#F5F5F5"
              style={{marginVertical: 10}}
            />
          ) : (
            <Text style={styles.btnText}>Sign up</Text>
          )}
        </TouchableOpacity>
        <View
          style={{
            marginTop: 10,
            marginBottom: 10,
            width: '100%',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: '#444444',
              fontSize: 14,
              fontWeight: '600',
            }}>
            Already Have Account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text
              style={{
                color: '#438883',
                fontSize: 14,
                fontWeight: '600',
              }}>
              Log In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF8F7',
  },
  contentContainer: {
    width: '90%',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#438883',
    alignSelf: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // Shadow on Android
  },
  input: {
    height: 50,
    padding: 10,
    borderRadius: 10,
    borderColor: 'gray',
    borderWidth: 1,
    color: '#000',
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
    backgroundColor: '#3E7C78',
    width: '100%',
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});
