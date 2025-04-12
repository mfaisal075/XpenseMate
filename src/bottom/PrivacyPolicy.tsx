import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PrivacyPolicy = ({goToProfile}: any) => {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B5C58', '#438883']} style={styles.heroSec}>
        <View style={styles.topContainer}>
          <TouchableOpacity onPress={goToProfile} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topBarHeading}>Privacy Policy</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.bodyText}>
            We value your privacy and are committed to protecting your personal
            information. This policy explains how we collect, use, and safeguard
            your data when you use our application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Collection</Text>
          <Text style={styles.bodyText}>
            We collect only necessary information to provide our services,
            including:
            {'\n\n'}• Account information (email, username)
            {'\n'}• Transaction data
            {'\n'}• Device information
            {'\n'}• Usage statistics
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Usage</Text>
          <Text style={styles.bodyText}>
            Your information helps us to:
            {'\n\n'}• Provide and improve our services
            {'\n'}• Personalize your experience
            {'\n'}• Maintain security
            {'\n'}• Communicate important updates
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Measures</Text>
          <Text style={styles.bodyText}>
            We implement industry-standard security measures including:
            {'\n\n'}• Encryption
            {'\n'}• Regular security audits
            {'\n'}• Access controls
            {'\n'}• Secure server infrastructure
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.bodyText}>
            You have the right to:
            {'\n\n'}• Access your personal data
            {'\n'}• Request corrections
            {'\n'}• Delete your account
            {'\n'}• Opt-out of communications
          </Text>
        </View>

        <Text style={styles.contactText}>
          For more information, contact us at{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('mailto:support@xpensemate.com')}>
            support@xpensemate.com
          </Text>
        </Text>

        <View style={styles.spacer} />
      </ScrollView>

      <SafeAreaView style={styles.safeAreaBottom} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  heroSec: {
    height: 160,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 50,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
  },
  topBarHeading: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 24,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#438883',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    color: '#1B5C58',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  bodyText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 22,
  },
  contactText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 16,
    textAlign: 'center',
  },
  link: {
    color: '#1B5C58',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  safeAreaBottom: {
    backgroundColor: '#F5F5F5',
  },
  spacer: {
    height: 30, // Extra space at bottom
  },
});

export default PrivacyPolicy;
