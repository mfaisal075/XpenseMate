import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import {openDatabase} from '../../database';
import {useTransactionContext} from '../components/TransactionContext';
import {useCurrency} from '../components/CurrencyContext';

const OBAdjustment = ({navigateToWallet}: any) => {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const {adjustments, fetchAdjustments} = useTransactionContext();
  const [selectedAdjustment, setSelectedAdjustment] = useState<any>(null);
  const {getCurrencySymbol} = useCurrency();

  useEffect(() => {
    fetchAdjustments();

    const backAction = () => {
      navigateToWallet();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const handleAddAdjustment = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid amount',
      });
      return;
    }

    try {
      const db = openDatabase();
      const createdDate = new Date().toISOString().split('T')[0];
      const [result] = await (
        await db
      ).executeSql(
        'SELECT COUNT(*) as count FROM opening_balance WHERE status = ?',
        ['OB'],
      );

      const count = result.rows.item(0).count;
      if (count === 0) {
        Toast.show({
          type: 'info',
          text1: 'No Opening Balance',
          text2: 'No opening balance found.',
        });
        return;
      }

      (await db).transaction(tx => {
        tx.executeSql(
          'UPDATE opening_balance SET status = ? WHERE status = ?',
          ['N', 'OB'],
        );
        tx.executeSql('UPDATE adjustments SET status = ? WHERE status = ?', [
          'N',
          'OB',
        ]);

        tx.executeSql(
          'INSERT INTO opening_balance (amount, date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [
            amount,
            date.toISOString().split('T')[0],
            'OB',
            createdDate,
            createdDate,
          ],
        );

        tx.executeSql(
          'INSERT INTO adjustments (amount, date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [
            amount,
            date.toISOString().split('T')[0],
            'OB',
            createdDate,
            createdDate,
          ],
        );
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Adjustment added successfully.',
      });

      fetchAdjustments();
      setShowModal(false);
      setAmount('');
      setDate(new Date());
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while checking the opening balance.',
      });
    }
  };

  const AdjustmentCard = ({item}: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>
          {new Date(item.date).toLocaleDateString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric',
          })}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.amountText}>
          {getCurrencySymbol()} {item.amount.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B5C58', '#438883']} style={styles.heroSec}>
        <View style={styles.topContainer}>
          <TouchableOpacity
            onPress={navigateToWallet}
            style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topBarHeading}>Opening Balance Adjustment</Text>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowModal(true)}>
            <View style={styles.buttonContent}>
              <Icon name="plus-circle" size={24} color="#1B5C58" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Add Adjustment</Text>
                <Text style={styles.buttonSubtitle}>
                  Adjust your balance if needed
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#1B5C58" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={adjustments}
          renderItem={AdjustmentCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No adjustments added yet</Text>
          }
        />
      </View>

      {/* Add/Edit Adjustment Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Toast />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedAdjustment ? 'Edit Adjustment' : 'Add Adjustment'}
            </Text>

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
              <Icon name="calendar" size={20} color="#1B5C58" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowModal(false);
                  setSelectedAdjustment(null);
                  setAmount('');
                  setDate(new Date());
                }}>
                <Text style={[styles.buttonText, {color: '#000'}]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddAdjustment}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
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
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  addButton: {
    backgroundColor: '#1B5C58',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  cardDate: {
    color: '#1B5C58',
    fontSize: 14,
    fontWeight: '600',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  amountText: {
    color: '#438883',
    fontSize: 18,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1B5C58',
    marginBottom: 24,
    textAlign: 'center',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    marginBottom: 24,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#1B5C58',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  deleteDialog: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
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
  deleteDialogText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  dialogButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#D9534F',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  section: {
    marginBottom: 24,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
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
  badge: {
    backgroundColor: '#1B5C58',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default OBAdjustment;
