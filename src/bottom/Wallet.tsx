import {
  Alert,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import {useCallback, useRef, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {Modalize} from 'react-native-modalize';
import {Portal, Modal, TextInput, Menu, Dialog} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {openDatabase} from '../../database';
import Toast from 'react-native-toast-message';
import {Categories, Transaction} from '../components/Interface';
import {useFocusEffect} from '@react-navigation/native';
import {
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import DropDownPicker from 'react-native-dropdown-picker';
import {useTransactionContext} from '../components/TransactionContext';

const Wallet = ({tabChange}: any) => {
  const [open, setOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Income & Expense');
  const [modalVisible, setModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const modalizeRef = useRef<Modalize>(null);
  const [amount, setAmount] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [categoryType, setCategoryType] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [incomeCategory, setIncomeCategory] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [expenseDatePickerVisible, setExpenseDatePickerVisible] =
    useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [expenseMenuVisible, setExpenseMenuVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Categories | null>(
    null,
  );
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [selectedReportCategories, setSelectedReportCategories] = useState<
    string[]
  >([]);
  const {
    fetchTransactions,
    fetchCategories,
    categories,
    transactions,
    incomeCategories,
    expenseCategories,
  } = useTransactionContext();

  function setReportStartDate(visible: boolean): void {
    setStartDatePickerVisible(visible);
  }

  function setReportEndDate(visible: boolean): void {
    setEndDatePickerVisible(visible);
  }

  const openDetailsModal = ({transaction, category}: any) => {
    setDetailsVisible(true);
    setSelectedTransaction(transaction);
    if (selectedTab === 'Categorization') {
      setDetailsVisible(true);
      setSelectedCategory(category);
    }
  };

  const closeDetailsModal = () => {
    setDetailsVisible(false);
    setSelectedTransaction(null);
    if (selectedTab === 'Categorization') {
      setDetailsVisible(false);
      setSelectedTransaction(null);
    }
  };

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  const reportModalOpen = () => {
    setReportVisible(true);
  };

  const reportModalClose = () => {
    setReportVisible(false);
    setSelectedFilter('All');
    setSelectedReportCategories([]);
    setStartDate(null);
    setEndDate(null);
  };

  const incomeModalOpen = () => {
    setModalVisible(true);
    modalizeRef.current?.close();
  };

  const expenseModalOpen = () => {
    setExpenseModalVisible(true);
    modalizeRef.current?.close();
  };

  const addCategoryModalOpen = () => {
    setCategoryModalVisible(true);
    modalizeRef.current?.close();
  };

  const handleAddCategory = async () => {
    if (!categoryType || !categoryName) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }

    // Determine the image path
    let localPath = '';
    if (categoryImage) {
      const fileName = categoryImage.split('/').pop();
      localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    }

    // Add category to the database
    const db = await openDatabase();
    const todayDate = new Date().toISOString().split('T')[0];
    try {
      if (categoryImage) {
        await RNFS.copyFile(categoryImage, localPath);
      }
      await db.transaction(async tx => {
        await tx.executeSql(
          `INSERT INTO categories (type, name, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
          [categoryType, categoryName, localPath, todayDate, todayDate],
        );
      });

      Toast.show({
        type: 'success',
        text1: 'Category Added',
        text2: 'Category has been added successfully!',
      });

      setCategoryType('');
      setCategoryName('');
      setCategoryImage('');
      setCategoryModalVisible(false);
      fetchCategories(); // Fetch categories again to update the list
    } catch (error) {
      console.log('Error in adding category', error);
      Alert.alert('Error', 'Something went wrong. Please try again');
    }
  };

  const handleIncome = async () => {
    if (!incomeCategory || !amount || !date || !description) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      Alert.alert('Invalid input', 'Please enter a valid amount');
      return;
    }

    // Add income to the database
    const db = await openDatabase();
    const createdDate = date.toISOString().split('T')[0];
    try {
      await db.transaction(async tx => {
        await tx.executeSql(
          `INSERT INTO transactions (amount, categoryType, category, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            amount,
            'income',
            incomeCategory,
            description,
            createdDate,
            createdDate,
          ],
        );
      });

      Toast.show({
        type: 'success',
        text1: 'Income Added',
        text2: 'Your income entry has been added successfully!',
      });

      setIncomeCategory('');
      setAmount('');
      setDate(new Date());
      setDescription('');
      setModalVisible(false);
      fetchTransactions(); // Fetch transactions again to update the list
    } catch (error) {
      console.log('Error in adding income', error);
      Alert.alert('Error', 'Something went wrong. Please try again');
    }
  };

  const handleExpense = async () => {
    if (
      !expenseCategory ||
      !expenseAmount ||
      !expenseDate ||
      !expenseDescription
    ) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(expenseAmount)) {
      Alert.alert('Invalid input', 'Please enter a valid amount');
      return;
    }

    // Add expense to the database
    const db = await openDatabase();
    const createdDate = expenseDate.toISOString().split('T')[0];
    try {
      await db.transaction(async tx => {
        await tx.executeSql(
          `INSERT INTO transactions (amount, categoryType, category, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            expenseAmount,
            'expense',
            expenseCategory,
            expenseDescription,
            createdDate,
            createdDate,
          ],
        );
      });

      Toast.show({
        type: 'success',
        text1: 'Expense Added',
        text2: 'Your expense entry has been added successfully!',
      });

      setExpenseCategory('');
      setExpenseAmount('');
      setExpenseDate(new Date());
      setExpenseDescription('');
      setExpenseModalVisible(false);
      fetchTransactions(); // Fetch transactions again to update the list
    } catch (error) {
      console.log('Error in adding expense', error);
      Alert.alert('Error', 'Something went wrong. Please try again');
    }
  };

  // Image Picker
  const pickImage = async () => {
    try {
      const result: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.didCancel) {
        console.log('User cancelled image picker');
      } else if (result.errorCode) {
        console.error('Image Picker Error:', result.errorMessage);
      } else if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (uri) {
          setCategoryImage(uri); // Only set if uri is defined
        } else {
          console.error('URI is undefined');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        tabChange();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', backAction);
      fetchTransactions();
      fetchCategories();
    }, []),
  );

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
      <TouchableOpacity onPress={() => openDetailsModal({transaction: item})}>
        <View style={styles.transactionItem}>
          <View style={styles.txnItemLeftContainer}>
            <Image
              source={
                item.categoryImage
                  ? {uri: `file://${item.categoryImage}`} // Load category image URI from database
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
              {item.type === 'income' ? '+' : '-'}Rs.{formattedAmount}/-
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = ({item}: any) => {
    return (
      <TouchableOpacity onPress={() => openDetailsModal({category: item})}>
        <View style={styles.categoryItemContainer}>
          <View style={styles.categoryLeftContainer}>
            <Image
              source={
                item.image !== ''
                  ? {uri: `file://${item.image}`}
                  : item.type === 'Income'
                  ? require('../assets/income.png')
                  : require('../assets/expense.png')
              }
              style={item.image ? styles.categoryImage2 : styles.categoryImage}
            />
            <Text style={styles.categoryNameText}>{item.name}</Text>
          </View>
          <View style={styles.categoryRightContainer}>
            <Text
              style={[
                styles.categoryTypeText,
                {color: item.type === 'Income' ? 'green' : 'red'},
              ]}>
              {item.type}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const generateReport = async (transactions: Transaction[]) => {
    if (transactions.length === 0) {
      Alert.alert('Error', 'No transactions found');
      return;
    }
    if (selectedReportCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one category');
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select start and end date');
      return;
    }
    if (
      startDate &&
      endDate &&
      new Date(startDate).getTime() > new Date(endDate).getTime()
    ) {
      Alert.alert('Error', 'Start date cannot be greater than end date');
      return;
    }
    const totalIncome = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce(
        (sum, transaction) => sum + parseFloat(transaction.amount.toString()),
        0,
      );

    const totalExpense = transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce(
        (sum, transaction) => sum + parseFloat(transaction.amount.toString()),
        0,
      );

    const savings = totalIncome - totalExpense;

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #1F615C; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1F615C; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .summary { margin-top: 20px; }
            .summary div { margin-bottom: 10px; }
            .summary span { font-weight: bold; }
            .chart-container { text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Transaction Report</h1>
          <div class="summary">
            <div><span>Total Income:</span> Rs.${totalIncome.toFixed(2)}/-</div>
            <div><span>Total Expense:</span> Rs.${totalExpense.toFixed(
              2,
            )}/-</div>
            <div><span>Savings:</span> ${savings >= 0 ? '+' : '-'}Rs.${Math.abs(
      savings,
    ).toFixed(2)}/-</div>
          </div>
          <table>
            <tr>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
            ${transactions
              .map(
                transaction => `
              <tr>
                <td>${transaction.type}</td>
                <td>${transaction.category}</td>
                <td>Rs.${transaction.amount}/-</td>
                <td>${transaction.description}</td>
                <td>${new Date(transaction.date).toLocaleDateString()}</td>
              </tr>
            `,
              )
              .join('')}
          </table>
        </body>
      </html>
    `;

    try {
      const options = {
        html: htmlContent,
        fileName: 'Transaction_Report',
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('PDF file saved to:', file.filePath);

      Toast.show({
        type: 'success',
        text1: 'Report Generated',
        text2: `The report has been generated and saved to ${file.filePath}`,
      });

      reportModalClose();
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert(
        'Error',
        'Something went wrong while generating the report. Please try again.',
      );
    }
  };

  return (
    <View style={styles.mian}>
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
        <View style={styles.topContainer}>
          <TouchableOpacity onPress={tabChange}>
            <Image
              source={require('../assets/back.png')}
              style={{width: 20, height: 20, tintColor: '#fff'}}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.topBarHeading}>Menu</Text>
          <TouchableOpacity
            style={styles.notificationConatiner}
            onPress={() => reportModalOpen()}>
            <Image
              source={require('../assets/file.png')}
              style={{width: 28, height: 28, tintColor: '#fff'}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity onPress={onOpen} style={styles.plusBtnContainer}>
            <Image
              source={require('../assets/plus.png')}
              style={styles.plusIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleButton}>
              <TouchableOpacity
                style={
                  selectedTab === 'Income & Expense'
                    ? styles.buttonContainer
                    : {...styles.buttonContainer, backgroundColor: 'gray'}
                }
                onPress={() => setSelectedTab('Income & Expense')}>
                <Text
                  style={
                    selectedTab === 'Income & Expense'
                      ? styles.buttonText
                      : {...styles.buttonText, color: 'white'}
                  }>
                  Income & Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  selectedTab === 'Categorization'
                    ? styles.buttonContainer
                    : {...styles.buttonContainer, backgroundColor: 'gray'}
                }
                onPress={() => setSelectedTab('Categorization')}>
                <Text
                  style={
                    selectedTab === 'Categorization'
                      ? styles.buttonText
                      : {...styles.buttonText, color: 'white'}
                  }>
                  Categorization
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {selectedTab === 'Income & Expense' ? (
            <View style={styles.incmExpnsHistory}>
              <View style={styles.historyContainer}>
                <Text style={styles.headingText}>Transactions</Text>
                <Text style={styles.seeAllBtn}>Amount</Text>
              </View>
              {transactions.length > 0 ? (
                <View style={styles.txnContainer}>
                  <FlatList
                    data={transactions}
                    keyExtractor={item => `${item.type}-${item.id}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                  />
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No transactions found</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.incmExpnsHistory}>
              <View style={styles.historyContainer}>
                <Text style={styles.headingText}>Categories</Text>
                <Text style={styles.typeHeading}>Type</Text>
              </View>
              {categories.length > 0 ? (
                <View style={styles.txnContainer}>
                  <FlatList
                    data={categories}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderCategoryItem}
                  />
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No categories found</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Bottom Sheet */}
      <Modalize
        ref={modalizeRef}
        adjustToContentHeight={true}
        handleStyle={styles.modalHandle}>
        <View style={styles.bottomSheetContainer}>
          <Text style={styles.bottomSheetTitle}>Choose an Option</Text>
          {selectedTab === 'Income & Expense' ? (
            <View>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => incomeModalOpen()}>
                <View style={styles.optionContent}>
                  <Image
                    source={require('../assets/income.png')}
                    style={styles.optionIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.optionText}>Add Income</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => expenseModalOpen()}>
                <View style={styles.optionContent}>
                  <Image
                    source={require('../assets/expense.png')}
                    style={styles.optionIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.optionText}>Add Expense</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => addCategoryModalOpen()}>
                <View style={styles.optionContent}>
                  <Image
                    source={require('../assets/categories.png')}
                    style={styles.optionIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.optionText}>Add Category</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modalize>

      {/* Add Income, Expense & Add Category Modal */}
      <Portal>
        {/* Add Income Modal */}
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setAmount('');
            setDescription('');
            setDate(new Date());
            setIncomeCategory('');
          }}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeading}>Add Income</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setAmount('');
                setDescription('');
                setDate(new Date());
                setIncomeCategory('');
              }}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            {/* Category Selection */}
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setMenuVisible(true)}
                  style={styles.categoryField}>
                  <Text
                    style={{
                      color: incomeCategory ? '#1F615C' : '#666',
                      fontSize: incomeCategory ? 18 : 16,
                      fontWeight: incomeCategory ? 'bold' : 'normal',
                    }}>
                    {incomeCategory || 'Select Category'}
                  </Text>
                  {!incomeCategory && (
                    <Image
                      source={require('../assets/down-arrow-head.png')}
                      style={{width: 35, height: 35, tintColor: '#666'}}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
              }>
              {incomeCategories.map((category, index) => (
                <Menu.Item
                  key={index}
                  onPress={() => {
                    setIncomeCategory(category.name);
                    setMenuVisible(false);
                  }}
                  title={category.name}
                />
              ))}
            </Menu>

            {/* Amount Input */}
            <TextInput
              label="Amount"
              mode="outlined"
              keyboardType="numeric"
              value={amount}
              textColor="#000"
              onChangeText={text => setAmount(text)}
              style={styles.inputField}
              theme={{
                colors: {
                  primary: '#1F615C',
                  text: '#000',
                  placeholder: '#666',
                  background: '#fff',
                },
              }}
            />

            {/* Date Picker */}
            <TouchableOpacity
              onPress={() => setDatePickerVisible(true)}
              style={styles.dateField}>
              <Text style={{color: '#000'}}>
                {date ? date.toLocaleDateString() : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {datePickerVisible && (
              <DateTimePicker
                value={date || new Date()} // Default to current date if no date selected
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setDatePickerVisible(false); // Close the picker
                  if (event.type === 'set' && selectedDate) {
                    // Only update the date if the user selects it
                    setDate(selectedDate);
                  }
                }}
              />
            )}

            {/* Description Input */}
            <TextInput
              label="Description"
              mode="outlined"
              value={description}
              textColor="#000"
              onChangeText={text => setDescription(text)}
              style={styles.inputField}
              theme={{
                colors: {
                  primary: '#1F615C',
                  text: '#000',
                  placeholder: '#666',
                  background: '#fff',
                },
              }}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleIncome()}>
              <Text style={styles.saveBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Add Expense Modal */}
        <Modal
          visible={expenseModalVisible}
          onDismiss={() => {
            setExpenseModalVisible(false);
            setExpenseAmount('');
            setExpenseDescription('');
            setExpenseDate(new Date());
            setExpenseCategory('');
          }}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeading}>Add Expense</Text>
            <TouchableOpacity
              onPress={() => {
                setExpenseModalVisible(false);
                setExpenseAmount('');
                setExpenseDescription('');
                setExpenseDate(new Date());
                setExpenseCategory('');
              }}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            {/* Category Selection */}
            <Menu
              visible={expenseMenuVisible}
              onDismiss={() => setExpenseMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setExpenseMenuVisible(true)}
                  style={styles.categoryField}>
                  <Text
                    style={{
                      color: expenseCategory ? '#1F615C' : '#666',
                      fontSize: expenseCategory ? 18 : 16,
                      fontWeight: expenseCategory ? 'bold' : 'normal',
                    }}>
                    {expenseCategory || 'Select Category'}
                  </Text>
                  {!expenseCategory && (
                    <Image
                      source={require('../assets/down-arrow-head.png')}
                      style={{width: 35, height: 35, tintColor: '#666'}}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
              }>
              {expenseCategories.map((category, index) => (
                <Menu.Item
                  key={index}
                  onPress={() => {
                    setExpenseCategory(category.name);
                    setExpenseMenuVisible(false);
                  }}
                  title={category.name}
                />
              ))}
            </Menu>

            {/* Amount Input */}
            <TextInput
              label="Amount"
              mode="outlined"
              keyboardType="numeric"
              value={expenseAmount}
              textColor="#000"
              onChangeText={text => setExpenseAmount(text)}
              style={styles.inputField}
              theme={{
                colors: {
                  primary: '#1F615C',
                  text: '#000',
                  placeholder: '#666',
                  background: '#fff',
                },
              }}
            />

            {/* Date Picker */}
            <TouchableOpacity
              onPress={() => setExpenseDatePickerVisible(true)}
              style={styles.dateField}>
              <Text style={{color: '#000'}}>
                {expenseDate ? expenseDate.toLocaleDateString() : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {expenseDatePickerVisible && (
              <DateTimePicker
                value={expenseDate || new Date()} // Default to current date if no date selected
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setExpenseDatePickerVisible(false); // Close the picker
                  if (event.type === 'set' && selectedDate) {
                    // Only update the date if the user selects it
                    setExpenseDate(selectedDate);
                  }
                }}
              />
            )}

            {/* Description Input */}
            <TextInput
              label="Description"
              mode="outlined"
              value={expenseDescription}
              textColor="#000"
              onChangeText={text => setExpenseDescription(text)}
              style={styles.inputField}
              theme={{
                colors: {
                  primary: '#1F615C',
                  text: '#000',
                  placeholder: '#666',
                  background: '#fff',
                },
              }}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleExpense()}>
              <Text style={styles.saveBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Add Category Modal */}
        <Modal
          visible={categoryModalVisible}
          onDismiss={() => {
            setCategoryModalVisible(false);
            setCategoryType('');
            setCategoryName('');
            setCategoryImage('');
          }}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeading}>Add Category</Text>
            <TouchableOpacity
              onPress={() => {
                setCategoryModalVisible(false);
                setCategoryType('');
                setCategoryName('');
                setCategoryImage('');
              }}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Category Type Selection */}
            <Menu
              visible={categoryMenuVisible}
              onDismiss={() => setCategoryMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setCategoryMenuVisible(true)}
                  style={styles.categoryField}>
                  <Text
                    style={{
                      color: categoryType ? '#1F615C' : '#666', // Change color based on selection
                      fontSize: categoryType ? 18 : 16, // Adjust font size
                      fontWeight: categoryType ? 'bold' : 'normal', // Adjust font weight
                    }}>
                    {categoryType || 'Select Category Type'}
                  </Text>
                  {!categoryType && (
                    <Image
                      source={require('../assets/down-arrow-head.png')}
                      style={{width: 35, height: 35, tintColor: '#666'}}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
              }>
              <Menu.Item
                onPress={() => {
                  setCategoryType('Income');
                  setCategoryMenuVisible(false);
                }}
                title="Income"
              />
              <Menu.Item
                onPress={() => {
                  setCategoryType('Expense');
                  setCategoryMenuVisible(false);
                }}
                title="Expense"
              />
            </Menu>

            {/* Amount Input */}
            <TextInput
              label="Category Name"
              mode="outlined"
              value={categoryName}
              textColor="#000"
              onChangeText={text => setCategoryName(text)}
              style={styles.inputField}
              theme={{
                colors: {
                  primary: '#1F615C',
                  text: '#000',
                  placeholder: '#666',
                  background: '#fff',
                },
              }}
            />

            {/* Add Image Button */}
            <TouchableOpacity
              style={styles.addImgBtn}
              onPress={() => pickImage()}>
              {categoryImage ? (
                <Text style={styles.addImgBtnText} numberOfLines={1}>
                  {categoryImage.split('/').pop()}
                </Text>
              ) : (
                <View style={styles.addImgBtnContent}>
                  <Image
                    source={require('../assets/camera.png')}
                    style={styles.addImgIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.addImgBtnText}>Add Image (Option)</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleAddCategory()}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Transaction & Category Details Modal */}
        <Dialog
          visible={detailsVisible}
          onDismiss={closeDetailsModal}
          style={styles.detailsModal}>
          <Dialog.Title style={styles.detailsHeading}>
            {selectedTab === 'Income & Expense'
              ? 'Transaction Details'
              : 'Category Details'}
          </Dialog.Title>
          <Dialog.Content style={styles.detailsModalBody}>
            <View style={styles.detailRow}>
              <Text style={styles.detailSubHeading}>Type:</Text>
              <Text style={[styles.detailValue, {fontWeight: '600'}]}>
                {selectedTab === 'Income & Expense'
                  ? selectedTransaction?.type.toUpperCase()
                  : selectedCategory?.type.toUpperCase()}
              </Text>
            </View>
            {selectedTab === 'Income & Expense' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailSubHeading}>Date:</Text>
                <Text style={styles.detailValue}>
                  {selectedTransaction?.date}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailSubHeading}>
                {selectedTab === 'Income & Expense'
                  ? 'Amount:'
                  : 'Category Name:'}
              </Text>
              {selectedTab === 'Income & Expense' ? (
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
              ) : (
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color:
                        selectedCategory?.type.toLocaleLowerCase() === 'income'
                          ? '#1F8A70'
                          : '#D9534F',
                    },
                  ]}>
                  {selectedCategory?.name}
                </Text>
              )}
            </View>
            {selectedTab === 'Income & Expense' && (
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
            )}
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <TouchableOpacity
              onPress={() => closeDetailsModal()}
              style={styles.closeBtn}>
              <Text style={styles.closebtnTxt}>Close</Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>

        {/* Transaction Report Generation Modal */}
        <Dialog
          visible={reportVisible}
          onDismiss={() => reportModalClose()}
          style={styles.detailsModal}>
          <Dialog.Title style={styles.detailsHeading}>
            Generate Transaction Report
          </Dialog.Title>
          <Dialog.Content style={styles.detailsModalBody}>
            <View style={styles.reportModalBody}>
              <View style={styles.pickerContainer}>
                <DropDownPicker
                  open={typeOpen}
                  setOpen={setTypeOpen}
                  value={selectedFilter}
                  setValue={setSelectedFilter}
                  items={[
                    {label: 'All', value: 'All'},
                    {label: 'Income', value: 'Income'},
                    {label: 'Expense', value: 'Expense'},
                  ]}
                  placeholder="Select Filter"
                  style={{
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                    borderRadius: 10,
                  }}
                  dropDownContainerStyle={{
                    borderColor: '#ccc',
                    borderRadius: 10,
                    width: '100%',
                  }}
                />
              </View>
              <View style={styles.multiplePickerContainer}>
                <DropDownPicker
                  open={open}
                  setOpen={setOpen}
                  value={selectedReportCategories}
                  setValue={setSelectedReportCategories}
                  items={categories
                    .filter(
                      category =>
                        selectedFilter === 'All' ||
                        category.type.toLowerCase() ===
                          selectedFilter.toLowerCase(),
                    )
                    .map(category => ({
                      label: category.name,
                      value: category.name,
                    }))}
                  multiple={true}
                  placeholder="Select Categories"
                  style={{
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                    borderRadius: 10,
                  }}
                  dropDownContainerStyle={{
                    borderColor: '#ccc',
                    borderRadius: 10,
                    width: '100%',
                  }}
                  selectedItemContainerStyle={{
                    backgroundColor: '#e0ffe0', // Green background for selected items
                  }}
                  selectedItemLabelStyle={{
                    color: 'green', // Green text color for selected items
                    fontWeight: 'bold',
                  }}
                  listItemLabelStyle={{
                    color: '#000', // Default text color for items
                  }}
                  mode="BADGE" // Displays selected items as badges
                  badgeColors="green"
                  badgeDotColors="white"
                  badgeTextStyle={{color: 'white', fontSize: 12}}
                />
              </View>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  onPress={() => setReportStartDate(true)}
                  style={styles.repDateField}>
                  <Text style={{color: '#000'}}>
                    {startDate ? startDate.toLocaleDateString() : 'Start Date'}
                  </Text>
                </TouchableOpacity>
                {startDatePickerVisible && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setReportStartDate(false);
                      if (event.type === 'set' && selectedDate) {
                        setStartDate(selectedDate);
                      }
                    }}
                  />
                )}
              </View>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  onPress={() => setReportEndDate(true)}
                  style={styles.repDateField}>
                  <Text style={{color: '#000'}}>
                    {endDate ? endDate.toLocaleDateString() : 'End Date'}
                  </Text>
                </TouchableOpacity>
                {endDatePickerVisible && (
                  <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setReportEndDate(false);
                      if (event.type === 'set' && selectedDate) {
                        setEndDate(selectedDate);
                      }
                    }}
                  />
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  const filteredTransactions = transactions.filter(
                    transaction => {
                      const transactionDate = new Date(transaction.date);
                      return (
                        (selectedFilter === 'All' ||
                          transaction.type.toLowerCase() ===
                            selectedFilter.toLowerCase()) &&
                        (!startDate || transactionDate >= startDate) &&
                        (!endDate || transactionDate <= endDate) &&
                        (selectedReportCategories.length === 0 ||
                          selectedReportCategories.includes(
                            transaction.category,
                          ))
                      );
                    },
                  );
                  generateReport(filteredTransactions);
                }}
                style={[
                  styles.saveButton,
                  {alignSelf: 'center', marginTop: 20, width: '80%'},
                ]}>
                <Text style={styles.saveBtnText}>Generate Report</Text>
              </TouchableOpacity>
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  mian: {
    flex: 1,
  },
  heroSec: {
    width: '100%',
    height: '100%',
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 10,
    margin: 20,
    alignItems: 'center',
  },
  topBarHeading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
  bottomContainer: {
    flex: 1,
    marginTop: 10,
    width: '100%',
    height: '100%',
    backgroundColor: '#EEF8F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  plusIcon: {
    width: 35,
    height: 35,
    tintColor: '#fff',
  },
  plusBtnContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: '#1F615C',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 100,
    right: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1,
  },

  // Bottom Sheet
  modalHandle: {
    backgroundColor: '#ccc',
    width: 50,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 8,
  },
  bottomSheetContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#1F615C',
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: '#fff',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  toggleContainer: {
    width: '100%',
    height: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  toggleButton: {
    height: 50,
    width: '80%',
    backgroundColor: 'gray',
    borderRadius: 30,
    alignSelf: 'center',
    marginVertical: 20,
    justifyContent: 'center',
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '50%',
    height: '85%',
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  incmExpnsHistory: {
    width: '100%',
    height: '100%',
  },
  headingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  typeHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  historyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '98%',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.8,
  },
  seeAllBtn: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#000',
  },

  // Modal Styles
  modalContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#E57373',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBody: {
    paddingVertical: 10,
  },
  bodyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputField: {
    backgroundColor: '#fff',
    color: '#000',
    marginVertical: 5,
  },
  categoryField: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    paddingRight: 11,
    borderRadius: 5,
    marginBottom: 5,
  },
  dateField: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    paddingRight: 11,
    borderRadius: 5,
    marginBottom: 5,
    marginVertical: 5,
  },
  addImgBtn: {
    marginVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 0.8,
    width: '100%',
    height: 50,
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row',
  },
  addImgIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: 'rgba(0, 0, 0, 0.5)',
  },
  addImgBtnText: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addImgBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#1F615C',
    height: 45,
    width: '50%',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  saveBtnText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },

  // Transaction container
  txnContainer: {
    flex: 1, // Take up available space
    width: '100%',
    marginTop: 10,
    marginBottom: 140,
  },
  list: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  transactionText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionTypeText: {
    fontSize: 14,
    color: '#6c757d',
  },
  transactionDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  txnPic: {
    width: 50,
    height: 50,
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
    width: 50,
    height: 50,
    marginRight: 15,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderRadius: 10,
  },
  txnItemLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txnItemRightContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1, // This will ensure the right side stays on the far end
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Category container
  categoryItemContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  categoryLeftContainer: {
    flex: 1,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryRightContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  categoryNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  categoryTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryImage: {
    width: 50,
    height: 50,
    marginRight: 15,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderRadius: 10,
  },
  categoryImage2: {
    width: 50,
    height: 50,
    marginRight: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#f0f0f0',
  },

  // Details Modal
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
    fontSize: 20,
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
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
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
    paddingHorizontal: 20,
  },
  closebtnTxt: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },

  // Report Generation Modal
  reportModalBody: {
    height: 'auto',
  },
  pickerContainer: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  repDateField: {
    flexDirection: 'row',
    height: 50,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    paddingRight: 11,
    borderRadius: 5,
    marginBottom: 5,
  },
  multiplePickerContainer: {
    height: 'auto',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#ccc',
    zIndex: 1000,
  },
});
