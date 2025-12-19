import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator, ScrollView, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { XIcon, CameraIcon, ChevronDownIcon, CheckIcon, BoxIcon, MapPinIcon } from '@/components/icons/TabBarIcons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { File } from 'expo-file-system';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { UpgradeLimitModal } from '@/components/UpgradeLimitModal';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest, getApiUrl } from '@/lib/query-client';
import { uploadFileToStorage, finalizeUpload } from '@/utils/objectStorageExpo';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Item } from '@shared/schema';
import { CATEGORIES as SCHEMA_CATEGORIES, POWER_SOURCES, ACTIVITIES } from '@shared/schema';

const FREE_ITEM_LIMIT = 5;

export default function AddItemScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();
  const route = useRoute<RouteProp<RootStackParamList, 'EditItem'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();

  const isEditing = route.name === 'EditItem';
  const itemId = isEditing ? route.params?.itemId : undefined;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [powerSource, setPowerSource] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [deposit, setDeposit] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [adType, setAdType] = useState<'renting' | 'looking_for'>('renting');
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSubCategoryPicker, setShowSubCategoryPicker] = useState(false);
  const [showPowerSourcePicker, setShowPowerSourcePicker] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activityTags, setActivityTags] = useState<string[]>([]);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();

  const allCategories = useMemo(() => {
    const cats: { key: string; name: string; subcategories: string[] }[] = [];
    Object.entries(SCHEMA_CATEGORIES.byProject).forEach(([key, c]) => {
      cats.push({ key, name: c.name, subcategories: c.subcategories });
    });
    Object.entries(SCHEMA_CATEGORIES.byToolType).forEach(([key, c]) => {
      cats.push({ key, name: c.name, subcategories: c.subcategories });
    });
    return cats;
  }, []);

  const selectedCategoryData = useMemo(() => {
    return allCategories.find(c => c.name === category);
  }, [allCategories, category]);

  const { data: myItems } = useQuery<Item[]>({
    queryKey: ['/api/my-items'],
    enabled: !isEditing,
  });

  const { data: existingItem } = useQuery<Item>({
    queryKey: ['/api/items', itemId],
    enabled: isEditing && !!itemId,
  });

  const itemCount = myItems?.length || 0;
  const isAtLimit = !isEditing && user?.subscriptionType === 'free' && itemCount >= FREE_ITEM_LIMIT;

  useEffect(() => {
    if (isAtLimit) {
      setShowUpgradeModal(true);
    }
  }, [isAtLimit]);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!isEditing && locationPermission?.granted) {
        setLocationStatus('loading');
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLatitude(location.coords.latitude);
          setLongitude(location.coords.longitude);
          setLocationStatus('success');
        } catch (error) {
          console.error('Error getting location:', error);
          setLocationStatus('error');
        }
      }
    };
    
    fetchLocation();
  }, [isEditing, locationPermission?.granted]);

  useEffect(() => {
    if (existingItem) {
      setTitle(existingItem.title);
      setDescription(existingItem.description);
      setCategory(existingItem.category);
      setSubCategory(existingItem.subCategory || '');
      setPowerSource(existingItem.powerSource || '');
      setPricePerDay(existingItem.pricePerDay.toString());
      setDeposit(existingItem.deposit.toString());
      setCity(existingItem.city);
      setDistrict(existingItem.district || '');
      setImages(existingItem.images || []);
      setAdType((existingItem as any).adType || 'renting');
      setActivityTags((existingItem as any).activityTags || []);
      if (existingItem.latitude) setLatitude(parseFloat(existingItem.latitude));
      if (existingItem.longitude) setLongitude(parseFloat(existingItem.longitude));
      if (existingItem.latitude && existingItem.longitude) setLocationStatus('success');
    }
  }, [existingItem]);

  const pickImage = async () => {
    if (images.length >= 4) {
      Alert.alert('Ograničenje', 'Možete dodati najviše 4 fotografije');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsLoading(true);
      try {
        const file = new File(result.assets[0].uri);
        const uploadURL = await uploadFileToStorage(file);
        const objectPath = await finalizeUpload(uploadURL);
        setImages([...images, objectPath]);
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert('Greška', 'Nije moguće učitati sliku');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !description || !category || !pricePerDay || !deposit || !city) {
      Alert.alert('Greška', 'Popunite sva obavezna polja');
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        title,
        description,
        category,
        subCategory: subCategory || null,
        powerSource: powerSource || null,
        pricePerDay: parseInt(pricePerDay),
        deposit: parseInt(deposit),
        city,
        district: district || null,
        latitude: latitude?.toString() || null,
        longitude: longitude?.toString() || null,
        images,
        adType,
        activityTags: activityTags.length > 0 ? activityTags : null,
        isAvailable: true,
      };

      if (isEditing && itemId) {
        await apiRequest('PUT', `/api/items/${itemId}`, data);
      } else {
        await apiRequest('POST', '/api/items', data);
      }

      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-items'] });
      navigation.goBack();
    } catch (error: any) {
      if (error.code === 'FREE_LIMIT_REACHED') {
        Alert.alert(
          'Limit besplatnih oglasa',
          'Dostigli ste limit od 5 besplatnih oglasa. Da biste objavili više oglasa, potrebna vam je pretplata.',
          [
            { text: 'Otkaži', style: 'cancel' },
            { 
              text: 'Pogledaj pretplate', 
              onPress: () => navigation.navigate('Subscription'),
            },
          ]
        );
      } else {
        Alert.alert('Greška', error.message || 'Došlo je do greške');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${getApiUrl()}${path}`;
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text },
  ];


  const handleUpgradeModalClose = () => {
    setShowUpgradeModal(false);
    if (isAtLimit) {
      navigation.goBack();
    }
  };

  return (
    <>
      <UpgradeLimitModal 
        visible={showUpgradeModal} 
        onClose={handleUpgradeModalClose}
        itemCount={itemCount}
      />
      <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>Tip oglasa</ThemedText>
        <View style={styles.adTypeRow}>
          <Pressable
            style={[styles.adTypeButton, { borderColor: theme.border }, adType === 'renting' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setAdType('renting')}
          >
            <ThemedText style={{ color: adType === 'renting' ? '#000' : theme.text, fontWeight: '600' }}>Izdaje se</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.adTypeButton, { borderColor: theme.border }, adType === 'looking_for' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setAdType('looking_for')}
          >
            <ThemedText style={{ color: adType === 'looking_for' ? '#000' : theme.text, fontWeight: '600' }}>Traži se</ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>Fotografije (max 4)</ThemedText>
        <View style={styles.imagesGrid}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: getImageUrl(image) }} style={styles.imagePreview} contentFit="cover" />
              <Pressable
                style={[styles.removeImageButton, { backgroundColor: theme.error }]}
                onPress={() => removeImage(index)}
              >
                <XIcon size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
          {images.length < 4 && (
            <Pressable
              style={[styles.addImageButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
              onPress={pickImage}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <>
                  <CameraIcon size={24} color={theme.textTertiary} />
                  <ThemedText type="small" style={{ color: theme.textTertiary, marginTop: Spacing.xs }}>
                    Dodaj
                  </ThemedText>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>Naslov *</ThemedText>
        <TextInput
          style={inputStyle}
          placeholder="npr. Bušilica Bosch"
          placeholderTextColor={theme.textTertiary}
          value={title}
          onChangeText={setTitle}
          maxLength={40}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>Opis *</ThemedText>
        <TextInput
          style={[inputStyle, styles.textArea]}
          placeholder="Opis stvari..."
          placeholderTextColor={theme.textTertiary}
          value={description}
          onChangeText={setDescription}
          maxLength={300}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>Kategorija *</ThemedText>
        <Pressable
          style={[inputStyle, styles.picker]}
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
        >
          <ThemedText type="body" style={{ color: category ? theme.text : theme.textTertiary }}>
            {category || 'Izaberi kategoriju'}
          </ThemedText>
          <ChevronDownIcon size={20} color={theme.textTertiary} />
        </Pressable>
        {showCategoryPicker ? (
          <ScrollView style={[styles.categoryList, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, maxHeight: 250 }]}>
            {allCategories.map((cat) => (
              <Pressable
                key={cat.key}
                style={[
                  styles.categoryItem,
                  category === cat.name && { backgroundColor: theme.primaryLight },
                ]}
                onPress={() => {
                  setCategory(cat.name);
                  setSubCategory('');
                  setShowCategoryPicker(false);
                }}
              >
                <ThemedText type="body" style={{ color: category === cat.name ? theme.primary : theme.text }}>
                  {cat.name}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {selectedCategoryData ? (
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>Podkategorija</ThemedText>
          <Pressable
            style={[inputStyle, styles.picker]}
            onPress={() => setShowSubCategoryPicker(!showSubCategoryPicker)}
          >
            <ThemedText type="body" style={{ color: subCategory ? theme.text : theme.textTertiary }}>
              {subCategory || 'Izaberi podkategoriju'}
            </ThemedText>
            <ChevronDownIcon size={20} color={theme.textTertiary} />
          </Pressable>
          {showSubCategoryPicker ? (
            <ScrollView style={[styles.categoryList, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, maxHeight: 200 }]}>
              <Pressable
                style={[styles.categoryItem, !subCategory && { backgroundColor: theme.primaryLight }]}
                onPress={() => {
                  setSubCategory('');
                  setShowSubCategoryPicker(false);
                }}
              >
                <ThemedText type="body" style={{ color: !subCategory ? theme.primary : theme.text }}>
                  Sve
                </ThemedText>
              </Pressable>
              {selectedCategoryData.subcategories.map((sub) => (
                <Pressable
                  key={sub}
                  style={[
                    styles.categoryItem,
                    subCategory === sub && { backgroundColor: theme.primaryLight },
                  ]}
                  onPress={() => {
                    setSubCategory(sub);
                    setShowSubCategoryPicker(false);
                  }}
                >
                  <ThemedText type="body" style={{ color: subCategory === sub ? theme.primary : theme.text }}>
                    {sub}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>
      ) : null}

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>Napajanje</ThemedText>
        <Pressable
          style={[inputStyle, styles.picker]}
          onPress={() => setShowPowerSourcePicker(!showPowerSourcePicker)}
        >
          <ThemedText type="body" style={{ color: powerSource ? theme.text : theme.textTertiary }}>
            {powerSource || 'Izaberi napajanje'}
          </ThemedText>
          <ChevronDownIcon size={20} color={theme.textTertiary} />
        </Pressable>
        {showPowerSourcePicker ? (
          <View style={[styles.categoryList, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Pressable
              style={[styles.categoryItem, !powerSource && { backgroundColor: theme.primaryLight }]}
              onPress={() => {
                setPowerSource('');
                setShowPowerSourcePicker(false);
              }}
            >
              <ThemedText type="body" style={{ color: !powerSource ? theme.primary : theme.text }}>
                Nije navedeno
              </ThemedText>
            </Pressable>
            {POWER_SOURCES.map((ps) => (
              <Pressable
                key={ps}
                style={[
                  styles.categoryItem,
                  powerSource === ps && { backgroundColor: theme.primaryLight },
                ]}
                onPress={() => {
                  setPowerSource(ps);
                  setShowPowerSourcePicker(false);
                }}
              >
                <ThemedText type="body" style={{ color: powerSource === ps ? theme.primary : theme.text }}>
                  {ps}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>Pogodno za delatnosti</ThemedText>
        <Pressable
          style={[inputStyle, styles.picker]}
          onPress={() => setShowActivityPicker(!showActivityPicker)}
        >
          <ThemedText type="body" style={{ color: activityTags.length > 0 ? theme.text : theme.textTertiary, flex: 1 }}>
            {activityTags.length > 0 ? `${activityTags.length} izabrano` : 'Izaberi delatnosti'}
          </ThemedText>
          <ChevronDownIcon size={20} color={theme.textTertiary} />
        </Pressable>
        {activityTags.length > 0 ? (
          <View style={styles.tagsContainer}>
            {activityTags.map((tag) => (
              <Pressable
                key={tag}
                style={[styles.tag, { backgroundColor: theme.primary }]}
                onPress={() => setActivityTags(activityTags.filter(t => t !== tag))}
              >
                <ThemedText type="small" style={{ color: '#000' }}>{tag}</ThemedText>
                <View style={{ marginLeft: 4 }}>
                  <XIcon size={14} color="#000" />
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}
        {showActivityPicker ? (
          <ScrollView style={[styles.categoryList, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, maxHeight: 250 }]}>
            {ACTIVITIES.map((activity) => {
              const isSelected = activityTags.includes(activity);
              return (
                <Pressable
                  key={activity}
                  style={[
                    styles.categoryItem,
                    isSelected && { backgroundColor: theme.primaryLight },
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setActivityTags(activityTags.filter(t => t !== activity));
                    } else {
                      setActivityTags([...activityTags, activity]);
                    }
                  }}
                >
                  <View style={{ marginRight: Spacing.sm }}>
                    {isSelected ? (
                      <CheckIcon size={18} color={theme.primary} />
                    ) : (
                      <BoxIcon size={18} color={theme.textTertiary} />
                    )}
                  </View>
                  <ThemedText type="body" style={{ color: isSelected ? theme.primary : theme.text }}>
                    {activity}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}
      </View>

      <View style={styles.row}>
        <View style={[styles.section, { flex: 1, marginRight: Spacing.md }]}>
          <ThemedText type="h4" style={styles.label}>Cena po danu (RSD) *</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="500"
            placeholderTextColor={theme.textTertiary}
            value={pricePerDay}
            onChangeText={setPricePerDay}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.section, { flex: 1 }]}>
          <ThemedText type="h4" style={styles.label}>Depozit (RSD) *</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="2000"
            placeholderTextColor={theme.textTertiary}
            value={deposit}
            onChangeText={setDeposit}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.section, { flex: 1, marginRight: Spacing.md }]}>
          <ThemedText type="h4" style={styles.label}>Grad *</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="Beograd"
            placeholderTextColor={theme.textTertiary}
            value={city}
            onChangeText={setCity}
          />
        </View>
        <View style={[styles.section, { flex: 1 }]}>
          <ThemedText type="h4" style={styles.label}>Deo grada</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="Vračar"
            placeholderTextColor={theme.textTertiary}
            value={district}
            onChangeText={setDistrict}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.locationRow}>
          <MapPinIcon size={18} color={locationStatus === 'success' ? theme.success : theme.textTertiary} />
          <ThemedText type="body" style={[styles.locationText, { color: locationStatus === 'success' ? theme.success : theme.textTertiary }]}>
            {locationStatus === 'loading' ? 'Preuzimanje lokacije...' : 
             locationStatus === 'success' ? 'GPS lokacija sačuvana' :
             locationStatus === 'error' ? 'Greška pri preuzimanju lokacije' :
             !locationPermission?.granted ? 'Omogućite lokaciju za bolju pretragu' : 'GPS lokacija nije dostupna'}
          </ThemedText>
          {locationStatus === 'loading' ? (
            <ActivityIndicator size="small" color={theme.primary} style={{ marginLeft: Spacing.sm }} />
          ) : null}
        </View>
        {!locationPermission?.granted && locationPermission?.status !== undefined ? (
          <Pressable 
            style={[styles.locationButton, { backgroundColor: theme.primaryLight }]}
            onPress={async () => {
              if (locationPermission?.status === 'denied' && !locationPermission?.canAskAgain) {
                if (Platform.OS !== 'web') {
                  try {
                    await Linking.openSettings();
                  } catch (error) {
                    Alert.alert('Greška', 'Nije moguće otvoriti podešavanja');
                  }
                }
              } else {
                await requestLocationPermission();
              }
            }}
          >
            <ThemedText type="small" style={{ color: theme.primary, fontWeight: '600' }}>
              {locationPermission?.status === 'denied' && !locationPermission?.canAskAgain 
                ? 'Otvori podešavanja' 
                : 'Omogući lokaciju'}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      <Button onPress={handleSubmit} disabled={isLoading} style={styles.submitButton}>
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : (isEditing ? 'Sačuvaj izmene' : 'Dodaj stvar')}
      </Button>
    </KeyboardAwareScrollViewCompat>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: Spacing.md,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryList: {
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  imageContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: Spacing.sm,
  },
  locationButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  adTypeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  adTypeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
});
