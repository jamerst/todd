export default class ItemUtils {
  static typeString = (type: number): string => {
    switch (type) {
      case 0: return "Cable"
      case 1: return "Consumables"
      case 2: return "Construction"
      case 3: return "Furnishings"
      case 4: return "Gel"
      case 5: return "Lighting"
      case 6: return "Other"
      case 7: return "Prop"
      case 8: return "Sound"
      case 9: return "Tool"
      default: return "Unknown"
    }
  }
}