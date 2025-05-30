import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  BackHandler,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {send, EmailJSResponseStatus} from '@emailjs/react-native';
import Toast from 'react-native-toast-message';

interface FormData {
  email: string;
  name: string;
  message: string;
}

const initialFormData: FormData = {
  email: '',
  name: '',
  message: '',
};

const FAQ_DATA = [
  {
    question: 'How do I reset my password?',
    answer:
      "Go to your profile settings and click 'Forgot Password'. You'll receive a password reset link via email.",
  },
  {
    question: 'Why are my transactions not syncing?',
    answer:
      'Ensure you have an active internet connection. If the problem persists, try logging out and back in.',
  },
  {
    question: 'How to export my transaction history?',
    answer:
      'Navigate to the Stats screen and use the download icon to generate a PDF report of your transactions.',
  },
  {
    question: 'Is my financial data secure?',
    answer:
      'Yes, we use bank-grade encryption to protect all your financial information.',
  },
];

const ContactUs = ({goToProfile}: any) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);

  const handleOnChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'All fields are required.',
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
      });
      return;
    }

    const serviceId = 'service_dbp03tk';
    const templateId = 'template_uxoiuda';
    const publicKey = '8cMRYAwpZbX9OTVd_';
    try {
      await send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_email: 'fhafiz397@gmail.com',
          to_name: 'Mian Faisal Latif',
        },
        {
          publicKey: publicKey,
        },
      );
      Toast.show({
        type: 'success',
        text1: 'Message Sent',
        text2: 'Your message has been sent successfully!',
      });
      setFormData(initialFormData);
    } catch (err) {
      if (err instanceof EmailJSResponseStatus) {
        console.log('EmailJS Request Failed...', err);
      }
      console.log('ERROR', err);
    }
  };

  useEffect(() => {
    const backAction = () => {
      goToProfile();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  // Add FAQ modal content
  const renderFaqModal = () => (
    <Modal
      visible={showFaqModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFaqModal(false)}>
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={() => setShowFaqModal(false)}>
        <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
          <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
          <ScrollView>
            {FAQ_DATA.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <Text style={styles.questionText}>Q: {faq.question}</Text>
                <Text style={styles.answerText}>A: {faq.answer}</Text>
                {index !== FAQ_DATA.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1B5C58', '#438883']} style={styles.heroSec}>
        <View style={styles.topContainer}>
          <TouchableOpacity onPress={goToProfile} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topBarHeading}>Contact Us</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}>
        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#888"
            value={formData.name}
            onChangeText={text => handleOnChange('name', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Your Email"
            placeholderTextColor="#888"
            value={formData.email}
            onChangeText={text => handleOnChange('email', text)}
          />
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Your Message"
            placeholderTextColor="#888"
            value={formData.message}
            onChangeText={text => handleOnChange('message', text)}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Direct Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Direct Contact</Text>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => Linking.openURL('mailto:support@xpensemate.com')}>
            <Icon name="email" size={24} color="#1B5C58" />
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactType}>Email Support</Text>
              <Text style={styles.contactDetail}>support@xpensemate.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() =>
              Linking.openURL('whatsapp://send?phone=+923105678901')
            }>
            <Icon name="whatsapp" size={24} color="#1B5C58" />
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactType}>WhatsApp</Text>
              <Text style={styles.contactDetail}>+92 310 5678901</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setShowFaqModal(true)}>
          <View style={styles.faqContainer}>
            <Icon name="help-circle-outline" size={24} color="#1B5C58" />
            <View style={styles.faqTextContainer}>
              <Text style={styles.sectionTitle}>FAQs</Text>
              <Text style={styles.faqSubtitle}>
                Common questions & solutions
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#1B5C58" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal */}
      {renderFaqModal()}
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
  scrollContainer: {
    flex: 1,
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
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#333',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1B5C58',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  contactTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  contactType: {
    color: '#1B5C58',
    fontSize: 14,
    fontWeight: '500',
  },
  contactDetail: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  faqContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  faqSubtitle: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },

  //FAQs Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B5C58',
    marginBottom: 16,
    textAlign: 'center',
  },
  faqItem: {
    paddingVertical: 12,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B5C58',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 12,
  },
});

export default ContactUs;
