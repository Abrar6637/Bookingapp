import { Pressable, Text } from "react-native";

type ButtonProps = {
  title: string; 
  onPress: () => void;    
};

export default function Button({ title, onPress }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "#3b82f6",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 16,
      }}
    >
      <Text style={{ color: "white", fontWeight: "bold", fontSize: 16, textAlign: "center" }}>
        {title}
      </Text>
    </Pressable>
  );
}