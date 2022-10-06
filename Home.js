import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image,
    ImageBackground,
    TouchableHighlight,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    ScrollView
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import {Card,DataTable, Provider} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default class Home extends React.Component{
    constructor(props) {
        super(props)
        this.state = { 
            IP:"",
            Inspection: [],
            Prevent: [],
            Rectify: [],
            dialog: false,
            show: true,
            page: 0,
            page2: 0,
            page3: 0,
        }
    }

    componentDidMount = async() => {
        let IP = await AsyncStorage.getItem('@TaiSugar:IP');

        let Authority = await AsyncStorage.getItem('@Inspection:Authority')
        this.setState({IP: IP})
        
        this.InspectionList()
        this.PreventList()
        this.RectifyList()
        if(Authority == '關閉'){
            this.setState({show:false})
        }
        // this.StartNFC()
    }

    InspectionList = () =>{
        fetch(this.state.IP + 'TaskList',{
            timeout:1000,
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'Type=Inspection'
        })
        .then(response => response.json())
        .then((response) =>{
            if(response.length > 0){
                this.setState({Inspection: response})
            }
            
        })
        .catch((e)=>{
            console.log(e)
            // this.setState({alertTitle:"警告",alertMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",alert:true})
        })
    }

    PreventList = () =>{
        fetch(this.state.IP + 'TaskList',{
            timeout:1000,
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'Type=Prevent'
        })
        .then(response => response.json())
        .then((response) =>{
            if(response.length > 0){
                this.setState({Prevent: response})
            }
            
        })
        .catch((e)=>{
            console.log(e)
            // this.setState({alertTitle:"警告",alertMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",alert:true})
        })
    }

    RectifyList = () =>{
        fetch(this.state.IP + 'TaskList',{
            timeout:1000,
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'Type=Rectify'
        })
        .then(response => response.json())
        .then((response) =>{
            if(response.length > 0){
                this.setState({Rectify: response})
            }
            
        })
        .catch((e)=>{
            console.log(e)
            // this.setState({alertTitle:"警告",alertMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",alert:true})
        })
    }

    DataShow = (type) =>{
        let lists = []
        let showDatalength = 0
        let InspectionList = this.state.Inspection
        let PreventList = this.state.Prevent
        let RectifyList = this.state.Rectify

        switch(type){
            case "Inspection":
                showDatalength = Math.min((this.state.page + 1 ) * 5,InspectionList.length)
                if(InspectionList.length > 6){
                    for(let i =0; i<showDatalength; i++){
                        let data = InspectionList[i]
                        
                        let code_S = data.code_S
                        let name_S = data.name_S
                        let location = data.location
                        let Status = "未完成"
                        lists.push(
                            <DataTable.Row key={i}>
                                <DataTable.Cell>
                                    <Text>{code_S}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell>
                                    <Text>{name_S}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text>{location}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text>{Status}</Text>
                                </DataTable.Cell>
                            </DataTable.Row>
                        )
                    }
                }
                else{
                    InspectionList.forEach((data,i,array) =>{
                        let code_S = data.code_S
                        let name_S = data.name_S
                        let location = data.location
                        let Status = "未完成"
                  
                        lists.push(
                            <DataTable.Row key={i}>
                                <DataTable.Cell>
                                    <Text>{code_S}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell>
                                    <Text>{name_S}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text>{location}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text>{Status}</Text>
                                </DataTable.Cell>
                            </DataTable.Row>
                        )
            
            
                    })
                }
        
                //最後放入分頁
                lists.push(
                    <DataTable.Pagination
                        page={this.state.page}
                        numberOfPages={Math.ceil(lists.length /5)}
                        onPageChange={(page)=>{this.setState({page:page})}}
                        label={`顯示第 ${this.state.page * 5 + 1} 至 ${Math.min((this.state.page + 1 ) * 5,lists.length)} 項結果，共 ${lists.length} 項`}
                        // numberOfItemsPerPageList={[1,2,3]}
                        numberOfItemsPerPage={1}
                        onItemsPerPageChange={()=>{console.log('123')}}
                    >
                    </DataTable.Pagination>
                )
                break;
            case "Prevent":
                showDatalength = Math.min((this.state.page + 1 ) * 5,PreventList.length)
                if(PreventList.length > 6){
                    for(let i =0; i<showDatalength; i++){
                        let data = PreventList[i]
                        
                        let code_S = data.code_S
                        let location = data.location
                        let Status = "未完成"
                        lists.push(
                            <DataTable.Row key={i}>
                                <DataTable.Cell>
                                    <Text>{code_S}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text>{location}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text>{Status}</Text>
                                </DataTable.Cell>
                            </DataTable.Row>
                        )
                    }
                }
                else{
                    PreventList.forEach((data,i,array) =>{
                        let code_S = data.code_S
                        let location = data.location
                        let Status = "未完成"
                  
                        lists.push(
                            <DataTable.Row key={i}>
                                <DataTable.Cell>
                                    <Text>{code_S}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text>{location}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text>{Status}</Text>
                                </DataTable.Cell>
                            </DataTable.Row>
                        )
            
            
                    })
                }
        
                //最後放入分頁
                lists.push(
                    <DataTable.Pagination
                        page={this.state.page2}
                        numberOfPages={Math.ceil(lists.length /5)}
                        onPageChange={(page)=>{this.setState({page2:page2})}}
                        label={`顯示第 ${this.state.page2 * 5 + 1} 至 ${Math.min((this.state.page2 + 1 ) * 5,lists.length)} 項結果，共 ${lists.length} 項`}
                        // numberOfItemsPerPageList={[1,2,3]}
                        numberOfItemsPerPage={1}
                        onItemsPerPageChange={()=>{console.log('123')}}
                    >
                    </DataTable.Pagination>
                )
                break;
            case "Rectify":
                showDatalength = Math.min((this.state.page + 1 ) * 5,RectifyList.length)
                if(RectifyList.length > 6){
                    for(let i =0; i<showDatalength; i++){
                        let code_S = data.code_S
                        let time = data.time
                        let name = data.name
                        lists.push(
                            <DataTable.Row key={i}>
                                <DataTable.Cell>
                                    <Text>{code_S}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell>
                                    <Text>{name}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text>{time}</Text>
                                </DataTable.Cell>
                            </DataTable.Row>
                        )
                    }
                }
                else{
                    RectifyList.forEach((data,i,array) =>{
                        let code_S = data.code_S
                        let time = data.time
                        let name = data.name
                  
                        lists.push(
                            <DataTable.Row key={i}>
                                <DataTable.Cell>
                                    <Text>{code_S}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell>
                                    <Text>{name}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text>{time}</Text>
                                </DataTable.Cell>
                            </DataTable.Row>
                        )
            
            
                    })
                }
        
                //最後放入分頁
                lists.push(
                    <DataTable.Pagination
                        page={this.state.page3}
                        numberOfPages={Math.ceil(lists.length /5)}
                        onPageChange={(page)=>{this.setState({page3:page3})}}
                        label={`顯示第 ${this.state.page3 * 5 + 1} 至 ${Math.min((this.state.page3 + 1 ) * 5,lists.length)} 項結果，共 ${lists.length} 項`}
                        // numberOfItemsPerPageList={[1,2,3]}
                        numberOfItemsPerPage={1}
                        onItemsPerPageChange={()=>{console.log('123')}}
                    >
                    </DataTable.Pagination>
                )
                break;
        }

        return lists
    }

    render() {
        let lists = this.DataShow('Inspection')
        let lists2 = this.DataShow('Prevent')
        let lists3 = this.DataShow('Rectify')
        
        return (
            <Provider>
                <View style={styles.root}>
                    <Image
                        source={require('./assets/images/logo.png')}
                        style={{width: '100%', height: '20%',alignSelf:'center',resizeMode:'contain'}}>
                    </Image>
                    <Card>
                        <Card.Title title="今日巡檢任務:" titleStyle={{fontSize:18,color:'blue'}}/>
                        <Card.Content>
                            <DataTable>
                                <DataTable.Header>
                                    <DataTable.Title><Text style={{color: 'red',fontSize:20}}>編號</Text></DataTable.Title>
                                    <DataTable.Title><Text style={{color: 'red',fontSize:20}}>名稱</Text></DataTable.Title>
                                    <DataTable.Title numeric><Text style={{color: 'red',fontSize:20}}>地點</Text></DataTable.Title>
                                    <DataTable.Title numeric><Text style={{color: 'red',fontSize:20}}>狀態</Text></DataTable.Title>
                                </DataTable.Header>
                                {lists}
                            </DataTable>
                        </Card.Content>
                    </Card>
                    <Card>
                        <Card.Title title="今日保養任務:" titleStyle={{fontSize:18,color:'blue'}}/>
                        <Card.Content>
                            <DataTable>
                                <DataTable.Header>
                                    <DataTable.Title><Text style={{color: 'red',fontSize:20}}>編號</Text></DataTable.Title>
                                    <DataTable.Title numeric><Text style={{color: 'red',fontSize:20}}>地點</Text></DataTable.Title>
                                    <DataTable.Title numeric><Text style={{color: 'red',fontSize:20}}>狀態</Text></DataTable.Title>
                                </DataTable.Header>
                                {lists2}
                            </DataTable>
                        </Card.Content>
                    </Card>
                    <Card>
                        <Card.Title title="今日矯正性任務:" titleStyle={{fontSize:18,color:'blue'}}/>
                        <Card.Content>
                            <DataTable>
                                <DataTable.Header>
                                    <DataTable.Title><Text style={{color: 'red',fontSize:20}}>編號/敘述</Text></DataTable.Title>
                                    <DataTable.Title><Text style={{color: 'red',fontSize:20}}>派工人</Text></DataTable.Title>
                                    <DataTable.Title numeric><Text style={{color: 'red',fontSize:20}}>發生日期</Text></DataTable.Title>
                                </DataTable.Header>
                                {lists3}
                            </DataTable>
                        </Card.Content>
                    </Card>
                </View>
            </Provider>
        )
    }
}

// <View>
// <Card>
//     <Card.Title title="今日巡檢任務" titleStyle={{fontSize:18}}/>
//     <Card.Content>
        
//     </Card.Content>
// </Card>
// </View>
// <View>

// </View>
const styles = StyleSheet.create({
    root: {
      flex: 1,
    },
})