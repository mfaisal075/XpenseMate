import React from 'react';
import {Modalize} from 'react-native-modalize';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ActionSheetProps {
  ref: React.RefObject<Modalize>;
  options: {
    label: string;
    icon: string;
    action: () => void;
  }[];
}

const ActionSheet = React.forwardRef<Modalize, ActionSheetProps>(
  ({options}, ref) => {
    return (
      <Modalize
        ref={ref}
        adjustToContentHeight
        handlePosition="inside"
        modalStyle={styles.modal}>
        <View style={styles.container}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={option.action}>
              <Icon name={option.icon} size={24} color="#1B5C58" />
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modalize>
    );
  },
);

const styles = StyleSheet.create({
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#1B5C58',
  },
});

export default ActionSheet;
