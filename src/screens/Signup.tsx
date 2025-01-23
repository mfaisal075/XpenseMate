import { Alert, BackHandler, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../FirebaseConfig';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Signup = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    const handleSignup = async () => {
        const auth = FIREBASE_AUTH;
        const db = FIRESTORE_DB;
        
        if (!email || !password || !fullName || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all the fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user details in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                fullName,
                email,
            });

            Alert.alert('Success', 'User created successfully');
            await signOut(auth);
            navigation.replace('Login');
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Error', 'This email is already in use. Please try logging in.');
            } else {
                Alert.alert('Error', error.message);
            }
            console.error(error.message);
        }
    };


    useEffect(() => {
        const backPress = () => {
            navigation.replace('Login');
            return true;
        }

        BackHandler.addEventListener('hardwareBackPress', backPress);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.headerText}>Signup</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholderTextColor={'gray'}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor={'gray'}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                        placeholderTextColor={'gray'}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={true}
                        placeholderTextColor={'gray'}
                    />
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleSignup()}
                >
                    <Text style={styles.btnText}>Sign up</Text>
                </TouchableOpacity>
                <View style={{
                    marginTop: 10,
                    marginBottom: 10,
                    width: 250,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}>
                    <Text style={{
                        color: '#444444',
                        fontSize: 16,
                        fontWeight: '600',
                    }}>Already Have Account? </Text>
                    <TouchableOpacity onPress={() => navigation.replace('Login')}>
                        <Text style={{
                            color: '#438883',
                            fontSize: 16,
                            fontWeight: '600',
                        }}>Log In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default Signup;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EEF8F7',
    },
    contentContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#438883',
        alignSelf: 'center',
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5, // Shadow on Android
    },
    input: {
        height: 50,
        padding: 10,
        borderRadius: 10,
        borderColor: 'gray',
        borderWidth: 1,
        color: '#000',
    },
    button: {
        marginTop: 10,
        marginBottom: 10,
        alignSelf: 'center',
        backgroundColor: '#3E7C78',
        width: 270,
        height: 50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
    btnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
