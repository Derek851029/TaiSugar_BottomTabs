/**
 * @format
 */

// import {AppRegistry} from 'react-native';
// import App from './App';
// import {name as appName} from './app.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Navigation } from "react-native-navigation";
import App from './App';
import EditRFID from './EditRFID';
import Login from './Login';
import Home from './Home';
import Category from './Category';
import AddRFID from './AddRFID';
import TaskList from './TaskList';
import Inspection from './Inspection';
import InspectionContent from './InspectionContent';
import Prevent from './Prevent';
import PreventContent from './PreventContent';
import Rectify from './Rectify';
import Setting from './Setting';

AsyncStorage.setItem('@TaiSugar:IP','http://192.168.2.101:6002/ServiceAPI/AppService.asmx/')

Navigation.registerComponent('TaiSugar', () => App);

Navigation.registerComponent('Login', () => Login);

Navigation.registerComponent('Home', () => Home);

Navigation.registerComponent('Category', () => Category);

Navigation.registerComponent('AddRFID', () => AddRFID);
Navigation.registerComponent('EditRFID', () => EditRFID);

Navigation.registerComponent('TaskList', () => TaskList);

Navigation.registerComponent('Inspection', () => Inspection);
Navigation.registerComponent('InspectionContent', () => InspectionContent);

Navigation.registerComponent('Prevent', () => Prevent);
Navigation.registerComponent('PreventContent', () => PreventContent);

Navigation.registerComponent('Rectify', () => Rectify);

Navigation.registerComponent('Setting', () => Setting);

Navigation.setDefaultOptions({
    statusBar: {
      backgroundColor: '#4d089a'
    },
    topBar: {
      title: {
        color: 'white'
      },
      backButton: {
        color: 'white'
      },
      background: {
        color: '#4d089a'
      }
    },
    bottomTab: {
      fontSize: 18,
      selectedFontSize: 18
    }
});


Navigation.events().registerAppLaunchedListener(() => {
    
    Navigation.setRoot({
        root: {
            component: {
              name: 'Login'
            }
        }
    });
});

