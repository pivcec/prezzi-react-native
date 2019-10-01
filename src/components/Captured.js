import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default class CameraExample extends React.Component {
  render() {
    const {
      navigation: {
        state: {
          params: { labels }
        }
      }
    } = this.props;
    return labels.map((label, i) => <Text key={i}>{label.description}</Text>);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
