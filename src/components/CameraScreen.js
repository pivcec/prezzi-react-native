import React from "react";
import { StyleSheet, ActivityIndicator, View, Text, Image } from "react-native";
import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import * as ImageManipulator from "expo-image-manipulator";
import { Icon } from "react-native-elements";

export default class CameraScreen extends React.Component {
  state = {
    hasCameraPermission: null,
    capturedImageUri: null
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
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
        const labels = await response.json();
        this.setState(
          {
            capturedImageUri: null
          },
          () => this.props.navigation.navigate("Captured", { labels })
        );
      }
    } catch (error) {
      console.warn("Upload to bucket failed", error);
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
    const { hasCameraPermission, capturedImageUri, labels } = this.state;
    const cameraOpacity = capturedImageUri ? 0.5 : 1;
    /*
    if (labels.length > 0) {
      labels.forEach(label => {
        console.warn("description", label.description);
      });
    }
    */
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
                <>
                  <Image
                    source={{ uri: capturedImageUri }}
                    style={styles.image}
                  />
                  <View style={styles.activityIndicator}>
                    <ActivityIndicator size="large" color="#0000ff" />
                  </View>
                </>
              )}
            </View>
            <View style={styles.button}>
              {!capturedImageUri && (
                <Icon
                  name="camera-enhance"
                  type="material"
                  size={100}
                  color="white"
                  onPress={() => {
                    this.handleCapturePress();
                  }}
                />
              )}
              {capturedImageUri && (
                <Icon
                  name="camera-enhance"
                  type="material"
                  size={100}
                  color="grey"
                />
              )}
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
  image: {
    width: 250,
    height: 250
  },
  activityIndicator: {
    position: "absolute"
  },
  button: {
    backgroundColor: "blue"
  }
});
