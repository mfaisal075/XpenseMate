import {
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginSecurity = ({goToProfile}: any) => {
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
            onPress={() => console.log('Change Password Pressed')}>
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
            onPress={() => console.log('Login activity Pressed')}>
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
            onPress={() => console.log('Logout all devices Pressed')}>
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
});

export default LoginSecurity;
