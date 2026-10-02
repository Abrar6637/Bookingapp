import { Ionicons } from '@expo/vector-icons'
import { Text, TouchableOpacity, View } from 'react-native'
import { Technician } from '../types/technician'

type Props = {
  technician: Technician
  onPress: () => void
}

export default function TechnicianCard({
  technician,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white rounded-[24px] p-4 mb-4"
      style={{
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      }}
    >
      {/* TOP */}

      <View className="flex-row">

        {/* AVATAR */}

        <View className="w-16 h-16 rounded-full bg-[#FFF3D2] items-center justify-center mr-4">
          <Ionicons
            name="person"
            size={28}
            color="#B77900"
          />
        </View>

        {/* INFO */}

        <View className="flex-1">

          <View className="flex-row items-start justify-between">

            <View className="flex-1 pr-2">
              <Text
                className="text-base font-extrabold text-gray-950"
                numberOfLines={1}
              >
                {technician.name}
              </Text>

              <Text
                className="text-xs text-gray-500 mt-1"
                numberOfLines={1}
              >
                {technician.experience || 'N/A'} experience
              </Text>
            </View>

            {/* AVAILABILITY */}

            <View
              className={`px-2.5 py-1.5 rounded-full ${
                technician.available
                  ? 'bg-green-100'
                  : 'bg-gray-100'
              }`}
            >
              <View className="flex-row items-center">

                <View
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    technician.available
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }`}
                />

                <Text
                  className={`text-[10px] font-bold ${
                    technician.available
                      ? 'text-green-700'
                      : 'text-gray-500'
                  }`}
                >
                  {technician.available
                    ? 'Available'
                    : 'Busy'}
                </Text>

              </View>
            </View>

          </View>

          {/* RATING + DISTANCE */}

          <View className="flex-row items-center mt-3 flex-wrap">

            {/* Rating */}

            <View className="flex-row items-center">

              <View className="w-6 h-6 rounded-full bg-[#FFF3D2] items-center justify-center">
                <Ionicons
                  name="star"
                  size={13}
                  color="#D99A00"
                />
              </View>

              <Text className="text-sm text-gray-800 ml-1.5 font-bold">
                {technician.rating}
              </Text>

              <Text className="text-xs text-gray-400 ml-1">
                ({technician.reviews})
              </Text>

            </View>

            {/* Distance */}

            {technician.distance !== null &&
              technician.distance !== undefined && (
                <>
                  <View className="w-1 h-1 rounded-full bg-gray-300 mx-3" />

                  <View className="flex-row items-center">

                    <Ionicons
                      name="navigate-outline"
                      size={14}
                      color="#B77900"
                    />

                    <Text className="text-xs font-bold text-[#B77900] ml-1">
                      {technician.distance < 1
                        ? `${Math.round(
                            technician.distance * 1000
                          )} m away`
                        : `${technician.distance.toFixed(
                            1
                          )} km away`}
                    </Text>

                  </View>
                </>
              )}

          </View>

        </View>

      </View>

      {/* DIVIDER */}

      <View className="h-[1px] bg-gray-100 my-4" />

      {/* BOTTOM */}

      <View className="flex-row items-center justify-between">

        {/* PRICE */}

        <View>

          <Text className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            Visit Charges
          </Text>

          <View className="flex-row items-end mt-1">

            <Text className="text-lg font-extrabold text-gray-950">
              Rs. {technician.price}
            </Text>

            <Text className="text-xs text-gray-400 mb-0.5 ml-1">
              / visit
            </Text>

          </View>

        </View>

        {/* VIEW PROFILE */}

        <View className="flex-row items-center bg-[#FFC342] rounded-full px-4 py-2.5">

          <Text className="text-xs font-extrabold text-gray-950">
            View Profile
          </Text>

          <Ionicons
            name="arrow-forward"
            size={14}
            color="#111827"
            style={{
              marginLeft: 5,
            }}
          />

        </View>

      </View>

    </TouchableOpacity>
  )
}