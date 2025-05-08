import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import Main from '../bottom/Main';
import Wallet from '../bottom/Wallet';
import Profile from '../bottom/Profile';
import Stats from '../bottom/Stats';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../../FirebaseConfig';
import AccountDetails from '../bottom/AccountDetails';
import {Text} from 'react-native-paper';
import LoginSecurity from '../bottom/LoginSecurity';
import {doc, onSnapshot} from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import {signOut} from 'firebase/auth';
import Setting from '../bottom/Setting';
import PrivacyPolicy from '../bottom/PrivacyPolicy';
import ContactUs from '../bottom/ContactUs';
import AllTxns from '../bottom/AllTxns';
import BudgetManagement from '../bottom/BudgetManagement';
import OBAdjustment from '../bottom/OBAdjustment';
import TwoFactorAuth from '../bottom/TwoFactorAuth';

const Home = ({navigation}: any) => {
  const [selectedTab, setSelectedTab] = useState('Main');

  const changeTab = () => {
    setSelectedTab('Main');
  };
  const goToAccountDetails = () => {
    setSelectedTab('AccountDetails');
  };
  const goToLoginAndSecurity = () => {
    setSelectedTab('LoginSecurity');
  };
  const navigateToSetting = () => {
    setSelectedTab('Setting');
  };
  const navigateToBudgetManagement = () => {
    setSelectedTab('BudgetManagement');
  };
  const navigateToPrivacyPolicy = () => {
    setSelectedTab('PrivacyPolicy');
  };
  const navigateToContact = () => {
    setSelectedTab('ContactUs');
  };
  const goToProfile = () => {
    setSelectedTab('Profile');
  };
  const goToAllTxns = () => {
    setSelectedTab('AllTxns');
  };
  const navigateToOBAdjustment = () => {
    setSelectedTab('OBAdjustment');
  };
  const navigateToWallet = () => {
    setSelectedTab('Wallet');
  };
  const navigateToTwoFactorAuth = () => {
    setSelectedTab('TwoFactorAuth');
  };

  const goToNotification = () => {
    navigation.navigate('Notification');
    return;
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  useEffect(() => {
    const auth = FIREBASE_AUTH;
    const user = auth.currentUser;

    if (!user) {
      // Show toast first
      Toast.show({
        type: 'error',
        text1: 'Session expired',
        text2: 'Please login to continue',
        visibilityTime: 2000,
      });

      setTimeout(() => {
        navigation.replace('Login');
      }, 2000);

      return;
    }

    const unsubscribeSnapshot = onSnapshot(
      doc(FIRESTORE_DB, 'users', user.uid),
      docSnap => {
        const data = docSnap.data();
        if (data?.forceLogout) {
          Toast.show({
            type: 'info',
            text1: 'Logged out',
            text2: 'You have been logged out from another device.',
          });
          signOut(FIREBASE_AUTH)
            .then(() => {
              navigation.replace('Login');
            })
            .catch(error => {
              console.error('Sign out error:', error);
            });
        }
      },
    );

    // Clean up the Firestore listener on unmount
    return () => unsubscribeSnapshot();
  }, [navigation]);

  return (
    <View style={styles.mainContainer}>
      {selectedTab === 'Main' ? (
        <Main
          navigateToNotification={() => goToNotification()}
          goToAllTxns={() => goToAllTxns()}
        />
      ) : selectedTab === 'AllTxns' ? (
        <AllTxns tabChange={() => changeTab()} />
      ) : selectedTab === 'Stats' ? (
        <Stats tabChange={() => changeTab()} />
      ) : selectedTab === 'Wallet' ? (
        <Wallet
          tabChange={() => changeTab()}
          navigateToNotification={() => goToNotification()}
          navigateToOBAdjustment={() => navigateToOBAdjustment()}
        />
      ) : selectedTab === 'OBAdjustment' ? (
        <OBAdjustment navigateToWallet={() => navigateToWallet()} />
      ) : selectedTab === 'AccountDetails' ? (
        <AccountDetails
          goToProfile={() => goToProfile()}
          navigateToNotification={() => goToNotification()}
        />
      ) : selectedTab === 'LoginSecurity' ? (
        <LoginSecurity
          goToProfile={() => goToProfile()}
          navigateToTwoFactorAuth={() => navigateToTwoFactorAuth()}
        />
      ) : selectedTab === 'TwoFactorAuth' ? (
        <TwoFactorAuth />
      ) : selectedTab === 'Setting' ? (
        <Setting
          goToProfile={() => goToProfile()}
          navigateToContact={() => navigateToContact()}
          navigateToBudgetManagement={() => navigateToBudgetManagement()}
        />
      ) : selectedTab === 'BudgetManagement' ? (
        <BudgetManagement navigateToSetting={() => navigateToSetting()} />
      ) : selectedTab === 'PrivacyPolicy' ? (
        <PrivacyPolicy goToProfile={() => goToProfile()} />
      ) : selectedTab === 'ContactUs' ? (
        <ContactUs goToProfile={() => goToProfile()} />
      ) : (
        <Profile
          tabChange={() => changeTab()}
          navigateToNotification={() => goToNotification()}
          goToAccountDetails={() => goToAccountDetails()}
          navigateToLogin={() => navigateToLogin()}
          goToLoginAndSecurity={() => goToLoginAndSecurity()}
          navigateToSetting={() => navigateToSetting()}
          navigateToPrivacyPolicy={() => navigateToPrivacyPolicy()}
          navigateToContact={() => navigateToContact()}
        />
      )}
      {selectedTab === 'AccountDetails' ||
      selectedTab === 'LoginSecurity' ||
      selectedTab === 'Setting' ||
      selectedTab === 'PrivacyPolicy' ||
      selectedTab === 'ContactUs' ||
      selectedTab === 'AllTxns' ||
      selectedTab === 'BudgetManagement' ||
      selectedTab === 'OBAdjustment' ||
      selectedTab === 'TwoFactorAuth' ? null : (
        <View style={styles.barContainer}>
          <TouchableOpacity
            style={styles.btnContainer}
            onPress={() => setSelectedTab('Main')}>
            <Image
              source={
                selectedTab === 'Main'
                  ? require('../assets/home.png')
                  : require('../assets/home1.png')
              }
              style={styles.bottomIcon}
              resizeMode="contain"
            />
            <Text
              style={
                selectedTab === 'Main'
                  ? styles.btnText
                  : {color: 'gray', fontSize: 12, fontWeight: 'bold'}
              }>
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnContainer}
            onPress={() => setSelectedTab('Stats')}>
            <Image
              source={
                selectedTab === 'Stats'
                  ? require('../assets/stats.png')
                  : require('../assets/stats1.png')
              }
              style={styles.bottomIcon}
              resizeMode="contain"
            />
            <Text
              style={
                selectedTab === 'Stats'
                  ? styles.btnText
                  : {color: 'gray', fontSize: 12, fontWeight: 'bold'}
              }>
              Stats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnContainer}
            onPress={() => setSelectedTab('Wallet')}>
            <Image
              source={
                selectedTab === 'Wallet'
                  ? require('../assets/list.png')
                  : require('../assets/list-outline.png')
              }
              style={styles.bottomIcon}
              resizeMode="contain"
            />
            <Text
              style={
                selectedTab === 'Wallet'
                  ? styles.btnText
                  : {color: 'gray', fontSize: 12, fontWeight: 'bold'}
              }>
              Menu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnContainer}
            onPress={() => setSelectedTab('Profile')}>
            <Image
              source={
                selectedTab === 'Profile' || selectedTab === 'AccountDetails'
                  ? require('../assets/user.png')
                  : require('../assets/user1.png')
              }
              style={styles.bottomIcon}
              resizeMode="contain"
            />
            <Text
              style={
                selectedTab === 'Profile'
                  ? styles.btnText
                  : {color: 'gray', fontSize: 12, fontWeight: 'bold'}
              }>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#EEF8F7',
  },
  barContainer: {
    width: '100%',
    height: 70,
    position: 'absolute',
    backgroundColor: '#fff',
    bottom: 0,
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomIcon: {
    width: 25,
    height: 25,
    tintColor: '#438883',
  },
  btnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#438883',
  },
});
