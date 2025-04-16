import { StyleSheet, Text, View,Image,FlatList, } from "react-native";
import car from '../assets/images/car.png'
import menuOptions from '../assets/menuOptions';
import MenuOption from "../components/MenuOption";

import {
  FontAwesome,
  Entypo,
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
  Ionicons,
} from '@expo/vector-icons';


export default function Page() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Model S</Text>
          <Text style={styles.subtitle}>Parked</Text>
        </View>
        <FontAwesome name="user-circle-o" size={30} color="grey" />
      </View>

      <Image   source={car} style={styles.image} resizeMode="contain"/>

      <View style={styles.controls}>
       <Entypo name="lock" size={26} color="gray" />
       <MaterialCommunityIcons name="fan" size={26} color="gray" />
       <FontAwesome5 name="bolt" size={26} color="gray" />
        <Ionicons name="car-sport-sharp" size={26} color="gray" />
      </View>

      {/* menu option */}
      <FlatList
       data={menuOptions}
       showsVerticalScrollIndicator={false}
       renderItem={MenuOption}   
     />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor:'#161818'
  },
  header:{
    marginTop:2,
    flexDirection: 'row',
    justifyContent:'space-between',
  },
  title: {
    fontSize: 44,
    color:"white",
    fontWeight: "bold",
    marginBottom:8,
  },
  subtitle: {
    color: "grey",
    fontWeight:"500"
  },
  image:{
    width:'100%',
    height:300,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical:20
  },
});
