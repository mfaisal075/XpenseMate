import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {openDatabase} from '../../database';
import Toast from 'react-native-toast-message';

const BudgetManagement = ({navigateToSetting}: any) => {
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

  const handleAddMonthlyBudget = async () => {
    if (!monthlyBudget || isNaN(Number(monthlyBudget))) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Input',
        text2: 'Please enter a valid budget amount.',
        visibilityTime: 2000,
      });
      return;
    }
    try {
      const db = await openDatabase();
      let isBudgetExists = false;

      await db.transaction(async tx => {
        const results = await new Promise<any>((resolve, reject) => {
          tx.executeSql(
            'SELECT * FROM monthly_budget WHERE month = ? AND year = ?',
            [selectedMonth + 1, selectedYear],
            (_, result) => resolve(result),
            (_, error) => reject(error),
          );
        });

        if (results.rows.length > 0) {
          isBudgetExists = true;
        }
      });

      if (isBudgetExists) {
        Toast.show({
          type: 'info',
          text1: 'Budget Exists',
          text2: 'A budget for this month is already added.',
          visibilityTime: 2000,
        });
        return;
      }

      await db.transaction(async tx => {
        tx.executeSql(
          'INSERT INTO monthly_budget (month, year, budget, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [
            selectedMonth + 1,
            selectedYear,
            parseFloat(monthlyBudget),
            'Y',
            new Date().toISOString(),
            new Date().toISOString(),
          ],
        );
      });

      Toast.show({
        type: 'success',
        text1: 'Budget Added',
        text2: 'Monthly budget has been successfully added.',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error adding monthly budget:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while adding the budget.',
        visibilityTime: 2000,
      });
    }
  };

  useEffect(() => {
    const backAction = () => {
      navigateToSetting();
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
          <TouchableOpacity
            onPress={navigateToSetting}
            style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topBarHeading}>Budget Management</Text>
        </View>
      </LinearGradient>

      <View style={styles.bottomContainer}>
        {/* Current Budgets Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Budgets</Text>
          {/* Add your budget list items here */}
        </View>

        {/* Add Budget Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setBudgetModalVisible(true)}>
            <View style={styles.buttonContent}>
              <Icon name="plus-circle" size={24} color="#1B5C58" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Add New Budget</Text>
                <Text style={styles.buttonSubtitle}>
                  Set monthly spending limit
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#1B5C58" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Budget Modal */}
      <Modal
        visible={isBudgetModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setBudgetModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPressOut={() => setBudgetModalVisible(false)}>
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

            {/* Action Buttons */}
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setBudgetModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  if (monthlyBudget && !isNaN(Number(monthlyBudget))) {
                    // Handle save logic here
                    setBudgetModalVisible(false);
                  }
                }}>
                <Text style={styles.saveButtonText}>Save Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Month Picker Modal */}
      <Modal visible={showMonthPicker} transparent={true} animationType="fade">
        <View style={styles.monthPickerBackdrop}>
          <View style={styles.monthPickerContainer}>
            <View style={styles.monthPickerHeader}>
              <Text style={styles.monthPickerTitle}>Select Month</Text>
              <TouchableOpacity
                onPress={() => setShowMonthPicker(false)}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="#1B5C58" />
              </TouchableOpacity>
            </View>

            <View style={styles.yearSelector}>
              <TouchableOpacity
                onPress={() => setSelectedYear(prev => prev - 1)}
                style={styles.chevronButton}>
                <Icon name="chevron-left" size={24} color="#1B5C58" />
              </TouchableOpacity>
              <Text style={styles.selectedYear}>{selectedYear}</Text>
              <TouchableOpacity
                onPress={() => setSelectedYear(prev => prev + 1)}
                style={styles.chevronButton}>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    color: '#1B5C58',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  monthPickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
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
    color: '#1B5C58',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#EEF8F7',
    borderWidth: 1,
    borderColor: '#1B5C58',
  },
  saveButton: {
    backgroundColor: '#1B5C58',
  },
  cancelButtonText: {
    color: '#1B5C58',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  //Month picker modal
  monthPickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthPickerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  monthPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  monthPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B5C58',
  },
  closeButton: {
    padding: 8,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  selectedYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B5C58',
    marginHorizontal: 20,
  },
  chevronButton: {
    padding: 10,
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
    backgroundColor: '#F5F5F5',
  },
  selectedMonthButton: {
    backgroundColor: '#1B5C58',
  },
  monthText: {
    color: '#1B5C58',
    fontSize: 14,
  },
  selectedMonthText: {
    color: 'white',
  },
});

export default BudgetManagement;
