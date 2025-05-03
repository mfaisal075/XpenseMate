import {
  Alert,
  BackHandler,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../../FirebaseConfig';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import {ActivityIndicator} from 'react-native';
import Toast from 'react-native-toast-message';
import {Dialog, Portal} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Login = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    const backAction = () => {
      setShowExitDialog(true);
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);
  }, []);

  const logLoginHistory = async (user: any) => {
    try {
      const auth = FIREBASE_AUTH;
      const user = auth.currentUser;
      const db = FIRESTORE_DB;
      if (user) {
        const loginTime = new Date().toISOString();
        await addDoc(collection(db, 'loginHistory'), {
          userId: user.uid,
          email: user.email,
          loginTime: loginTime,
          timestamp: Timestamp.now(),
          device: Platform.OS,
          success: true,
        });
      }
    } catch (err) {
      console.error('Failed to log login history:', err);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all the fields',
      });
      return;
    }

    setLoading(true);
    const auth = FIREBASE_AUTH;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await updateDoc(doc(FIRESTORE_DB, 'users', user.uid), {
        forceLogout: false,
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Login successful!',
      });

      navigation.replace('Home');

      // 🔥 Log login to Firestore
      await logLoginHistory(user);
    } catch (error: any) {
      console.error('Login Error:', error.code, error.message);

      // Handle different Firebase error codes
      switch (error.code) {
        case 'auth/user-not-found':
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'No account found with this email. Please sign up.',
          });
          break;
        case 'auth/wrong-password':
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Incorrect password. Please try again.',
          });
          break;
        case 'auth/invalid-email':
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'The email address is not valid.',
          });
          break;
        case 'auth/invalid-credential':
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Invalid credential. Please check your email and password.',
          });
          break;
        default:
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'An unexpected error occurred. Please try again later.',
          });
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.headerText}>Login</Text>

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
            secureTextEntry={!passwordVisible}
            placeholderTextColor={'gray'}
          />
          <TouchableOpacity
            style={styles.eyeIconContainer}
            onPress={() => setPasswordVisible(!passwordVisible)}>
            <Image
              source={
                !passwordVisible
                  ? require('../assets/eye-open.png')
                  : require('../assets/closed-eyes.png')
              }
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleLogin()}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#F5F5F5"
              animating={loading}
              style={{marginVertical: 10}}
            />
          ) : (
            <Text style={styles.btnText}>Log In</Text>
          )}
        </TouchableOpacity>

        {/* Forgot password */}
        <View
          style={{
            marginTop: 10,
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
              textAlign: 'center',
            }}>
            Forgot your password?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.replace('RestPassword')}>
            <Text
              style={{
                color: '#438883',
                fontSize: 14,
                fontWeight: '600',
              }}>
              Reset Here
            </Text>
          </TouchableOpacity>
        </View>

        {/* Don't have account */}
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
              textAlign: 'center',
            }}>
            Don't Have Account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.replace('Signup')}>
            <Text
              style={{
                color: '#438883',
                fontSize: 14,
                fontWeight: '600',
              }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Exit App Modal */}
      <Portal>
        <Dialog
          visible={showExitDialog}
          onDismiss={() => setShowExitDialog(false)}
          style={styles.dialogContainer}>
          <Dialog.Title style={styles.dialogTitle}>
            <View style={{alignItems: 'center'}}>
              <View style={styles.dialogIconContainer}>
                <MaterialIcons
                  name="power-off"
                  size={40}
                  color="#D9534F"
                  style={styles.dialogIcon}
                />
              </View>
              <Text style={styles.title}>Exit Application</Text>
            </View>
          </Dialog.Title>

          <Dialog.Content>
            <Text style={styles.dialogText}>
              Are you sure you want to exit the app?
            </Text>
          </Dialog.Content>

          <Dialog.Actions style={styles.exitDialogActions}>
            <TouchableOpacity
              style={[styles.dialogButton, styles.cancelButton]}
              onPress={() => setShowExitDialog(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dialogButton, styles.confirmButton]}
              onPress={() => {
                BackHandler.exitApp();
                setShowExitDialog(false);
              }}>
              <View style={styles.exitButtonContent}>
                <MaterialIcons
                  name="exit-to-app"
                  size={18}
                  color="#fff"
                  style={styles.exitIcon}
                />
                <Text style={styles.confirmButtonText}>Exit</Text>
              </View>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default Login;

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
    fontSize: 24,
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
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  eyeIcon: {
    width: 30,
    height: 30,
    tintColor: 'rgba(0,0,0,0.8)',
  },

  //Exit App Modal Styles
  dialogContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    paddingTop: 0,
  },
  dialogIconContainer: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dialogIcon: {
    backgroundColor: '#F8E5E5',
    borderRadius: 25,
    padding: 8,
  },
  dialogTitle: {
    textAlign: 'center',
    marginTop: 10,
  },
  dialogText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  exitDialogActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  dialogButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#EEF8F7',
    borderWidth: 1,
    borderColor: '#888',
  },
  confirmButton: {
    backgroundColor: '#D9534F',
    marginLeft: 15,
  },
  cancelButtonText: {
    color: '#444',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  exitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exitIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
    color: '#1B5C58',
  },
});
