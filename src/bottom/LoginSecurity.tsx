import {
  ActivityIndicator,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getAuth,
  EmailAuthProvider,
  updatePassword,
  reauthenticateWithCredential,
} from 'firebase/auth';
import Toast from 'react-native-toast-message';
import {ScrollView} from 'react-native-gesture-handler';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../../FirebaseConfig';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const initialPasswordChangeForm: PasswordChangeForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const LoginSecurity = ({goToProfile}: any) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changePasswordForm, setChangePasswordForm] =
    useState<PasswordChangeForm>(initialPasswordChangeForm);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loginHistoryVisible, setLoginHistoryVisible] = useState(false);
  const [loginLogs, setLoginLogs] = useState<Array<any>>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [logoutAllVisible, setLogoutAllVisible] = useState(false);

  const handlePasswordFormChange = (
    field: keyof PasswordChangeForm,
    value: string,
  ) => {
    setChangePasswordForm(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setError(null);

    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (changePasswordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    if (
      !changePasswordForm.currentPassword ||
      !changePasswordForm.newPassword ||
      !changePasswordForm.confirmPassword
    ) {
      setError('All fields are required');
      setLoading(false);
      return;
    }
    if (changePasswordForm.currentPassword === changePasswordForm.newPassword) {
      setError('New password must be different from current password');
      setLoading(false);
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError('User not found');
      setLoading(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        changePasswordForm.currentPassword,
      );

      // Reauthenticate the user
      await reauthenticateWithCredential(user, credential);

      // Update the password
      await updatePassword(user, changePasswordForm.newPassword);

      Toast.show({
        type: 'success',
        text1: 'Password Changed Successfully',
        text2: 'Your password has been updated successfully.',
      });
      setLoading(false);
      setVisible(false);
      setChangePasswordForm(initialPasswordChangeForm);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        setError('New password is too weak');
      } else {
        setError('Failed to change password. Please try again later.');
      }
      setLoading(false);
    }
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setVisible(false);
      setChangePasswordForm(initialPasswordChangeForm);
    }, 2000);
  };

  const fetchLoginHistory = async () => {
    try {
      setHistoryLoading(true);

      const auth = FIREBASE_AUTH;
      const db = FIRESTORE_DB;
      const user = auth.currentUser;

      if (!user) {
        console.warn('No authenticated user found');
        return;
      }

      // Construct query
      const loginHistoryQuery = query(
        collection(db, 'loginHistory'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
      );

      const snapshot = await getDocs(loginHistoryQuery);

      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLoginLogs(logs);
      setLoginHistoryVisible(true);
    } catch (error) {
      console.error('Error fetching login history:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Failed to load login history', ToastAndroid.SHORT);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load login history',
        });
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const logoutFromAllDevices = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      await updateDoc(doc(FIRESTORE_DB, 'users', user.uid), {
        forceLogout: true,
      });
    }
  };

  useEffect(() => {
    const backBtnPress = () => {
      goToProfile();
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', backBtnPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backBtnPress);
    };
  }, []);

  function onDismiss(): void {
    setVisible(false);
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B5C58', '#438883']} style={styles.heroSec}>
        <Image
          source={require('../assets/ellipse.png')}
          style={styles.heroBackgroundImage}
          resizeMode="contain"
        />
        <View style={styles.topContainer}>
          <TouchableOpacity onPress={goToProfile} style={styles.backButton}>
            <Image
              source={require('../assets/back.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.topBarHeading}>Login & Security</Text>
        </View>
      </LinearGradient>

      <View style={styles.bottomContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setVisible(true)}>
            <View style={styles.buttonContent}>
              <Icon name="lock-reset" size={24} color="#1B5C58" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Change Password</Text>
                <Text style={styles.buttonSubtitle}>
                  Last changed 3 months ago
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#1B5C58" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => console.log('Two-factor authentication Pressed')}>
            <View style={styles.buttonContent}>
              <Icon name="shield-key" size={24} color="#1B5C58" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>
                  Two-Factor Authentication
                </Text>
                <Text style={styles.buttonSubtitle}>
                  Add extra security to your account
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#1B5C58" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => fetchLoginHistory()}>
            <View style={styles.buttonContent}>
              <Icon name="history" size={24} color="#1B5C58" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Login Activity</Text>
                <Text style={styles.buttonSubtitle}>
                  Review recent sign-ins
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#1B5C58" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setLogoutAllVisible(true)}>
            <View style={styles.buttonContent}>
              <Icon name="logout" size={24} color="#1B5C58" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Logout All Devices</Text>
                <Text style={styles.buttonSubtitle}>
                  Sign out from all active sessions
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#1B5C58" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Change password Modal */}
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={onDismiss}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={onDismiss}
          />

          <View style={styles.dialog}>
            <Text style={styles.title}>Change Password</Text>

            <TextInput
              placeholder="Current Password"
              placeholderTextColor={'#ccc'}
              value={changePasswordForm.currentPassword}
              onChangeText={text =>
                handlePasswordFormChange('currentPassword', text)
              }
              secureTextEntry={!showCurrent}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Current password input"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="New Password"
                placeholderTextColor={'#ccc'}
                value={changePasswordForm.newPassword}
                onChangeText={text =>
                  handlePasswordFormChange('newPassword', text)
                }
                secureTextEntry={!showNew}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="New password input"
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowNew(!showNew)}>
                <Text style={styles.toggleText}>
                  {showNew ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Confirm New Password"
                placeholderTextColor={'#ccc'}
                value={changePasswordForm.confirmPassword}
                onChangeText={text => {
                  handlePasswordFormChange('confirmPassword', text);
                }}
                secureTextEntry={!showConfirm}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Confirm new password input"
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowConfirm(!showConfirm)}>
                <Text style={styles.toggleText}>
                  {showConfirm ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onDismiss}
                disabled={loading}>
                <Text style={[styles.buttonText, {color: '#1B5C58'}]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={() => {
                  handleChangePassword();
                }}
                disabled={
                  loading ?? setChangePasswordForm(initialPasswordChangeForm)
                }>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Login Histoty Modal */}
      <Modal
        visible={loginHistoryVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setLoginHistoryVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setLoginHistoryVisible(false)}
          />

          <View style={styles.dialog}>
            <Text style={styles.title}>Login History</Text>

            {historyLoading ? (
              <ActivityIndicator size="small" color="#1B5C58" />
            ) : (
              <ScrollView style={styles.logsContainer}>
                {loginLogs.length === 0 ? (
                  <Text style={styles.noLogsText}>No login history found</Text>
                ) : (
                  loginLogs.map((log, index) => (
                    <View key={index} style={styles.logItem}>
                      <View style={styles.logHeader}>
                        <Text style={styles.logDevice}>
                          {log.device.toUpperCase()}
                        </Text>
                        <Text style={styles.logStatus}>
                          {log.success ? 'Success' : 'Failed'}
                        </Text>
                      </View>
                      <Text style={styles.logLocation}>{log.location}</Text>
                      <Text style={styles.logTime}>
                        {log.timestamp?.toDate().toLocaleString()}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.button, styles.submitButton, styles.singleButton]}
              onPress={() => setLoginHistoryVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Logout From all devices Modal */}
      <Modal
        visible={logoutAllVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setLogoutAllVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setLogoutAllVisible(false)}
          />

          <View style={styles.dialog}>
            <Icon
              name="logout-variant"
              size={40}
              color="#e74c3c"
              style={styles.modalIcon}
            />
            <Text style={styles.title}>Log Out Everywhere?</Text>
            <Text style={styles.modalMessage}>
              This will immediately sign you out of all active sessions on other
              devices. You'll need to log in again on this device.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setLogoutAllVisible(false)}>
                <Text style={[styles.buttonText, {color: '#1B5C58'}]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.destructiveButton]}
                onPress={() => {
                  logoutFromAllDevices();
                  setLogoutAllVisible(false);
                }}>
                <Text style={styles.buttonText}>Confirm Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  heroSec: {
    height: 200,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 50,
  },
  heroBackgroundImage: {
    width: 220,
    height: 220,
    position: 'absolute',
    top: -30,
    left: -30,
    opacity: 0.8,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  topBarHeading: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 24,
  },
  bottomContainer: {
    flex: 1,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#1B5C58',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 24,
    marginBottom: 12,
    opacity: 0.8,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#438883',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonTextContainer: {
    marginLeft: 16,
  },
  buttonTitle: {
    color: '#1B5C58',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonSubtitle: {
    color: '#1B5C58',
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },

  //Change Password Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialog: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1B5C58',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    position: 'relative',
  },
  toggleButton: {
    position: 'absolute',
    right: 18,
    top: 14,
  },
  toggleText: {
    color: '#1B5C58',
    fontWeight: 'bold',
    fontSize: 14,
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#1B5C58',
    opacity: 0.9,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  //History Modal styles
  logsContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  logItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logDevice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B5C58',
  },
  logStatus: {
    fontSize: 12,
    color: '#438883',
    fontWeight: '600',
  },
  logLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  logTime: {
    fontSize: 10,
    color: '#999',
  },
  noLogsText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 16,
  },
  singleButton: {
    width: '100%',
    justifyContent: 'center',
  },

  // Logout Modal styles
  modalIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  destructiveButton: {
    backgroundColor: '#e74c3c',
  },
});

export default LoginSecurity;
