import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import CameraScreen from "./CameraScreen";
import Captured from "./Captured";

const RootStack = createStackNavigator({
  Home: {
    screen: CameraScreen
  },
  Captured: {
    screen: Captured
  }
});

const Main = createAppContainer(RootStack);

export default Main;
