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

const AllTxns = ({tabChange}: any) => {
  const {transactions, fetchTransactions} = useTransactionContext();
  const {getCurrencySymbol} = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [openType, setOpenType] = useState(false);
  const [selectedType, setSelectedType] = useState('all');

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

    return matchesSearch && matchesType;
  });

  const renderItem = ({item}: any) => (
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

          <View style={styles.dropdownRow}>
            <View style={{flex: 1, zIndex: 2000, marginLeft: 10}}>
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
                dropDownContainerStyle={[
                  styles.dropdownContainer,
                  {zIndex: 2000},
                ]}
                placeholder="Filter by Type"
                textStyle={styles.dropdownText}
                listMode="SCROLLVIEW"
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
  },
  filterSection: {
    marginBottom: 30,
  },
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
  },
  dropdown: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderRadius: 10,
    minHeight: 45,
    width: '98%',
  },
  dropdownContainer: {
    borderColor: '#E0E0E0',
    borderRadius: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
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
    paddingBottom: 20,
  },
  headingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AllTxns;
