import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';

const TwoFactorAuth = ({goToLoginAndSecurity}: any) => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [confirm, setConfirm] = useState<any>(null);

  const handle2FAToggle = async () => {
    if (is2FAEnabled) {
      // Disable 2FA
      setIs2FAEnabled(false);
      setVerifiedPhone('');
      Toast.show({
        type: 'success',
        text1: '2FA Disabled',
        text2: 'Two-factor authentication has been turned off',
      });
    } else {
      setShowPhoneModal(true);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!phoneNumber) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid phone number',
      });
      return;
    }

    setLoading(true);

    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
      setShowPhoneModal(false);
      setShowCodeModal(true);

      Toast.show({
        type: 'success',
        text1: 'Code Sent',
        text2: 'Verification code sent to your phone',
      });
    } catch (error: any) {
      console.error('Error sending code:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to send code',
        text2: error.message || 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter the verification code',
      });
      return;
    }

    if (!confirm) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No confirmation object. Please request code again.',
      });
      return;
    }

    setLoading(true);

    try {
      await confirm.confirm(verificationCode);
      setShowCodeModal(false);
      setIs2FAEnabled(true);
      setVerifiedPhone(phoneNumber); // Save the verified number
      setPhoneNumber('');
      setVerificationCode('');
      setConfirm(null); // Clear confirmation object

      Toast.show({
        type: 'success',
        text1: '2FA Enabled',
        text2: 'Phone number verification successful',
      });
    } catch (error: any) {
      console.error('Verification failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: error.message || 'The verification code is incorrect',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B5C58', '#438883']} style={styles.heroSec}>
        <Image
          source={require('../assets/ellipse.png')}
          style={styles.heroBackgroundImage}
          resizeMode="contain"
        />
        <View style={styles.topContainer}>
          <TouchableOpacity
            onPress={() => goToLoginAndSecurity()}
            style={styles.backButton}>
            <Image
              source={require('../assets/back.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.topBarHeading}>Two-Factor Authentication</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.bottomContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phone Verification</Text>

          <TouchableOpacity style={styles.menuButton} onPress={handle2FAToggle}>
            <View style={styles.buttonContent}>
              <Icon
                name={is2FAEnabled ? 'shield-check' : 'shield-off'}
                size={24}
                color="#1B5C58"
              />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>
                  {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </Text>
                <Text style={styles.buttonSubtitle}>
                  {is2FAEnabled
                    ? `Active with phone number: ${verifiedPhone}`
                    : 'Add phone number verification'}
                </Text>
              </View>
            </View>
            <Icon
              name={is2FAEnabled ? 'toggle-switch' : 'toggle-switch-off'}
              size={32}
              color="#1B5C58"
            />
          </TouchableOpacity>

          {is2FAEnabled && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowPhoneModal(true)}>
              <View style={styles.buttonContent}>
                <Icon name="cellphone" size={24} color="#1B5C58" />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitle}>Update Phone Number</Text>
                  <Text style={styles.buttonSubtitle}>
                    Change your verified phone number
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color="#1B5C58" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Phone Number Input Modal */}
      <Modal
        visible={showPhoneModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowPhoneModal(false)}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.overlay} />
          <Toast />
          <View style={styles.dialog}>
            <Text style={styles.modalTitle}>Verify Phone Number</Text>
            <Text style={styles.modalSubtitle}>
              Enter your phone number to receive a verification code
            </Text>

            <TextInput
              placeholder="+923001234567"
              placeholderTextColor="#888"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.input}
              keyboardType="phone-pad"
              autoFocus
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPhoneModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleSendVerificationCode}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>Send Code</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Verification Code Modal */}
      <Modal
        visible={showCodeModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCodeModal(false)}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.overlay} />
          <Toast />
          <View style={styles.dialog}>
            <Text style={styles.modalTitle}>Enter Verification Code</Text>
            <Text style={styles.modalSubtitle}>
              Enter the 6-digit code sent to {phoneNumber}
            </Text>

            <TextInput
              placeholder="123456"
              placeholderTextColor="#888"
              value={verificationCode}
              onChangeText={setVerificationCode}
              style={styles.input}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCodeModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleVerifyCode}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>Verify</Text>
                )}
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1B5C58',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  sendButton: {
    backgroundColor: '#1B5C58',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default TwoFactorAuth;
