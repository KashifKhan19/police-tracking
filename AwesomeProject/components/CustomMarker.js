import React from "react";
import { View, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";

const CustomMarker = ({ coordinate, title, imageUri }) => {
    return (
        <Marker coordinate={coordinate} title={title}>
            <View style={{ alignItems: 'center' }}>
                <Image
                    source={{ uri: imageUri }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                />
            </View>
        </Marker>
    );
}

export default CustomMarker;
