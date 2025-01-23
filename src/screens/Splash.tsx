import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'

const Splash = ({ navigation }: any) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('OnBoarding')
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigation])
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={{ width: 300, height: 300, tintColor: 'white' }}
      />
    </View>
  )
}

export default Splash

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#63B5AF'
  }
})