import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import {useTransactionContext} from '../components/TransactionContext';
import {useCurrency} from '../components/CurrencyContext';
import {Dialog, Portal} from 'react-native-paper';

const BudgetManagement = ({navigateToSetting}: any) => {
  const {
    monthlyBudgets,
    fetchMonthlyBudgets,
    addMonthlyBudget,
    deleteMonthlyBudget,
    updateMonthlyBudget,
  } = useTransactionContext();
  const {getCurrencySymbol} = useCurrency();
  const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<{
    id: number;
    budget: number;
  } | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

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

  const handleSaveBudget = async () => {
    if (!monthlyBudget || isNaN(Number(monthlyBudget))) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Input',
        text2: 'Please enter valid amount',
      });
      return;
    }

    try {
      await addMonthlyBudget(
        selectedMonth + 1,
        selectedYear,
        parseFloat(monthlyBudget),
      );
      setBudgetModalVisible(false);
      setMonthlyBudget('');
    } catch (error) {
      console.log('Error saving budget:', error);
    }
  };

  const handleEditBudget = async () => {
    if (!monthlyBudget || isNaN(Number(monthlyBudget))) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Input',
        text2: 'Please enter valid amount',
      });
      return;
    }

    try {
      if (selectedBudget) {
        await updateMonthlyBudget(selectedBudget.id, parseFloat(monthlyBudget));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No budget selected for update',
        });
        return;
      }
      setIsEditModalVisible(false);
      setMonthlyBudget('');
      setSelectedBudget(null);
      fetchMonthlyBudgets();
      Toast.show({
        type: 'success',
        text1: 'Budget Updated',
        text2: 'Monthly budget has been updated successfully',
      });
    } catch (error) {
      console.log('Error updating budget:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Failed to update budget',
      });
    }
  };

  useEffect(() => {
    fetchMonthlyBudgets();
    const backAction = () => {
      navigateToSetting();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [fetchMonthlyBudgets]);

  const BudgetCard = ({item}: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text
          style={{
            color: '#1B5C58',
            fontSize: 16,
            fontWeight: '600',
          }}>
          {new Date(item.year, item.month - 1).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => {
              setSelectedBudget(item);
              setSelectedMonth(item.month - 1); // Convert to 0-based index
              setSelectedYear(item.year);
              setMonthlyBudget(item.budget.toString());
              setIsEditModalVisible(true);
            }}
            style={styles.actionButton}>
            <Icon name="pencil" size={20} color="#1B5C58" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setBudgetToDelete(item.id);
              setDeleteDialogVisible(true);
            }}
            style={styles.actionButton}>
            <Icon name="delete" size={20} color="#D9534F" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.budgetText}>
          {getCurrencySymbol()}
          {item.budget.toFixed(2)}
        </Text>
      </View>
    </View>
  );

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

        {/* Monthly budgets cards */}
        <FlatList
          data={monthlyBudgets}
          renderItem={BudgetCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No budgets set yet</Text>
          }
        />
      </View>

      {/* Add Budget Modal */}
      <Modal
        visible={isBudgetModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setBudgetModalVisible(false);
          setMonthlyBudget('');
          setSelectedMonth(new Date().getMonth());
          setSelectedYear(new Date().getFullYear());
        }}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPressOut={() => {
            setBudgetModalVisible(false);
            setMonthlyBudget('');
            setSelectedMonth(new Date().getMonth());
            setSelectedYear(new Date().getFullYear());
          }}>
          <Toast />
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
                onPress={() => {
                  setBudgetModalVisible(false);
                  setMonthlyBudget('');
                  setSelectedMonth(new Date().getMonth());
                  setSelectedYear(new Date().getFullYear());
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  handleSaveBudget();
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

      {/* Delete Budget Confirmation Dialog */}
      <Portal>
        <Toast />
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={styles.deleteDialog}>
          <Dialog.Title style={styles.deleteDialogTitle}>
            <View style={styles.deleteHeader}>
              <Icon
                name="delete-alert"
                size={32}
                color="#D9534F"
                style={styles.deleteIcon}
              />
              <Text style={styles.deleteTitleText}>Delete Budget</Text>
            </View>
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.deleteDialogText}>
              Are you sure you want to delete this budget? This action cannot be
              undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <TouchableOpacity
              onPress={() => setDeleteDialogVisible(false)}
              style={{
                backgroundColor: '#E0E0E0',
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 20,
                marginHorizontal: 8,
                minWidth: 80,
                alignItems: 'center',
              }}>
              <Text style={{color: '#000', fontSize: 14, fontWeight: '600'}}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                try {
                  if (budgetToDelete !== null) {
                    await deleteMonthlyBudget(budgetToDelete);
                  }
                  await fetchMonthlyBudgets();
                  setDeleteDialogVisible(false);
                } catch (error) {
                  console.log('Error deleting budget:', error);
                }
              }}
              style={{
                backgroundColor: '#D9534F',
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 20,
                marginHorizontal: 8,
                minWidth: 80,
                alignItems: 'center',
              }}>
              <Text style={{color: '#fff', fontSize: 14, fontWeight: '600'}}>
                Delete
              </Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Budget Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setIsEditModalVisible(false);
          setMonthlyBudget('');
          setSelectedBudget(null);
        }}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPressOut={() => {
            setIsEditModalVisible(false);
            setMonthlyBudget('');
            setSelectedBudget(null);
          }}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Budget</Text>

            {/* Disabled Month/Year Picker */}
            <View style={styles.monthPickerButton}>
              <Text style={styles.monthPickerText}>
                {months[selectedMonth]} {selectedYear}
              </Text>
              <Icon name="calendar-month" size={20} color="#1B5C58" />
            </View>

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
                onPress={() => {
                  setIsEditModalVisible(false);
                  setMonthlyBudget('');
                  setSelectedBudget(null);
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditBudget}>
                <Text style={styles.saveButtonText}>Update Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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

  //Budegt cards styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  budgetText: {
    color: '#438883',
    fontSize: 18,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 14,
  },

  //Delete dialog styles
  deleteHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteIcon: {
    marginBottom: 8,
  },
  deleteTitleText: {
    color: '#1B5C58',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteDialog: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  deleteDialogTitle: {
    paddingHorizontal: 0,
    marginHorizontal: 0,
    textAlign: 'center',
  },
  deleteDialogText: {
    color: '#666',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 0,
  },
});

export default BudgetManagement;
