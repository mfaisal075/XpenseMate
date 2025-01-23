import { BackHandler, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import LinearGradient from 'react-native-linear-gradient'

const AccountDetails = ({ goToProfile, navigateToNotification }: any) => {
    useEffect(() => {
        const backPress = () => {
            goToProfile();
            return true;
        }

        BackHandler.addEventListener('hardwareBackPress', backPress);
    }, [])
    return (
        <View style={{ flex: 1 }}>
            <LinearGradient
                colors={['#1B5C58', '#438883']}
                style={styles.heroSec}>
                <Image
                    source={require('../assets/ellipse.png')}
                    style={{ width: 180, height: 180, position: 'absolute', top: -5, left: -5, zIndex: 0 }}
                    resizeMode="contain"
                />
                <View style={styles.topContainer}>
                    <TouchableOpacity onPress={goToProfile}>
                        <Image
                            source={require('../assets/back.png')}
                            style={{ width: 20, height: 20, tintColor: '#fff' }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <Text style={styles.topBarHeading}>Account Details</Text>
                    <TouchableOpacity style={styles.notificationConatiner} onPress={navigateToNotification}>
                        <View style={styles.notificationRedCircle} />
                        <Image
                            source={require('../assets/notification.png')}
                            style={{ width: 22, height: 22, tintColor: '#fff', }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    )
}

export default AccountDetails

const styles = StyleSheet.create({
    heroSec: {
        width: '100%',
        height: '20%',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
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
})