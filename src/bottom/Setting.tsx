import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {useCurrency} from '../components/CurrencyContext';

const Setting = ({goToProfile}: any) => {
  const {currency, setCurrency} = useCurrency();
  const [isCurrencyModalVisible, setCurrencyModalVisible] = useState(false);

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

  const CurrencyOption = ({
    currency: curr,
    name,
  }: {
    currency: string;
    name: string;
  }) => (
    <TouchableOpacity
      style={styles.currencyOption}
      onPress={() => {
        setCurrency(curr);
        setCurrencyModalVisible(false);
      }}>
      <Text style={styles.currencyText}>{name}</Text>
      {currency === curr && <Icon name="check" size={24} color="#1B5C58" />}
    </TouchableOpacity>
  );

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

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setCurrencyModalVisible(true)}>
            <View style={styles.buttonContent}>
              <Icon name="cash-multiple" size={24} color="#1B5C58" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Default Currency</Text>
                <Text style={styles.buttonSubtitle}>
                  {currency} -{' '}
                  {currency === 'USD'
                    ? 'US Dollar'
                    : currency === 'INR'
                    ? 'Indian Rupee'
                    : 'Pakistani Rupee'}
                </Text>
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

      {isCurrencyModalVisible && (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalBackdrop}
          onPress={() => setCurrencyModalVisible(false)}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <CurrencyOption currency="USD" name="US Dollar" />
            <CurrencyOption currency="INR" name="Indian Rupee" />
            <CurrencyOption currency="PKR" name="Pakistani Rupee" />
          </View>
        </TouchableOpacity>
      )}
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

  //Currency Selctor Styling
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    color: '#1B5C58',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  currencyText: {
    color: '#1B5C58',
    fontSize: 14,
  },
});

export default Setting;
