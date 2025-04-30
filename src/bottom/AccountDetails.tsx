import React, {useEffect, useState} from 'react';
import {
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../../FirebaseConfig';
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-toast-message';

const AccountDetails = ({goToProfile, navigateToNotification}: any) => {
  const [name, setName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userDOB, setUserDOB] = useState('');
  const [userName, setUserName] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editDOB, setEditDOB] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const fetchUserData = async () => {
    const db = FIRESTORE_DB;
    const auth = FIREBASE_AUTH;
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setName(userData.fullName);
        setUserEmail(userData.email);
        setUserPhone(userData.phone);
        setUserAddress(userData.address);
        setUserName(userData.userName);
        setUserDOB(userData.dob || new Date().toISOString().split('T')[0]);

        // Set initial values for edit fields
        setEditName(userData.fullName);
        setEditEmail(userData.email);
        setEditPhone(userData.phone);
        setEditAddress(userData.address);
        setEditUsername(`${userData.userName}`);
        setEditDOB(userData.dob ? new Date(userData.dob) : new Date());
      }
    }
  };

  useEffect(() => {
    fetchUserData();
    const backPress = () => {
      goToProfile();
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backPress);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backPress);
  }, []);

  const handleEdit = () => {
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!editName || !editEmail || !editPhone || !editAddress || !editDOB) {
      Alert.alert('Please fill in all fields');
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - editDOB.getFullYear();
    const monthDifference = today.getMonth() - editDOB.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < editDOB.getDate())
    ) {
      age--;
    }

    if (age < 13) {
      Alert.alert('You must be at least 13 years old');
      return;
    }

    const db = FIRESTORE_DB;
    const auth = FIREBASE_AUTH;
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: editName,
        email: editEmail,
        phone: editPhone,
        address: editAddress,
        userName: `${editUsername}`,
        dob: editDOB.toISOString().split('T')[0], // Save date in YYYY-MM-DD format
      });
      fetchUserData(); // Refresh the user data
      setModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Update Successful',
        text2: 'Your details have been successfully updated.',
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return ''; // Handle empty or invalid dates

    const date = new Date(dateString); // Parse the date string
    const day = String(date.getDate()).padStart(2, '0'); // Ensure 2 digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();

    return `${day}-${month}-${year}`; // Return formatted date
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B5C58', '#438883']} style={styles.heroSec}>
        <View style={styles.topContainer}>
          <TouchableOpacity onPress={goToProfile}>
            <Image
              source={require('../assets/back.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.topBarHeading}>Personal Details</Text>
          <TouchableOpacity style={styles.notificationContainer} disabled>
            <View style={styles.notificationRedCircle} />
            <Image
              source={require('../assets/notification.png')}
              style={[styles.icon, {tintColor: 'transparent'}]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.detailsContainer}>
        <Image
          source={require('../assets/profile.png')}
          style={styles.profileImage}
          resizeMode="cover"
        />
        <Text style={styles.userName}>{name}</Text>
        <Text style={styles.userEmail}>{userName}</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoText}>{userEmail}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Contact</Text>
          <Text style={styles.infoText}>
            {userPhone ? userPhone : 'No Contact Number'}
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Address</Text>
          <Text style={styles.infoText}>
            {userAddress ? userAddress : 'No Address Available'}
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Date of Birth</Text>
          <Text style={styles.infoText}>
            {userDOB ? formatDate(userDOB) : 'No Date of Birth Available'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>

      {/* Edit Details Modal */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
              }}
              style={{zIndex: 100}}>
              <Image
                source={require('../assets/close.png')}
                style={{
                  height: 24,
                  width: 24,
                  position: 'absolute',
                  right: 0,
                  top: -2,
                }}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={'gray'}
              value={editName}
              onChangeText={setEditName}
            />
            <View
              style={[
                styles.input,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: 40, // Ensure consistent height
                  paddingVertical: 0, // Remove extra padding
                },
              ]}>
              <Text style={{color: 'gray', fontWeight: 'bold'}}>@</Text>
              <TextInput
                style={{flex: 1, height: '100%'}} // Ensure TextInput fills the height
                placeholder="username"
                placeholderTextColor={'gray'}
                value={editUsername.replace(/^@/, '')}
                onChangeText={text =>
                  setEditUsername('@' + text.replace(/@/g, ''))
                }
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={'gray'}
              value={editEmail}
              onChangeText={setEditEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              placeholderTextColor={'gray'}
              value={editPhone}
              onChangeText={setEditPhone}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor={'gray'}
              value={editAddress}
              onChangeText={setEditAddress}
            />
            <TouchableOpacity
              style={styles.input}
              onPress={() => setDatePickerVisible(true)}>
              <Text>
                {editDOB.toISOString().split('T')[0]}{' '}
                {/* Display selected date */}
              </Text>
            </TouchableOpacity>
            <DatePicker
              modal
              open={isDatePickerVisible}
              date={editDOB}
              mode="date"
              onConfirm={date => {
                setDatePickerVisible(false);
                setEditDOB(date);
              }}
              onCancel={() => {
                setDatePickerVisible(false);
              }}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AccountDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  heroSec: {
    width: '100%',
    height: '25%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 40,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  topBarHeading: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  notificationContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationRedCircle: {
    height: 8,
    width: 8,
    borderRadius: 5,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  detailsContainer: {
    width: '90%',
    height: '62%',
    alignItems: 'center',
    marginTop: -70,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    elevation: 5,
    paddingBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#1B5C58',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5C58',
  },
  userEmail: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 10,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1B5C58',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  editButton: {
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: '#1B5C58',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1B5C58',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#1B5C58',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
