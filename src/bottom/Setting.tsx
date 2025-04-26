import {
  BackHandler,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {useCurrency} from '../components/CurrencyContext';
import {useTransactionContext} from '../components/TransactionContext';

const Setting = ({goToProfile, navigateToContact}: any) => {
  const {currency, setCurrency} = useCurrency();
  const {exportToExcel, importDataFromExcel} = useTransactionContext();
  const [isCurrencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [isNotificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

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
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setBudgetModalVisible(true)}>
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

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setNotificationModalVisible(true)}>
            <View style={styles.buttonContent}>
              <Icon name="bell" size={24} color="#1B5C58" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Notifications</Text>
                <Text style={styles.buttonSubtitle}>
                  {notificationEnabled ? 'Enabled' : 'Disabled'}{' '}
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#1B5C58" />
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={navigateToContact}>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={importDataFromExcel}>
            <View style={styles.buttonContent}>
              <Icon name="database-import" size={24} color="#1B5C58" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Import Data</Text>
                <Text style={styles.buttonSubtitle}>
                  Restore from backup file
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#1B5C58" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={exportToExcel}>
            <View style={styles.buttonContent}>
              <Icon name="database-export" size={24} color="#1B5C58" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Export Data</Text>
                <Text style={styles.buttonSubtitle}>Create backup file</Text>
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
          onPress={e => {
            if (e.target === e.currentTarget) {
              setCurrencyModalVisible(false);
            }
          }}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <CurrencyOption currency="USD" name="US Dollar" />
            <CurrencyOption currency="INR" name="Indian Rupee" />
            <CurrencyOption currency="PKR" name="Pakistani Rupee" />
          </View>
        </TouchableOpacity>
      )}

      {/* Notification Modal */}
      <Modal
        visible={isNotificationModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotificationModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPressOut={() => setNotificationModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Notification Settings</Text>
            <View style={styles.notificationOption}>
              <Text style={styles.currencyText}>Enable Notifications</Text>
              <Switch
                value={notificationEnabled}
                onValueChange={value => setNotificationEnabled(value)}
                thumbColor={notificationEnabled ? '#1B5C58' : '#f4f3f4'}
                trackColor={{false: '#767577', true: '#43888380'}}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Budget Modal */}
      {isBudgetModalVisible && (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalBackdrop}
          onPress={e => {
            if (e.target === e.currentTarget) {
              setBudgetModalVisible(false);
            }
          }}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Set Monthly Budget</Text>

            {/* Month/Year Picker */}
            <TouchableOpacity
              style={styles.monthPickerButton}
              onPress={() => setShowMonthPicker(true)}>
              <Text style={styles.monthPickerText}>
                {months[selectedMonth]} {selectedYear}
              </Text>
              <Icon name="calendar-month" size={20} color="#1B5C58" />
            </TouchableOpacity>

            {/* Budget Input */}
            <TextInput
              placeholder="Enter budget amount"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={monthlyBudget}
              onChangeText={setMonthlyBudget}
              style={styles.budgetInput}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setBudgetModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  // Handle saving budget with month/year
                  if (monthlyBudget && !isNaN(Number(monthlyBudget))) {
                    
                    setBudgetModalVisible(false);
                  }
                }}>
                <Text style={styles.saveButtonText}>Save Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Month Picker Modal */}
      <Modal visible={showMonthPicker} transparent={true} animationType="slide">
        <View style={styles.monthPickerContainer}>
          <View style={styles.monthPickerHeader}>
            <Text style={styles.monthPickerTitle}>Select Month</Text>
            <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
              <Icon name="close" size={24} color="#1B5C58" />
            </TouchableOpacity>
          </View>

          <View style={styles.yearSelector}>
            <TouchableOpacity onPress={() => setSelectedYear(prev => prev - 1)}>
              <Icon name="chevron-left" size={24} color="#1B5C58" />
            </TouchableOpacity>
            <Text style={styles.selectedYear}>{selectedYear}</Text>
            <TouchableOpacity onPress={() => setSelectedYear(prev => prev + 1)}>
              <Icon name="chevron-right" size={24} color="#1B5C58" />
            </TouchableOpacity>
          </View>

          <View style={styles.monthGrid}>
            {months.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.monthButton,
                  selectedMonth === index && styles.selectedMonthButton,
                ]}
                onPress={() => {
                  setSelectedMonth(index);
                  setShowMonthPicker(false);
                }}>
                <Text
                  style={[
                    styles.monthText,
                    selectedMonth === index && styles.selectedMonthText,
                  ]}>
                  {month.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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

  //Notification Modal Styling
  notificationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },

  //set budget modal styling
  monthPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  monthPickerText: {
    color: '#1B5C58',
    fontSize: 16,
  },
  budgetInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#1B5C58',
    fontSize: 16,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#1B5C58',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#eee',
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#1B5C58',
    fontWeight: '600',
  },
  monthPickerContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 50,
    borderRadius: 12,
    padding: 16,
  },
  monthPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthPickerTitle: {
    color: '#1B5C58',
    fontSize: 18,
    fontWeight: '600',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  selectedYear: {
    color: '#1B5C58',
    fontSize: 18,
    marginHorizontal: 16,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedMonthButton: {
    backgroundColor: '#1B5C58',
  },
  monthText: {
    color: '#1B5C58',
  },
  selectedMonthText: {
    color: 'white',
  },
});

export default Setting;
