import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default class CameraExample extends React.Component {
  render() {
    const {
      navigation: {
        state: {
          params: { texts }
        }
      }
    } = this.props;
    return <Text>{texts[0].description}</Text>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
