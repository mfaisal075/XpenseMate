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
import LinearGradient from 'react-native-linear-gradient';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../../FirebaseConfig';
import {signOut} from 'firebase/auth';
import Toast from 'react-native-toast-message';
import {doc, getDoc} from 'firebase/firestore';

const Profile = ({
  tabChange,
  navigateToNotification,
  goToAccountDetails,
  navigateToLogin,
}: any) => {
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');

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
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            signOut(FIREBASE_AUTH)
              .then(() => {
                navigateToLogin();
                Toast.show({
                  type: 'success',
                  text1: 'Logged Out',
                  text2: 'You have been successfully logged out',
                });
              })
              .catch(error => {
                console.error('Error signing out: ', error);
              });
          },
        },
      ],
      {cancelable: false},
    );
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
          <TouchableOpacity
            style={styles.notificationConatiner}
            onPress={navigateToNotification}>
            <View style={styles.notificationRedCircle} />
            <Image
              source={require('../assets/notification.png')}
              style={{width: 22, height: 22, tintColor: '#fff'}}
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
            {userName ? userName : '@username'}
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
              <Text style={styles.optBtnTxt}>Account Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optContainer}>
            <TouchableOpacity style={styles.optBtn}>
              <Image
                source={require('../assets/secure.png')}
                style={{width: 25, height: 25, tintColor: '#000'}}
                resizeMode="contain"
              />
              <Text style={styles.optBtnTxt}>Login and Security</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optContainer}>
            <TouchableOpacity style={styles.optBtn}>
              <Image
                source={require('../assets/padlock.png')}
                style={{width: 25, height: 25, tintColor: '#000'}}
                resizeMode="contain"
              />
              <Text style={styles.optBtnTxt}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optContainer}>
            <TouchableOpacity style={styles.optBtn}>
              <Image
                source={require('../assets/setting.png')}
                style={{width: 25, height: 25, tintColor: '#000'}}
                resizeMode="contain"
              />
              <Text style={styles.optBtnTxt}>Settings</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optContainer}>
            <TouchableOpacity style={styles.optBtn}>
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationRedCircle: {
    height: 8,
    width: 8,
    borderRadius: 5,
    backgroundColor: 'red',
    position: 'absolute',
    top: 12,
    right: 10,
    zIndex: 1,
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
});
