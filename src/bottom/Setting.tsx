import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React, {useEffect} from 'react';
import LinearGradient from 'react-native-linear-gradient';

const Setting = ({goToProfile}: any) => {
  useEffect(() => {
    const backAction = () => {
      goToProfile();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B5C58', '#438883']} style={styles.heroSec}>
        <View style={styles.topContainer}>
          <TouchableOpacity onPress={goToProfile} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topBarHeading}>Settings</Text>
        </View>
      </LinearGradient>

      <View style={styles.bottomContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          <TouchableOpacity style={styles.menuButton}>
            <View style={styles.buttonContent}>
              <Icon name="wallet" size={24} color="#1B5C58" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Set Budget</Text>
                <Text style={styles.buttonSubtitle}>
                  Monthly spending limit
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#1B5C58" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton}>
            <View style={styles.buttonContent}>
              <Icon name="cash-multiple" size={24} color="#1B5C58" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Default Currency</Text>
                <Text style={styles.buttonSubtitle}>USD - US Dollar</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#1B5C58" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton}>
            <View style={styles.buttonContent}>
              <Icon name="bell" size={24} color="#1B5C58" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Notifications</Text>
                <Text style={styles.buttonSubtitle}>Manage preferences</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#1B5C58" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.menuButton}>
            <View style={styles.buttonContent}>
              <Icon name="help-circle" size={24} color="#1B5C58" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Help & Support</Text>
                <Text style={styles.buttonSubtitle}>Contact our team</Text>
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
    height: 160,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 50,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
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

export default Setting;
