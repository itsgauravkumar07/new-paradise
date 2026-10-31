export const HOTEL_FEATURE_GROUPS = [
  {
    title: "Meals",
    features: [
      { value: "breakfastIncluded", label: "Breakfast included" },
      { value: "dinnerIncluded", label: "Dinner included" },
      { value: "allMealsIncluded", label: "All meals included" },
    ],
  },
  {
    title: "Stay essentials",
    features: [
      { value: "freeWifi", label: "Free Wi-Fi" },
      { value: "parking", label: "Parking" },
      { value: "swimmingPool", label: "Swimming pool" },
      { value: "airportTransfer", label: "Airport transfer" },
      { value: "familyRooms", label: "Family rooms" },
      { value: "petFriendly", label: "Pet friendly" },
      { value: "airConditioning", label: "Air conditioning" },
      { value: "roomHeater", label: "Room heater" },
      { value: "spaWellness", label: "Spa & wellness" },
      { value: "flexibleCancellation", label: "Flexible cancellation" },
    ],
  },
] as const;

export type HotelFeature = (typeof HOTEL_FEATURE_GROUPS)[number]["features"][number]["value"];

export const HOTEL_FEATURES: { value: HotelFeature; label: string }[] =
  HOTEL_FEATURE_GROUPS.reduce<{ value: HotelFeature; label: string }[]>((all, group) => {
    all.push(...group.features);
    return all;
  }, []);
