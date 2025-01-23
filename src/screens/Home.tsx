import {Alert, Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import Main from '../bottom/Main';
import Wallet from '../bottom/Wallet';
import Profile from '../bottom/Profile';
import Stats from '../bottom/Stats';
import {FIREBASE_AUTH} from '../../FirebaseConfig';
import AccountDetails from '../bottom/AccountDetails';
import {Text} from 'react-native-paper';

const Home = ({navigation}: any) => {
  const [selectedTab, setSelectedTab] = useState('Main');

  const changeTab = () => {
    setSelectedTab('Main');
  };
  const goToAccountDetails = () => {
    setSelectedTab('AccountDetails');
  };
  const goToProfile = () => {
    setSelectedTab('Profile');
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
      Alert.alert('Error', 'Please login to continue', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Login'),
        },
      ]);
    }
  }, []);

  return (
    <View style={styles.mainContainer}>
      {selectedTab === 'Main' ? (
        <Main navigateToNotification={() => goToNotification()} />
      ) : selectedTab === 'Stats' ? (
        <Stats tabChange={() => changeTab()} />
      ) : selectedTab === 'Wallet' ? (
        <Wallet
          tabChange={() => changeTab()}
          navigateToNotification={() => goToNotification()}
        />
      ) : selectedTab === 'AccountDetails' ? (
        <AccountDetails
          goToProfile={() => goToProfile()}
          navigateToNotification={() => goToNotification()}
        />
      ) : (
        <Profile
          tabChange={() => changeTab()}
          navigateToNotification={() => goToNotification()}
          goToAccountDetails={() => goToAccountDetails()}
          navigateToLogin={() => navigateToLogin()}
        />
      )}
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
    width: 28,
    height: 28,
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
