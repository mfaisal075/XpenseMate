import {
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {LineChart, PieChart} from 'react-native-chart-kit';
import {Dimensions} from 'react-native';
import {useTransactionContext} from '../components/TransactionContext';
import {Transaction} from '../components/Interface';
import Toast from 'react-native-toast-message';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {Alert} from 'react-native';
import {ProgressBar} from 'react-native-paper';
import {useCurrency} from '../components/CurrencyContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Stats = ({tabChange}: any) => {
  const {transactions, fetchTransactions, categories} = useTransactionContext();
  const [selectedTab, setSelectedTab] = useState('Weakly');
  const [weeklyData, setWeeklyData] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<Transaction[]>([]);
  const [yearlyData, setYearlyData] = useState<Transaction[]>([]);
  const [selectedContainer, setSelectedContainer] = useState('Summary');
  const {getCurrencySymbol} = useCurrency();

  const memoizedFetchTransactions = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    // Function to handle tab changes
    const backBtnPress = () => {
      tabChange();
      return true;
    };

    // Filter transactions based on the current week and type "expense"
    const weekly = transactions.filter((item: any) => {
      const transactionDate = new Date(item.date);
      const currentDate = new Date();
      const currentWeekStart = new Date(
        currentDate.setDate(currentDate.getDate() - currentDate.getDay()),
      );
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

      return (
        item.type === 'expense' &&
        transactionDate >= currentWeekStart &&
        transactionDate <= currentWeekEnd
      );
    });

    // Filter transactions for the current month and type "expense"
    const monthly = transactions.filter((item: any) => {
      const transactionDate = new Date(item.date);
      const currentMonth = new Date().getMonth();
      return (
        item.type === 'expense' && transactionDate.getMonth() === currentMonth
      );
    });

    // Filter transactions for the current year and type "expense"
    const yearly = transactions.filter((item: any) => {
      const transactionDate = new Date(item.date);
      const currentYear = new Date().getFullYear();
      return (
        item.type === 'expense' && transactionDate.getFullYear() === currentYear
      );
    });

    // Update state only if the filtered data has changed
    if (JSON.stringify(weekly) !== JSON.stringify(weeklyData)) {
      setWeeklyData(weekly);
    }
    if (JSON.stringify(monthly) !== JSON.stringify(monthlyData)) {
      setMonthlyData(monthly);
    }
    if (JSON.stringify(yearly) !== JSON.stringify(yearlyData)) {
      setYearlyData(yearly);
    }

    memoizedFetchTransactions();
    BackHandler.addEventListener('hardwareBackPress', backBtnPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backBtnPress);
    };
  }, [
    transactions,
    weeklyData,
    monthlyData,
    yearlyData,
    memoizedFetchTransactions,
    tabChange,
  ]);

  // Weekly Data Function
  const getWeeklyData = () => {
    const dailyAmounts = Array(7).fill(0); // Array to hold totals for each day of the week
    weeklyData.forEach(item => {
      const dayIndex = new Date(item.date).getDay();
      dailyAmounts[dayIndex] += item.amount; // Sum up amounts for each day
    });

    return {
      labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      datasets: [
        {
          data: dailyAmounts,
        },
      ],
    };
  };

  // Monthly Data Function
  const getMonthlyData = () => {
    const weeklyAmounts = Array(4).fill(0); // Array to hold totals for each week
    monthlyData.forEach(item => {
      const transactionDate = new Date(item.date);
      const weekIndex = Math.floor((transactionDate.getDate() - 1) / 7);
      weeklyAmounts[weekIndex] += item.amount; // Sum up amounts for each week
    });

    return {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          data: weeklyAmounts,
        },
      ],
    };
  };

  // Yearly Data Function
  const getYearlyData = () => {
    const monthlyAmounts = Array(12).fill(0); // Array to hold totals for each month
    yearlyData.forEach(item => {
      const monthIndex = new Date(item.date).getMonth();
      monthlyAmounts[monthIndex] += item.amount; // Sum up amounts for each month
    });

    return {
      labels: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      datasets: [
        {
          data: monthlyAmounts,
        },
      ],
    };
  };

  // Generate Report
  const generateReport = async () => {
    if (transactions.length === 0) {
      Alert.alert('Error', 'No transactions found');
      return;
    }

    const totalIncome = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpense = transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

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

    const fileName = `Transaction_Report_${
      new Date().toISOString().split('T')[0]
    }`;

    try {
      const options = {
        html: htmlContent,
        fileName: fileName,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('PDF file saved to:', file.filePath);

      Toast.show({
        type: 'success',
        text1: 'Report Generated',
        text2: `The report has been generated and saved to ${file.filePath}`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert(
        'Error',
        'Something went wrong while generating the report. Please try again.',
      );
    }
  };

  // Pie Chart Data Function
  const getPieChartData = () => {
    const categoryAmounts: {[key: string]: number} = {};

    const currentMonth = new Date().getMonth();
    transactions.forEach(item => {
      const transactionDate = new Date(item.date);
      if (
        item.type === 'expense' &&
        transactionDate.getMonth() === currentMonth
      ) {
        if (!categoryAmounts[item.category]) {
          categoryAmounts[item.category] = 0;
        }
        categoryAmounts[item.category] += item.amount;
      }
    });

    const colors = [
      '#FF6384', // Red
      '#36A2EB', // Blue
      '#FFCE56', // Yellow
      '#4BC0C0', // Teal
      '#9966FF', // Purple
      '#FF9F40', // Orange
      '#8A2BE2', // BlueViolet
      '#00FA9A', // MediumSpringGreen
      '#FFD700', // Gold
      '#DC143C', // Crimson
      '#00CED1', // DarkTurquoise
      '#FF4500', // OrangeRed
    ];

    const pieData = Object.keys(categoryAmounts).map((category, index) => ({
      name: category,
      amount: categoryAmounts[category],
      color: colors[index % colors.length],
      legendFontColor: 'black',
      legendFontSize: 12,
    }));

    return pieData;
  };

  const getProgressColor = (percentage: number, hasBudget: boolean) => {
    if (!hasBudget) return '#7f8c8d'; // Grayish color for "No Budget"
    if (percentage < 70) return 'green';
    if (percentage >= 70 && percentage <= 100) return 'orange';
    return 'red';
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Image
          source={require('../assets/ellipse.png')}
          style={{
            width: 150,
            height: 150,
            position: 'absolute',
            top: -5,
            left: -5,
            zIndex: 0,
          }}
          resizeMode="contain"
        />
        <View style={styles.contentContainer}>
          <TouchableOpacity onPress={() => tabChange()}>
            <Image
              source={require('../assets/back.png')}
              style={{width: 20, height: 20, tintColor: '#fff'}}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.heading}>Stats</Text>
          <TouchableOpacity onPress={generateReport}>
            <Image
              source={require('../assets/download.png')}
              style={{width: 25, height: 25, tintColor: '#fff'}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.toggleContainer}>
        <View style={styles.toggleButton}>
          <TouchableOpacity
            style={
              selectedContainer === 'Summary'
                ? styles.buttonContainer
                : {...styles.buttonContainer, backgroundColor: 'gray'}
            }
            onPress={() => setSelectedContainer('Summary')}>
            <Text
              style={
                selectedContainer === 'Summary'
                  ? styles.buttonText
                  : {...styles.buttonText, color: 'white'}
              }>
              Category Budget Summary
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              selectedContainer === 'Spending'
                ? styles.buttonContainer
                : {...styles.buttonContainer, backgroundColor: 'gray'}
            }
            onPress={() => setSelectedContainer('Spending')}>
            <Text
              style={
                selectedContainer === 'Spending'
                  ? styles.buttonText
                  : {...styles.buttonText, color: 'white'}
              }>
              Spending Insights
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Container */}
      {selectedContainer === 'Summary' && (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.bottomContainer}>
            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="insert-chart" size={24} color="#6366f1" />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.cardTitle}>Spending Summary</Text>
                  <Text style={styles.monthText}>
                    {new Date().toLocaleString('default', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              {categories
                .filter(category => category.type.toLowerCase() === 'expense')
                .map(category => {
                  const currentMonth = new Date().getMonth();
                  const totalSpent = transactions
                    .filter(
                      tx =>
                        tx.category === category.name &&
                        tx.type.toLowerCase() === 'expense' &&
                        new Date(tx.date).getMonth() === currentMonth,
                    )
                    .reduce((total, tx) => total + tx.amount, 0);

                  const hasBudget =
                    category.budget !== null && category.budget !== undefined;
                  const budget = parseFloat(category.budget) || 0;
                  const percentage =
                    hasBudget && budget > 0 ? (totalSpent / budget) * 100 : 0;
                  const color = getProgressColor(percentage, hasBudget);

                  return (
                    <View key={category.id} style={styles.categoryItem}>
                      <View style={styles.categoryHeader}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <View style={styles.amountWrapper}>
                          {hasBudget ? (
                            <>
                              <Text style={[styles.spentAmount, {color}]}>
                                {getCurrencySymbol()}
                                {totalSpent.toFixed(1)}
                              </Text>
                              <Text style={styles.budgetAmount}>
                                / {getCurrencySymbol()}
                                {budget.toFixed(1)}
                              </Text>
                            </>
                          ) : (
                            <Text style={styles.noBudgetLabel}>
                              No Budget Set
                            </Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.progressWrapper}>
                        <View
                          style={[
                            styles.progressBarBackground,
                            hasBudget && {backgroundColor: `${color}20`},
                          ]}>
                          <ProgressBar
                            indeterminate={false}
                            progress={Math.min(percentage, 100) / 100}
                            color={color}
                            style={styles.progressBar}
                          />
                        </View>
                        <Text style={[styles.percentageLabel, {color}]}>
                          {hasBudget ? `${Math.round(percentage)}%` : '—'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
            </View>
          </View>
        </ScrollView>
      )}
      {selectedContainer === 'Spending' && (
        <ScrollView>
          <View style={styles.bottomContainer}>
            <View style={styles.historySec}>
              <View style={styles.historySecTopBar}>
                <Text style={styles.chartHeading}>Expense Overview</Text>
              </View>

              {/* Pie Chart */}
              <View style={styles.pieChart}>
                <PieChart
                  data={getPieChartData()}
                  width={Dimensions.get('window').width - 30} // Adjusted width to add padding
                  height={getPieChartData().length > 7 ? 160 : 180} // Conditional height based on categories
                  chartConfig={{
                    backgroundColor: '#f5f5f5',
                    backgroundGradientFrom: '#FFFFFF',
                    backgroundGradientTo: '#FFFFFF',
                    color: (opacity = 1) => `rgba(80, 200, 120, ${opacity})`, // Emerald green for labels
                    labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`, // Darker gray for labels
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="-10" // Removed padding for better alignment
                  absolute
                  avoidFalseZero
                  hasLegend={false} // Disable default legend
                />
                <View style={styles.customLegend}>
                  {getPieChartData().map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendColor,
                          {backgroundColor: item.color},
                        ]}
                      />
                      <Text style={styles.legendText}>{item.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Line Chart */}
            <View style={[styles.chartContainer]}>
              <View style={styles.chartTopBar}>
                <TouchableOpacity
                  style={
                    selectedTab === 'Weakly'
                      ? styles.chartBtn
                      : {
                          width: 100,
                          height: '100%',
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: 'transparent',
                        }
                  }
                  onPress={() => setSelectedTab('Weakly')}>
                  <Text
                    style={
                      selectedTab === 'Weakly'
                        ? styles.chartBtnTxt
                        : {color: '#000', fontWeight: 'bold'}
                    }>
                    Weekly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={
                    selectedTab === 'Monthly'
                      ? styles.chartBtn
                      : {
                          width: 100,
                          height: '100%',
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: 'transparent',
                        }
                  }
                  onPress={() => setSelectedTab('Monthly')}>
                  <Text
                    style={
                      selectedTab === 'Monthly'
                        ? styles.chartBtnTxt
                        : {color: '#000', fontWeight: 'bold'}
                    }>
                    Monthly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={
                    selectedTab === 'Yearly'
                      ? styles.chartBtn
                      : {
                          width: 100,
                          height: '100%',
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: 'transparent',
                        }
                  }
                  onPress={() => setSelectedTab('Yearly')}>
                  <Text
                    style={
                      selectedTab === 'Yearly'
                        ? styles.chartBtnTxt
                        : {color: '#000', fontWeight: 'bold'}
                    }>
                    Yearly
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chart}>
                <View
                  style={{borderRadius: 20, overflow: 'hidden', elevation: 5}}>
                  <LineChart
                    data={
                      selectedTab === 'Weakly'
                        ? getWeeklyData()
                        : selectedTab === 'Monthly'
                        ? getMonthlyData()
                        : getYearlyData()
                    }
                    width={Dimensions.get('window').width - 30}
                    height={210}
                    chartConfig={{
                      backgroundColor: 'transparent',
                      backgroundGradientFrom: '#438883',
                      backgroundGradientTo: '#438883',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      labelColor: (opacity = 1) =>
                        `rgba(255, 255, 255, ${opacity})`,
                      style: {borderRadius: 16},
                      propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                        stroke: '#438883',
                      },
                    }}
                    bezier
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default Stats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF8F7',
  },
  topBar: {
    height: 90,
    backgroundColor: '#1F615C',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  contentContainer: {
    width: '90%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomContainer: {
    flex: 1,
  },
  chartContainer: {
    width: '100%',
    height: '40%',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 65,
  },
  chartTopBar: {
    width: '100%',
    height: 35,
    paddingHorizontal: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  chartBtn: {
    width: 100,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#438883',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  chartBtnTxt: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chart: {
    width: '100%',
    height: '90%',
    marginVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historySec: {
    width: '100%',
    height: 'auto',
    marginBottom: 30,
    marginTop: 10,
  },
  historySecTopBar: {
    width: '100%',
    height: 35,
    paddingHorizontal: 30,
  },

  // Transaction Item Styles
  transactionItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  txnItemLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  transactionTypeText: {
    fontSize: 14,
    color: '#6c757d',
  },
  transactionText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 14,
    color: '#6c757d',
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
  incmExpnsHistory: {
    width: '100%',
    height: '100%',
  },
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

  // Pie Chart Styles
  pieChart: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    backgroundColor: '#f5f5f5',
    elevation: 4,
    marginVertical: 5,
    marginHorizontal: 20,
  },
  customLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#000',
  },

  // Budget Card Styles
  scrollContent: {
    paddingBottom: 5,
  },
  budgetCard: {
    backgroundColor: '#E8F6EF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F615C',
    marginBottom: 8,
  },
  budgetText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  budgetButton: {
    backgroundColor: '#1F615C',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },

  budgetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chartHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  // Progress Bar Styles
  scrollContainer: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    letterSpacing: -0.4,
  },
  categoryItem: {
    marginVertical: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    maxWidth: '60%',
  },
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  spentAmount: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  budgetAmount: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '500',
  },
  noBudgetLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  percentageLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 12,
    minWidth: 42,
    textAlign: 'right',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  monthText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },

  // Toggle Container Styles
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
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
