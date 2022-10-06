import React from 'react'
import {
    View, Text, TouchableHighlight, SafeAreaView, Touchable,StyleSheet, Alert,ScrollView
} from 'react-native'
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from "react-native-navigation";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { Provider,Portal,Dialog,Paragraph,Button,Card } from 'react-native-paper';

export default class TaskList extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            IP:"",
            dialogTitle: '',
            dialogMessage: '',
            dialog: false,
        };
    }

    componentDidMount= async() => {
        let IP = await AsyncStorage.getItem('@TaiSugar:IP');

        this.setState({IP: IP})
    }

    GoTask = async(Type) =>{
        switch(Type){
            case "Inspection":
                Navigation.push(this.props.componentId,
                {
                    component: {
                        name: 'Inspection',
                        options: {
                            bottomTabs: { visible: false, drawBehind: true, animate: true },
                            topBar: {
                                title: {
                                    text: '巡檢任務'
                                }
                            }
                        }
                    }
                })
                break
            case "Prevent":
                Navigation.push(this.props.componentId,
                {
                    component: {
                        name: 'Prevent',
                        options: {
                            bottomTabs: { visible: false, drawBehind: true, animate: true },
                            topBar: {
                                title: {
                                    text: '保養任務'
                                }
                            }
                        }
                    }
                })
                break
            case "Rectify":
                Navigation.push(this.props.componentId,
                {
                    component: {
                        name: 'Rectify',
                        options: {
                            bottomTabs: { visible: false, drawBehind: true, animate: true },
                            topBar: {
                                title: {
                                    text: '矯正性維修'
                                }
                            }
                        }
                    }
                })
                break
        }
        
    }

    render(){
        const LeftContent = props => <Icon
        name="md-reader"
        color='blue'
        style={styles.icon22}
    >
    </Icon>
        return(
            <Provider>
                <Portal>
                    <Dialog visible={this.state.dialog}>
                        <Dialog.Icon icon="alert" size={64} />
                        <Dialog.Title style={{textAlign: 'center'}}>{this.state.dialogTitle}</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph style={{textAlign:'center'}}>{this.state.dialogMessage}</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => {this.setState({dialog:false})}}>確定</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <TouchableHighlight
                    onPress={()=>this.GoTask('Inspection')}>
                    <Card style={{}}>
                        <Card.Title title="巡檢任務" left={LeftContent} titleStyle={{fontSize:30,textAlign:'center',paddingTop:100,height:200}} />
                    </Card>
                </TouchableHighlight>

                <TouchableHighlight
                    onPress={()=>this.GoTask('Prevent')}>
                    <Card style={{}}>
                        <Card.Title title="保養任務" left={LeftContent} titleStyle={{fontSize:30,textAlign:'center',paddingTop:100,height:200}} />
                    </Card>
                </TouchableHighlight>

                <TouchableHighlight
                    onPress={()=>this.GoTask('Rectify')}>
                    <Card style={{}}>
                        <Card.Title title="矯正性維修" left={LeftContent} titleStyle={{fontSize:30,textAlign:'center',paddingTop:100,height:200}} />
                    </Card>
                </TouchableHighlight>
        
            </Provider>
        )
            
    }
}

const styles = StyleSheet.create({
    icon22: {
        fontSize: 50,
    },
})