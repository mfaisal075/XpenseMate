import {
  Alert,
  BackHandler,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../../FirebaseConfig';
import {doc, getDoc} from 'firebase/firestore';
import {useTransactionContext} from '../components/TransactionContext';
import {Transaction} from '../components/Interface';
import {Dialog, Portal} from 'react-native-paper';
import {useCurrency} from '../components/CurrencyContext';

const Main = ({navigateToNotification}: any) => {
  const [name, setName] = useState('');
  const {transactions, fetchTransactions} = useTransactionContext();
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const {getCurrencySymbol} = useCurrency();

  const openDetailsModal = ({transaction}: any) => {
    setDetailsVisible(true);
    setSelectedTransaction(transaction);
  };

  const closeDetailsModal = () => {
    setDetailsVisible(false);
    setSelectedTransaction(null);
  };

  // Fetch data of the user
  const fetchUserData = async () => {
    const db = FIRESTORE_DB;
    const auth = FIREBASE_AUTH;
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setName(userData.fullName);
      }
    }
  };

  useEffect(() => {
    const backPress = () => {
      Alert.alert('Exit App', 'Do you want to exit?', [
        {
          text: 'No',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => BackHandler.exitApp(),
        },
      ]);
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backPress);

    fetchUserData();
    fetchTransactions();
  }, []);

  const totalIncome = transactions.reduce((acc, transaction) => {
    return transaction.type === 'income' ? acc + transaction.amount : acc;
  }, 0);
  const formattedIncome = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(totalIncome);

  const totalExpense = transactions.reduce((acc, transaction) => {
    return transaction.type === 'expense' ? acc + transaction.amount : acc;
  }, 0);
  const formattedExpense = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(totalExpense);

  const totalBalance = totalIncome - totalExpense;
  const formattedBalance = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(totalBalance);

  const renderItem = ({item}: any) => {
    // Function to format the date
    const formatDate = (date: string) => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const itemDate = new Date(date);

      if (itemDate.toDateString() === today.toDateString()) {
        return 'Today';
      }
      if (itemDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      return itemDate.toLocaleDateString(); // Customize format if needed
    };

    const formattedAmount = new Intl.NumberFormat('en-US').format(item.amount);

    return (
      <TouchableOpacity
        onPress={() => {
          openDetailsModal({transaction: item});
        }}>
        <View style={styles.transactionItem}>
          <View style={styles.txnItemLeftContainer}>
            <Image
              source={
                item.categoryImage
                  ? {uri: `file://${item.categoryImage}`}
                  : item.type === 'Income'
                  ? require('../assets/income.png')
                  : require('../assets/expense.png')
              }
              style={[
                item.categoryImage !== '' ? styles.txnPic : styles.txnPic1,
              ]}
            />
            <View>
              <Text style={styles.transactionTypeText}>
                {item.type.toUpperCase()}
              </Text>
              <Text style={styles.transactionText}>{item.category}</Text>
              <Text style={styles.transactionDate}>
                {formatDate(item.date)}
              </Text>
            </View>
          </View>
          <View style={styles.txnItemRightContainer}>
            <Text
              style={[
                styles.amountText,
                {color: item.type === 'income' ? 'green' : 'red'},
              ]}>
              {item.type === 'income' ? '+' : '-'}
              {getCurrencySymbol()} {formattedAmount}/-
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <LinearGradient colors={['#1B5C58', '#438883']} style={styles.heroSec}>
          <Image
            source={require('../assets/ellipse.png')}
            style={{
              width: 180,
              height: 180,
              position: 'absolute',
              top: -5,
              left: -5,
              zIndex: 0,
            }}
            resizeMode="contain"
          />
          <View style={styles.topcontainer}>
            <View style={styles.textContainer}>
              <Text style={styles.wlcmText}>Welcome Back,</Text>
              <Text style={styles.nameText} numberOfLines={1}>
                {name}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.notificationConatiner}
              onPress={navigateToNotification}>
              <View style={styles.notificationRedCircle} />
              <Image
                source={require('../assets/notification.png')}
                style={{width: 22, height: 22, tintColor: '#fff'}}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.heroInnerSec}>
            <TouchableOpacity style={styles.threeDotMenuBtn}>
              <Image
                source={require('../assets/three-dot-menu.png')}
                style={styles.threeDotMenu}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.heroInnerSecText}>Current Balance</Text>
            <Text style={styles.heroInnerSecBal}>
              {getCurrencySymbol()} {formattedBalance}/-
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 20,
              }}>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 2,
                  }}>
                  <View style={styles.arrowBg}>
                    <Image
                      source={require('../assets/down-arrow.png')}
                      style={{width: 15, height: 15, tintColor: '#fff'}}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.textHeading}>Income</Text>
                </View>
                <Text style={styles.textBal}>
                  {getCurrencySymbol()} {formattedIncome}/-
                </Text>
              </View>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 2,
                  }}>
                  <View style={styles.arrowBg}>
                    <Image
                      source={require('../assets/up-arrow.png')}
                      style={{width: 15, height: 15, tintColor: '#fff'}}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.textHeading}>Expenses</Text>
                </View>
                <Text style={styles.textBal}>
                  {getCurrencySymbol()} {formattedExpense}/-
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.bottomConatiner}>
          <View style={styles.bottomHeadingContainer}>
            <Text style={styles.headingText}>Transaction History</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllBtn}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.incmExpnsHistory}>
            {transactions.length > 0 ? (
              <View style={styles.txnContainer}>
                <FlatList
                  data={transactions}
                  keyExtractor={item => `${item.type}-${item.id}`}
                  renderItem={renderItem}
                  contentContainerStyle={styles.list}
                  initialNumToRender={5}
                  windowSize={10}
                />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No transactions found</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Modal */}
      <Portal>
        <Dialog
          visible={detailsVisible}
          onDismiss={closeDetailsModal}
          style={styles.detailsModal}>
          <Dialog.Title style={styles.detailsHeading}>
            Transaction Details
          </Dialog.Title>
          <Dialog.Content style={styles.detailsModalBody}>
            <View style={styles.detailRow}>
              <Text style={styles.detailSubHeading}>Type:</Text>
              <Text style={[styles.detailValue, {fontWeight: '600'}]}>
                {selectedTransaction?.type.toUpperCase()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailSubHeading}>Date:</Text>
              <Text style={styles.detailValue}>
                {selectedTransaction?.date}
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
                Rs.{selectedTransaction?.amount}/-
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

export default Main;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#EEF8F7',
  },
  container: {
    flex: 1,
  },
  topcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 10,
    margin: 20,
    alignItems: 'center',
  },
  notificationConatiner: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationRedCircle: {
    height: 8,
    width: 8,
    borderRadius: 5,
    backgroundColor: 'red',
    position: 'absolute',
    top: 12,
    right: 10,
    zIndex: 1,
  },
  textContainer: {},
  wlcmText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    zIndex: 1,
  },
  nameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    zIndex: 1,
  },
  heroSec: {
    width: '100%',
    height: '30%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroInnerSec: {
    width: '80%',
    height: '75%',
    borderRadius: 20,
    alignSelf: 'center',
    backgroundColor: '#1B5C58',
    position: 'absolute',
    top: '55%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  heroInnerSecText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginLeft: 20,
  },
  heroInnerSecBal: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 5,
    marginHorizontal: 25,
  },
  textHeading: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textBal: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  arrowBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 50,
    height: 18,
    width: 18,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom Conatiner Styles
  bottomConatiner: {
    width: '100%',
    height: 'auto',
    marginTop: 80,
    padding: 20,
    marginBottom: 180,
  },
  bottomHeadingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  headingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeAllBtn: {
    fontSize: 14,
    color: 'gray',
    fontWeight: 'bold',
  },
  historyContainer: {
    width: '100%',
    height: 'auto',
    marginTop: 20,
    marginBottom: 75,
  },
  threeDotMenuBtn: {
    height: 30,
    width: 30,
    position: 'absolute',
    top: 20,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  threeDotMenu: {
    width: 25,
    height: 25,
    tintColor: '#fff',
  },

  // Transaction Item Styles
  transactionItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  txnItemLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txnPic: {
    width: 40,
    height: 40,
    marginRight: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
    backgroundColor: '#f0f0f0',
  },
  txnPic1: {
    width: 40,
    height: 40,
    marginRight: 15,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderRadius: 10,
  },
  transactionTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6c757d',
    letterSpacing: 1,
  },
  transactionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  txnItemRightContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
  },
  amountText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  incmExpnsHistory: {
    width: '100%',
    height: '100%',
  },
  txnContainer: {
    flex: 1,
    width: '100%',
    marginTop: 10,
    marginBottom: 140,
  },
  list: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    fontWeight: 'bold',
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
  detailsModalBody: {
    marginTop: 15,
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
