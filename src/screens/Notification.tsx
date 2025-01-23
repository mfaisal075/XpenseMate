import { BackHandler, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import LinearGradient from 'react-native-linear-gradient'

const Notification = ({ navigation }: any) => {
    const tabChange = () => {
        navigation.replace('Home');
    }

    useEffect(() => {
        const backPress = () => {
            navigation.replace('Home');
            return true;
        }

        BackHandler.addEventListener('hardwareBackPress', backPress);
    }, []);
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1B5C58', '#438883']}
                style={styles.heroSec}>
                <Image
                    source={require('../assets/ellipse.png')}
                    style={{ width: 180, height: 180, position: 'absolute', top: -5, left: -5, zIndex: 0 }}
                    resizeMode="contain"
                />
                <View style={styles.topContainer}>
                    <TouchableOpacity onPress={() => tabChange()}>
                        <Image
                            source={require('../assets/back.png')}
                            style={{ width: 20, height: 20, tintColor: '#fff' }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <Text style={styles.topBarHeading}>Notifications</Text>

                </View>
                <View style={styles.bottomContainer}></View>
            </LinearGradient>
        </View>
    )
}

export default Notification

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
    }
})