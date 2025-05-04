import { StyleSheet, Text, View,Image,FlatList,TouchableOpacity } from "react-native";
import car from '../assets/images/car.png'
import menuOptions from '../assets/menuOptions';
import MenuOption from "../components/MenuOption";
import  { useState } from 'react';

import {
  FontAwesome,
  Entypo,
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
  Ionicons,
} from '@expo/vector-icons';


// export default function Page() {
//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.title}>My Model S</Text>
//           <Text style={styles.subtitle}>Parked</Text>
//         </View>
//         <FontAwesome name="user-circle-o" size={30} color="grey" />
//       </View>

//       <Image   source={car} style={styles.image} resizeMode="contain"/>

//       <View style={styles.controls}>
//        <Entypo name="lock" size={26} color="gray" />
//        <MaterialCommunityIcons name="fan" size={26} color="gray" />
//        <FontAwesome5 name="bolt" size={26} color="gray" />
//         <Ionicons name="car-sport-sharp" size={26} color="gray" />
//       </View>

//       {/* menu option */}
//       <FlatList
//        data={menuOptions}
//        showsVerticalScrollIndicator={false}
//        renderItem={MenuOption}   
//      />

//     </View>
//   );
// }

export default function Page() {
  // State to track which icons are active (yellow)
  const [activeIcons, setActiveIcons] = useState({
    lock: false,
    fan: false,
    bolt: false,
    car: false
  });

  // Function to toggle icon color
  const toggleIcon = (iconName) => {
    setActiveIcons(prev => ({
      ...prev,
      [iconName]: !prev[iconName]
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Model S</Text>
          <Text style={styles.subtitle}>Parked</Text>
        </View>
        <FontAwesome name="user-circle-o" size={30} color="grey" />
      </View>

      <Image source={car} style={styles.image} resizeMode="contain"/>

      <View style={styles.controls}>
        <TouchableOpacity onPress={() => toggleIcon('lock')}>
          <Entypo 
            name="lock" 
            size={26} 
            color={activeIcons.lock ? '#f5c542' : 'gray'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => toggleIcon('fan')}>
          <MaterialCommunityIcons 
            name="fan" 
            size={26} 
            color={activeIcons.fan ? '#f5c542' : 'gray'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => toggleIcon('bolt')}>
          <FontAwesome5 
            name="bolt" 
            size={26} 
            color={activeIcons.bolt ? '#f5c542' : 'gray'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => toggleIcon('car')}>
          <Ionicons 
            name="car-sport-sharp" 
            size={26} 
            color={activeIcons.car ? '#f5c542' : 'gray'} 
          />
        </TouchableOpacity>
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
    marginTop: 30,
    flexDirection: 'row',
    justifyContent:'space-between',
  },
  title: {
    fontSize: 44,
    color:"white",
    fontWeight: "bold",
    marginBottom: 5,
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
