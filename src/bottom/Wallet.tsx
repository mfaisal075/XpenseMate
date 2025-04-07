import {
  Alert,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
} from 'react-native';
import {useCallback, useRef, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {Modalize} from 'react-native-modalize';
import {Portal, Modal, Menu, Dialog} from 'react-native-paper';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface FormState {
  amount: string;
  description: string;
  date: Date;
  category: string;
}

const initialFormState: FormState = {
  amount: '',
  description: '',
  date: new Date(),
  category: '',
};

interface AddCategory {
  type: string;
  budget: string;
  name: string;
  image?: string;
}

const initialCategoryState: AddCategory = {
  type: '',
  budget: '',
  name: '',
};

const Wallet = ({tabChange}: any) => {
  const [open, setOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Income & Expense');
  const [modalVisible, setModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const modalizeRef = useRef<Modalize>(null);
  const [incomeForm, setIncomeForm] = useState<FormState>(initialFormState);
  const [expenseForm, setExpenseForm] = useState<FormState>(initialFormState);
  const [categoryForm, setCategoryForm] =
    useState<AddCategory>(initialCategoryState);
  const [incomeCategory, setIncomeCategory] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
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

  const handleIncomeFormChange = (
    field: keyof FormState,
    value: string | Date,
  ) => {
    setIncomeForm(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleExpenseFormChange = (
    field: keyof FormState,
    value: string | Date,
  ) => {
    setExpenseForm(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleCategoryFormChange = (
    field: keyof AddCategory,
    value: string,
  ) => {
    setCategoryForm(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

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
    try {
      const {type, name, image} = categoryForm;

      if (!type || !name) {
        Alert.alert('Error', 'Please fill all the fields');
        return;
      }

      // Determine the image path
      let localPath = '';
      if (image) {
        const fileName = image.split('/').pop();
        localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      }

      // Add category to the database
      const db = await openDatabase();
      const todayDate = new Date().toISOString().split('T')[0];

      if (image) {
        await RNFS.copyFile(image, localPath).catch(err => {
          console.error('Error copying image file:', err);
          throw new Error('Failed to save the category image.');
        });
      }

      await db.transaction(async tx => {
        await tx.executeSql(
          `INSERT INTO categories (type, name, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
          [type, name, localPath, todayDate, todayDate],
        );
      });

      Toast.show({
        type: 'success',
        text1: 'Category Added',
        text2: 'Category has been added successfully!',
      });

      // Reset form state
      setCategoryForm(initialCategoryState);
      setCategoryModalVisible(false);

      // Refresh categories
      fetchCategories();
    } catch (error) {
      console.error('Error in adding category:', error);
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    }
  };

  const handleTransaction = async (type: 'income' | 'expense') => {
    const isIncome = type === 'income';
    const category = isIncome ? incomeCategory : expenseCategory;
    const amount = isIncome ? incomeForm.amount : expenseForm.amount;
    const date = isIncome ? incomeForm.date : expenseForm.date;
    const description = isIncome
      ? incomeForm.description
      : expenseForm.description;

    if (!category || !amount || !date || !description) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      Alert.alert('Invalid input', 'Please enter a valid amount');
      return;
    }

    // Add transaction to the database
    const db = await openDatabase();
    const createdDate = date.toISOString().split('T')[0];
    try {
      await db.transaction(async tx => {
        await tx.executeSql(
          `INSERT INTO transactions (amount, categoryType, category, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
          [amount, type, category, description, createdDate, createdDate],
        );
      });

      Toast.show({
        type: 'success',
        text1: `${isIncome ? 'Income' : 'Expense'} Added`,
        text2: `Your ${
          isIncome ? 'income' : 'expense'
        } entry has been added successfully!`,
      });

      if (isIncome) {
        setIncomeCategory('');
        setIncomeForm(initialFormState);
        setModalVisible(false);
      } else {
        setExpenseCategory('');
        setExpenseForm(initialFormState);
        setExpenseModalVisible(false);
      }

      fetchTransactions(); // Fetch transactions again to update the list
    } catch (error) {
      console.log(`Error in adding ${type}`, error);
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
          handleCategoryFormChange('image', uri);
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
            setIncomeForm(initialFormState);
          }}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeading}>Add Income</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setIncomeForm(initialFormState);
              }}
              style={styles.closeButton}>
              <Icon name="close" size={18} color={'#fff'} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            {/* Category Selection */}
            <View style={styles.categoryField}>
              <DropDownPicker
                open={menuVisible}
                setOpen={setMenuVisible}
                value={incomeCategory}
                setValue={setIncomeCategory}
                items={incomeCategories.map(category => ({
                  label: category.name,
                  value: category.name,
                }))}
                placeholder="Select Category"
                style={{
                  borderColor: 'transparent',
                  backgroundColor: 'transparent',
                  borderRadius: 10,
                }}
                dropDownContainerStyle={{
                  borderColor: '#ccc',
                  borderRadius: 10,
                  width: '100%',
                  alignSelf: 'center',
                }}
                placeholderStyle={{
                  color: '#666',
                  fontSize: 16,
                }}
                selectedItemLabelStyle={{
                  fontWeight: 'bold',
                  color: '#1F615C',
                }}
                listItemLabelStyle={{
                  color: '#000',
                }}
              />
            </View>

            <TextInput
              placeholder="Amount"
              keyboardType="numeric"
              value={incomeForm.amount}
              placeholderTextColor="gray"
              onChangeText={text => handleIncomeFormChange('amount', text)}
              style={styles.inputField}
            />

            {/* Date Picker */}
            <TouchableOpacity
              onPress={() => setDatePickerVisible(true)}
              style={styles.categoryField}>
              <Text style={{color: '#000'}}>
                {incomeForm.date
                  ? incomeForm.date.toLocaleDateString()
                  : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {datePickerVisible && (
              <DateTimePicker
                value={incomeForm.date || new Date()} // Default to current date if no date selected
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setDatePickerVisible(false); // Close the picker
                  if (event.type === 'set' && selectedDate) {
                    // Only update the date if the user selects it
                    handleIncomeFormChange('date', selectedDate);
                  }
                }}
              />
            )}

            {/* Description Input */}
            <TextInput
              placeholder="Description"
              value={incomeForm.description}
              placeholderTextColor="gray"
              onChangeText={text => handleIncomeFormChange('description', text)}
              style={styles.inputField}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleTransaction('income')}>
              <Text style={styles.saveBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Add Expense Modal */}
        <Modal
          visible={expenseModalVisible}
          onDismiss={() => {
            setExpenseModalVisible(false);
            setExpenseForm(initialFormState);
          }}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeading}>Add Expense</Text>
            <TouchableOpacity
              onPress={() => {
                setExpenseModalVisible(false);
                setExpenseForm(initialFormState);
              }}
              style={styles.closeButton}>
              <Icon name="close" size={18} color={'#fff'} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            {/* Category Selection */}
            <View style={styles.categoryField}>
              <DropDownPicker
                open={expenseMenuVisible}
                setOpen={setExpenseMenuVisible}
                value={expenseCategory}
                setValue={setExpenseCategory}
                items={expenseCategories.map(category => ({
                  label: category.name,
                  value: category.name,
                }))}
                placeholder="Select Category"
                style={{
                  borderColor: 'transparent',
                  backgroundColor: 'transparent',
                  borderRadius: 10,
                }}
                dropDownContainerStyle={{
                  borderColor: '#ccc',
                  borderRadius: 10,
                  width: '100%',
                  alignSelf: 'center',
                }}
                placeholderStyle={{
                  color: '#666',
                  fontSize: 16,
                }}
                selectedItemLabelStyle={{
                  fontWeight: 'bold',
                  color: '#1F615C',
                }}
                listItemLabelStyle={{
                  color: '#000',
                }}
              />
            </View>

            {/* Amount Input */}
            <TextInput
              placeholder="Amount"
              keyboardType="numeric"
              value={expenseForm.amount}
              placeholderTextColor="gray"
              onChangeText={text => handleExpenseFormChange('amount', text)}
              style={styles.inputField}
            />

            {/* Date Picker */}
            <TouchableOpacity
              onPress={() => setExpenseDatePickerVisible(true)}
              style={styles.categoryField}>
              <Text style={{color: '#000'}}>
                {expenseForm.date
                  ? expenseForm.date.toLocaleDateString()
                  : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {expenseDatePickerVisible && (
              <DateTimePicker
                value={expenseForm.date || new Date()} // Default to current date if no date selected
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setExpenseDatePickerVisible(false); // Close the picker
                  if (event.type === 'set' && selectedDate) {
                    // Only update the date if the user selects it
                    handleIncomeFormChange('date', selectedDate);
                  }
                }}
              />
            )}

            {/* Description Input */}
            <TextInput
              placeholder="Description"
              value={expenseForm.description}
              placeholderTextColor="gray"
              onChangeText={text =>
                handleExpenseFormChange('description', text)
              }
              style={styles.inputField}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleTransaction('expense')}>
              <Text style={styles.saveBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Add Category Modal */}
        <Modal
          visible={categoryModalVisible}
          onDismiss={() => {
            setCategoryModalVisible(false);
            setCategoryForm(initialCategoryState);
          }}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeading}>Add Category</Text>
            <TouchableOpacity
              onPress={() => {
                setCategoryModalVisible(false);
                setCategoryForm(initialCategoryState);
              }}
              style={styles.closeButton}>
              <Icon name="close" size={18} color={'#fff'} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Category Type Selection */}
            <View
              style={{
                height: 50,
                width: '100%',
                borderWidth: 0.8,
                borderColor: '#000',
                borderRadius: 10,
              }}>
              <DropDownPicker
                open={categoryMenuVisible}
                setOpen={setCategoryMenuVisible}
                value={categoryForm.type}
                setValue={callback => {
                  const value =
                    typeof callback === 'function' ? callback(null) : callback;
                  handleCategoryFormChange('type', value);
                }}
                items={[
                  {label: 'Income', value: 'Income'},
                  {label: 'Expense', value: 'Expense'},
                ]}
                placeholder="Select Category Type"
                style={{
                  borderColor: 'transparent',
                  backgroundColor: 'transparent',
                  borderRadius: 10,
                }}
                dropDownContainerStyle={{
                  borderColor: '#ccc',
                  borderRadius: 10,
                  width: '95%',
                  alignSelf: 'center',
                }}
                placeholderStyle={{
                  color: '#666',
                  fontSize: 12,
                }}
                selectedItemLabelStyle={{
                  fontWeight: 'bold',
                  color: '#1F615C',
                }}
                listItemLabelStyle={{
                  color: '#000',
                }}
              />
            </View>

            {/* Amount Input */}
            <TextInput
              placeholder="Category Name"
              value={categoryForm.name}
              placeholderTextColor="gray"
              onChangeText={text => handleCategoryFormChange('name', text)}
              style={styles.inputField}
            />

            {/* Add Image Button */}
            <TouchableOpacity
              style={styles.addImgBtn}
              onPress={() => pickImage()}>
              {categoryForm.image ? (
                <Text style={styles.addImgBtnText} numberOfLines={1}>
                  {categoryForm.image.split('/').pop()}
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
                    width: '95%',
                    alignSelf: 'center',
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
                  {alignSelf: 'center', marginTop: 20, width: '60%'},
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
    fontSize: 18,
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
    width: 22,
    height: 22,
    marginRight: 12,
    tintColor: '#fff',
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  typeHeading: {
    fontSize: 14,
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
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
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
    backgroundColor: 'red',
    borderRadius: 15,
    position: 'absolute',
    top: -8,
    right: -8,
    width: 25,
    height: 25,
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
    height: 50,
    padding: 10,
    borderRadius: 10,
    borderColor: 'gray',
    borderWidth: 1,
    color: '#000',
    marginVertical: 10,
  },
  categoryField: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: '#000',
    padding: 10,
    paddingRight: 11,
    borderRadius: 10,
  },
  addImgBtn: {
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 0.8,
    width: '100%',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  addImgIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
    tintColor: 'rgba(0, 0, 0, 0.5)',
  },
  addImgBtnText: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: 'bold',
    fontSize: 12,
  },
  addImgBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#1F615C',
    height: 45,
    width: '30%',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  saveBtnText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6c757d',
    letterSpacing: 1,
  },
  transactionDate: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: 'bold',
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
    fontSize: 12,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  categoryTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryImage: {
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
  categoryImage2: {
    width: 40,
    height: 40,
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
    fontSize: 16,
    textAlign: 'center',
    paddingBottom: 8,
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
    fontSize: 14,
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
