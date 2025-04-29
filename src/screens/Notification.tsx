import {
  BackHandler,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {Modal} from 'react-native';
import {openDatabase} from '../../database';

type NotificationType = {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  readStatus: boolean;
};

const Notification = ({navigation}: any) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchNotifications = async () => {
    const db = await openDatabase();
    try {
      const [results] = await db.executeSql(
        `SELECT id, title, message, timestamp, readStatus 
         FROM notifications 
         ORDER BY timestamp DESC`,
      );

      const items: NotificationType[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        items.push({
          id: row.id.toString(),
          title: row.title,
          message: row.message,
          timestamp: new Date(row.timestamp),
          readStatus: row.readStatus === 1, // Convert SQLite 0/1 to boolean
        });
      }
      setNotifications(items);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = async (item: NotificationType) => {
    if (!item.readStatus) {
      // Update in database
      const db = await openDatabase();
      await db.executeSql(
        'UPDATE notifications SET readStatus = 1 WHERE id = ?',
        [item.id],
      );

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === item.id
            ? {...notification, readStatus: true}
            : notification,
        ),
      );
    }

    setSelectedNotification(item);
    setModalVisible(true);
  };

  const renderNotificationItem = ({item}: {item: NotificationType}) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => handleNotificationPress(item)}>
      <View style={styles.notificationContent}>
        <Text
          style={[
            styles.notificationTitle,
            !item.readStatus && styles.unreadTitle,
          ]}>
          {item.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={1}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>
          {item.timestamp.toLocaleDateString()} •{' '}
          {item.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      {!item.readStatus && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  const tabChange = () => {
    navigation.replace('Home');
  };

  useEffect(() => {
    const backPress = () => {
      navigation.replace('Home');
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backPress);
  }, []);

  const NotificationModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <Text style={styles.modalMessage}>
            {selectedNotification?.message}
          </Text>

          <Text style={styles.modalTime}>
            {selectedNotification?.timestamp.toLocaleString()}
          </Text>
        </View>
      </View>
    </Modal>
  );

  return (
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
        <View style={styles.topContainer}>
          <TouchableOpacity onPress={() => tabChange()}>
            <Image
              source={require('../assets/back.png')}
              style={{width: 20, height: 20, tintColor: '#fff'}}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.topBarHeading}>Notifications</Text>
        </View>
        <View style={styles.bottomContainer}>
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No notifications yet</Text>
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
      </LinearGradient>

      <NotificationModal />
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF8F7',
  },
  heroSec: {
    width: '100%',
    height: '100%',
  },
  topContainer: {
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 10,
    margin: 20,
    alignItems: 'center',
  },
  topBarHeading: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 30,
  },

  notificationItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5C58',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#438883',
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
  listContent: {
    paddingVertical: 15,
  },

  //Modal Styling
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5C58',
    flex: 1,
  },
  closeButton: {
    marginLeft: 15,
    paddingHorizontal: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#438883',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 15,
  },
  modalTime: {
    fontSize: 14,
    color: '#999',
    textAlign: 'right',
  },
  unreadTitle: {
    color: '#1B5C58',
    fontWeight: 'bold',
  },
});
