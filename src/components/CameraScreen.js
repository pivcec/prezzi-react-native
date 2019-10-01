import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  Image,
  Dimensions
} from "react-native";
import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import * as ImageManipulator from "expo-image-manipulator";
import { Icon } from "react-native-elements";

export default class CameraScreen extends React.Component {
  state = {
    hasCameraPermission: null,
    isCapturing: false,
    capturedImageUri: null
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === "granted",
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height
    });
  }

  getResizedImage = async uri => {
    try {
      const resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 200 } }],
        {
          format: "jpeg",
          compress: 0.5
        }
      );
      if (resizedImage) {
        this.uploadToBucket(resizedImage.uri);
      }
    } catch (error) {
      console.warn("error resizing image", error);
    }
  };

  uploadToBucket = async uri => {
    const formData = new FormData();

    formData.append("image", {
      uri,
      name: "photo.jpg",
      type: "image/jpg",
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data"
      }
    });

    const options = {
      method: "POST",
      body: formData
    };

    try {
      const response = await fetch(
        "https://prezzi-api.herokuapp.com/upload",
        options
      );
      if (response) {
        const texts = await response.json();
        this.setState(
          {
            isCapturing: false,
            capturedImageUri: null
          },
          () => this.handleOcrResponse(texts)
        );
      }
    } catch (error) {
      console.warn("Upload to bucket failed", error);
    }
  };

  handleOcrResponse = texts => {
    if (texts[0]) {
      this.props.navigation.navigate("Captured", { texts });
    }
  };

  onPictureSaved = photo => {
    this.setState({
      capturedImageUri: photo.uri
    });
    this.getResizedImage(photo.uri);
  };

  handleCapturePress = async () => {
    if (this.camera) {
      this.setState({
        isCapturing: true
      });
      try {
        this.camera.takePictureAsync({
          onPictureSaved: this.onPictureSaved
        });
      } catch (error) {
        console.warn("error taking picture", error);
      }
    }
  };

  render() {
    const {
      hasCameraPermission,
      isCapturing,
      capturedImageUri,
      width,
      height
    } = this.state;
    const cameraOpacity = isCapturing ? 0.5 : 1;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={styles.container}>
          <View style={{ ...styles.cameraContainer, opacity: cameraOpacity }}>
            <Camera
              ref={ref => {
                this.camera = ref;
              }}
              style={{ ...styles.camera }}
              type={1}
            />
          </View>
          <View style={styles.imageAndButtonContainer}>
            <View style={styles.imageContainer}>
              {capturedImageUri && (
                <Image
                  source={{ uri: capturedImageUri }}
                  style={{
                    width: width,
                    height: height
                  }}
                />
              )}
              {isCapturing && (
                <View style={styles.activityIndicator}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              )}
            </View>
            <View>
              <TouchableOpacity onPress={() => this.handleCapturePress()}>
                {!isCapturing && (
                  <Icon
                    name="camera-enhance"
                    type="material"
                    size={100}
                    color={"white"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  cameraContainer: {
    height: "100%"
  },
  camera: {
    flex: 1
  },
  imageAndButtonContainer: {
    position: "absolute",
    height: "100%",
    width: "100%"
  },
  imageContainer: {
    position: "relative",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  activityIndicator: {
    position: "absolute"
  }
});
