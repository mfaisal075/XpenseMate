import {
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../../FirebaseConfig';
import {signOut} from 'firebase/auth';
import Toast from 'react-native-toast-message';
import {doc, getDoc} from 'firebase/firestore';
import {ActivityIndicator, Dialog, Portal} from 'react-native-paper';

const Profile = ({
  tabChange,
  goToAccountDetails,
  navigateToPrivacyPolicy,
  navigateToContact,
  goToLoginAndSecurity,
  navigateToSetting,
  navigateToLogin,
}: any) => {
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const fetchUserData = async () => {
    const db = FIRESTORE_DB;
    const auth = FIREBASE_AUTH;
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setName(userData.fullName);
        setUserName(userData.userName);
      }
    }
  };

  useEffect(() => {
    const backBtnPress = () => {
      tabChange();
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backBtnPress);
    fetchUserData();
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const performLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(FIREBASE_AUTH);
      navigateToLogin();
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have been successfully logged out',
      });
    } catch (error) {
      console.error('Error signing out: ', error);
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: 'Could not log out. Please try again.',
      });
    } finally {
      setLogoutLoading(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B5C58', '#438883']} style={styles.heroSec}>
        <Image
          source={require('../assets/ellipse.png')}
          style={{
            width: 180,
            height: 180,
            position: 'absolute',
            top: -5,
            left: -5,
            zIndex: 0,
          }}
          resizeMode="contain"
        />
        <View style={styles.topContainer}>
          <TouchableOpacity onPress={tabChange}>
            <Image
              source={require('../assets/back.png')}
              style={{width: 20, height: 20, tintColor: '#fff'}}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.topBarHeading}>Profile</Text>
          <TouchableOpacity style={styles.notificationConatiner} disabled>
            <Image
              source={require('../assets/notification.png')}
              style={{width: 22, height: 22, tintColor: 'transparent'}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.profileImgContainer}>
          <Image
            source={require('../assets/profile.png')}
            style={{
              width: 120,
              height: 120,
              borderRadius: 50,
              alignSelf: 'center',
            }}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>
      <View style={styles.bottomContainer}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.userName}>
            {userName ? `${userName}` : '@username'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.otherOptContainer}>
          <View style={styles.optContainer}>
            <TouchableOpacity
              style={styles.optBtn}
              onPress={goToAccountDetails}>
              <Image
                source={require('../assets/group.png')}
                style={{width: 30, height: 30, tintColor: '#000'}}
                resizeMode="contain"
              />
              <Text style={styles.optBtnTxt}>Personal Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optContainer}>
            <TouchableOpacity
              style={styles.optBtn}
              onPress={goToLoginAndSecurity}>
              <Image
                source={require('../assets/secure.png')}
                style={{width: 25, height: 25, tintColor: '#000'}}
                resizeMode="contain"
              />
              <Text style={styles.optBtnTxt}>Login and Security</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optContainer}>
            <TouchableOpacity
              style={styles.optBtn}
              onPress={navigateToPrivacyPolicy}>
              <Image
                source={require('../assets/padlock.png')}
                style={{width: 25, height: 25, tintColor: '#000'}}
                resizeMode="contain"
              />
              <Text style={styles.optBtnTxt}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optContainer}>
            <TouchableOpacity style={styles.optBtn} onPress={navigateToSetting}>
              <Image
                source={require('../assets/setting.png')}
                style={{width: 25, height: 25, tintColor: '#000'}}
                resizeMode="contain"
              />
              <Text style={styles.optBtnTxt}>Settings</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optContainer}>
            <TouchableOpacity style={styles.optBtn} onPress={navigateToContact}>
              <Image
                source={require('../assets/phone.png')}
                style={{width: 25, height: 25, tintColor: '#000'}}
                resizeMode="contain"
              />
              <Text style={styles.optBtnTxt}>Contact Us</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optContainer}>
            <TouchableOpacity style={styles.optBtn} onPress={handleLogout}>
              <Image
                source={require('../assets/logout.png')}
                style={{width: 25, height: 25, tintColor: 'red'}}
                resizeMode="contain"
              />
              <Text style={styles.logoutBtnTxt}>Log out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Log out Modal */}
      <Portal>
        <Dialog
          visible={showLogoutModal}
          onDismiss={() => setShowLogoutModal(false)}
          style={styles.dialogContainer}>
          <Dialog.Title style={styles.dialogTitle}>
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'center',
              }}>
              <Image
                source={require('../assets/logout.png')}
                style={{
                  width: 30,
                  height: 30,
                  tintColor: 'red',
                  marginRight: 8,
                }}
                resizeMode="contain"
              />
              <Text style={styles.title}>Logout Confirmation</Text>
            </View>
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Are you sure you want to log out of your account?
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <TouchableOpacity
              style={[styles.dialogButton, styles.cancelButton]}
              onPress={() => setShowLogoutModal(false)}
              disabled={logoutLoading}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dialogButton, {backgroundColor: 'red'}]}
              onPress={performLogout}
              disabled={logoutLoading}>
              {logoutLoading ? (
                <ActivityIndicator color="#fff" size={20} />
              ) : (
                <Text style={styles.confirmButtonText}>Logout</Text>
              )}
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF8F7',
  },
  heroSec: {
    width: '100%',
    height: '26%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 10,
    margin: 20,
    alignItems: 'center',
  },
  notificationConatiner: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarHeading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileImgContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: 140,
  },
  bottomContainer: {
    flex: 1,
  },
  nameContainer: {
    width: '100%',
    height: '15%',
    marginTop: 45,
    alignItems: 'center',
    paddingVertical: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    color: '#438883',
    fontWeight: '600',
    marginTop: 5,
  },
  otherOptContainer: {
    width: '100%',
    height: '80%',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  optContainer: {
    width: '100%',
    height: 40,
    marginBottom: 8,
    borderRadius: 10,
    justifyContent: 'center',
  },
  optBtn: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  optBtnTxt: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 18,
  },
  logoutBtnTxt: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 18,
    color: 'red',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },

  //Logout Modal Styles
  dialogContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  dialogTitle: {
    color: '#1B5C58',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dialogText: {
    color: '#666',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  dialogButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#EEF8F7',
    borderWidth: 1,
    borderColor: '#1B5C58',
  },
  confirmButton: {
    backgroundColor: '#1B5C58',
  },
  cancelButtonText: {
    color: '#1B5C58',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1B5C58',
  },
});
