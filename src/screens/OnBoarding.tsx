import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';

const OnBoarding = ({ navigation }: any) => {
    return (
        <View style={styles.container}>
            <View style={styles.bg} />
            <Image
                source={require('../assets/Donut.png')}
                style={styles.donut}
                resizeMode="contain"
            />
            <Image
                source={require('../assets/Coint.png')}
                style={styles.coin}
                resizeMode="contain"
            />
            <Image
                source={require('../assets/Man.png')}
                style={styles.image}
                resizeMode="contain"
            />
            <View style={styles.textContainer}>
                <Text style={styles.text}>Spend Smarter</Text>
                <Text style={styles.text}>Save More</Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.replace('Signup')}
                >
                    <Text style={styles.btnText}>Get Started</Text>
                </TouchableOpacity>
                <View style={{
                    marginTop: 30,
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

export default OnBoarding;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    bg: {
        position: 'absolute',
        top: -30,
        width: 800,
        height: '60%',
        backgroundColor: '#EEF8F7',
        transform: [{ rotate: '10deg' }],
    },
    donut: {
        position: 'absolute',
        top: 90,
        left: 50,
    },
    image: {
        marginTop: 100,
        width: '80%',   // Adjust width based on parent container
        height: '45%',  // Adjust height based on parent container
    },
    coin: {
        position: 'absolute',
        top: 130,
        right: 50,
        height: 90,
    },
    textContainer: {
        marginTop: 50,
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#438883',
    },
    buttonContainer: {
        marginTop: 50,
    },
    button: {
        backgroundColor: '#3E7C78',
        width: 250,
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
