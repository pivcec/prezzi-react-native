import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import * as ImageManipulator from "expo-image-manipulator";
import axios from "axios";

export default class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

  getResizedImage = async uri => {
    try {
      const resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 100 } }],
        {
          format: "jpeg",
          compress: 1
        }
      );
      if (resizedImage) {
        this.uploadToOCR(resizedImage.uri);
      }
    } catch (error) {
      console.warn("error resizing image", error);
    }
  };

  uploadToOCR = async uri => {
    const formData = new FormData();

    formData.append("photo", {
      uri,
      name: `photo.jpg`,
      type: `image/jpg`
    });

    const options = {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
        "Ocp-Apim-Subscription-Key": "99e74b5aa966420dae31c7e04f75cea3"
      }
    };

    axios
      .post(
        "https://prezzi.cognitiveservices.azure.com/vision/v1.0/ocr?language=unk&detectOrientation=true",
        formData,
        options
      )
      .then(response => {
        console.warn(response.data);
      })
      .catch(error => {
        console.warn("error uploading to OCR", error);
      });
  };

  onPictureSaved = photo => {
    this.getResizedImage(photo.uri);
  };

  handleCaputurePress = async () => {
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
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera
            ref={ref => {
              this.camera = ref;
            }}
            style={{ flex: 1 }}
            type={1}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "transparent",
                flexDirection: "row"
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: "flex-end",
                  alignItems: "center"
                }}
                onPress={() => {
                  this.handleCaputurePress();
                }}
              >
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: "white" }}
                >
                  {" "}
                  Capture{" "}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}
