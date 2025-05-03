import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import {useTransactionContext} from '../components/TransactionContext';
import LinearGradient from 'react-native-linear-gradient';
import DropDownPicker from 'react-native-dropdown-picker';
import {useCurrency} from '../components/CurrencyContext';
import {Dialog, Portal} from 'react-native-paper';
import {Transaction} from '../components/Interface';
import DatePicker from 'react-native-date-picker';

const AllTxns = ({tabChange}: any) => {
  const {transactions, fetchTransactions} = useTransactionContext();
  const {getCurrencySymbol} = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [openType, setOpenType] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);

  useEffect(() => {
    fetchTransactions();
    const backBtnPress = () => {
      tabChange();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backBtnPress,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  // Modify the filter logic
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || t.type === selectedType;

    const txnDate = new Date(t.date);
    const matchesFromDate = fromDate
      ? txnDate >= new Date(fromDate.setHours(0, 0, 0, 0))
      : true;
    const matchesToDate = toDate
      ? txnDate <= new Date(toDate.setHours(23, 59, 59, 999))
      : true;

    return matchesSearch && matchesType && matchesFromDate && matchesToDate;
  });

  const detailsModalHandler = (item: any) => {
    setSelectedTransaction(item);
    setDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedTransaction(null);
  };

  const renderItem = ({item}: any) => (
    <TouchableOpacity onPress={() => detailsModalHandler(item)}>
      <View style={styles.transactionItem}>
        <View style={styles.itemLeft}>
          <Image
            source={
              item.categoryImage
                ? {uri: `file://${item.categoryImage}`}
                : item.type === 'Income'
                ? require('../assets/income.png')
                : require('../assets/expense.png')
            }
            style={styles.categoryImage}
          />
          <View>
            <Text style={styles.categoryText}>{item.category}</Text>
            <Text style={styles.dateText}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.amount,
            {color: item.type === 'income' ? '#1F8A70' : '#D9534F'},
          ]}>
          {item.type === 'income' ? '+' : '-'}
          {getCurrencySymbol()}
          {item.amount.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B5C58', '#438883']} style={styles.heroSec}>
        <Image
          source={require('../assets/ellipse.png')}
          style={styles.ellipse}
          resizeMode="contain"
        />
        <View style={styles.topContainer}>
          <TouchableOpacity onPress={() => tabChange()}>
            <Image
              source={require('../assets/back.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.topBarHeading}>All Transactions</Text>
          <TouchableOpacity style={styles.notificationConatiner} disabled>
            <Image
              source={require('../assets/notification.png')}
              style={styles.hiddenNotification}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <View style={styles.filterSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Type Filter */}
          <View style={[styles.dropdownRow, {zIndex: 2000}]}>
            <View style={{flex: 1}}>
              <DropDownPicker
                open={openType}
                setOpen={setOpenType}
                value={selectedType}
                setValue={setSelectedType}
                items={[
                  {label: 'All Types', value: 'all'},
                  {label: 'Income', value: 'income'},
                  {label: 'Expense', value: 'expense'},
                ]}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                placeholder="Filter by Type"
                textStyle={styles.dropdownText}
                listMode="SCROLLVIEW"
              />
            </View>
          </View>

          {/* Date Pickers */}
          <View style={[styles.dropdownRow, {zIndex: 1000, marginTop: 10}]}>
            <View style={{flex: 1}}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setOpenFromDate(true)}>
                <Text style={styles.dateInputText}>
                  {fromDate
                    ? fromDate.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : new Date().toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                </Text>
              </TouchableOpacity>
              <DatePicker
                modal
                open={openFromDate}
                date={fromDate || new Date()}
                mode="date"
                onConfirm={date => {
                  setOpenFromDate(false);
                  setFromDate(date);
                }}
                onCancel={() => setOpenFromDate(false)}
              />
            </View>

            <View style={{flex: 1}}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setOpenToDate(true)}>
                <Text style={styles.dateInputText}>
                  {toDate
                    ? toDate.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : new Date().toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                </Text>
              </TouchableOpacity>
              <DatePicker
                modal
                open={openToDate}
                date={toDate || new Date()}
                mode="date"
                onConfirm={date => {
                  setOpenToDate(false);
                  setToDate(date);
                }}
                onCancel={() => setOpenToDate(false)}
              />
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 30,
            paddingHorizontal: 10,
          }}>
          <Text style={styles.headingText}>Transactions</Text>
        </View>
        <FlatList
          style={{marginTop: 15}}
          data={filteredTransactions}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No transactions found</Text>
          }
          contentContainerStyle={[styles.listContent]}
        />
      </View>

      <Portal>
        <Dialog
          visible={detailsModalVisible}
          onDismiss={closeDetailsModal}
          style={styles.detailsModal}>
          <Dialog.Title style={styles.detailsHeading}>
            Transaction Details
          </Dialog.Title>
          <Dialog.Content>
            <View style={styles.detailRow}>
              <Text style={styles.detailSubHeading}>Type:</Text>
              <Text style={[styles.detailValue, {fontWeight: '600'}]}>
                {selectedTransaction?.type.toUpperCase()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailSubHeading}>Date:</Text>
              <Text style={styles.detailValue}>
                {selectedTransaction?.date
                  ? new Date(selectedTransaction.date).toLocaleDateString(
                      'en-US',
                      {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      },
                    )
                  : ''}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailSubHeading}>Amount:</Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color:
                      selectedTransaction?.type === 'income'
                        ? '#1F8A70'
                        : '#D9534F',
                  },
                ]}>
                {getCurrencySymbol()} {selectedTransaction?.amount}/-
              </Text>
            </View>
            <View>
              <View style={styles.detailRow}>
                <Text style={styles.detailSubHeading}>Category:</Text>
                <Text style={styles.detailValue}>
                  {selectedTransaction?.category}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailSubHeading}>Description:</Text>
                <Text style={styles.detailValue}>
                  {selectedTransaction?.description}
                </Text>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <TouchableOpacity
              onPress={() => closeDetailsModal()}
              style={styles.closeBtn}>
              <Text style={styles.closebtnTxt}>Close</Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF8F7',
  },
  heroSec: {
    width: '100%',
    height: 140,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  ellipse: {
    width: 180,
    height: 180,
    position: 'absolute',
    top: -5,
    left: -5,
    zIndex: 0,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 10,
    margin: 20,
    alignItems: 'center',
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  topBarHeading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationConatiner: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenNotification: {
    width: 22,
    height: 22,
    tintColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    marginTop: 20,
    paddingBottom: 0, // Add this
  },
  filterSection: {},
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    paddingVertical: 12,
    marginHorizontal: 10,
    fontSize: 16,
    height: 45,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontFamily: 'Inter-Medium',
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginHorizontal: 10,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderRadius: 10,
    minHeight: 45,
  },
  dropdownContainer: {
    borderColor: '#E0E0E0',
    borderRadius: 10,
    zIndex: 2000,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5C58',
    fontFamily: 'Inter-SemiBold',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontFamily: 'Inter-Medium',
  },
  listContent: {
    paddingBottom: 80,
  },
  headingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 45,
    justifyContent: 'center',
  },
  dateInputText: {
    color: '#333',
    fontSize: 14,
  },

  // Modal Styles
  detailsModal: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 10,
  },
  detailsHeading: {
    color: '#444',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    alignItems: 'center',
    paddingHorizontal: 10,
    flexWrap: 'wrap',
  },
  detailSubHeading: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: 14,
  },
  detailValue: {
    fontSize: 12,
    color: '#777',
  },
  dialogActions: {
    justifyContent: 'center',
    marginTop: 20,
  },
  closeBtn: {
    backgroundColor: '#1F615C',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  closebtnTxt: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AllTxns;
