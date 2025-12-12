import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useTheme } from '@/hooks/useTheme';
import { apiRequest, getApiUrl } from '@/lib/query-client';
import { uploadFileToStorage, finalizeUpload } from '@/utils/objectStorageExpo';
import { Spacing, BorderRadius, CATEGORIES } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Item } from '@shared/schema';

export default function AddItemScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'EditItem'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();

  const isEditing = route.name === 'EditItem';
  const itemId = isEditing ? route.params?.itemId : undefined;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [deposit, setDeposit] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const { data: existingItem } = useQuery<Item>({
    queryKey: ['/api/items', itemId],
    enabled: isEditing && !!itemId,
  });

  useEffect(() => {
    if (existingItem) {
      setTitle(existingItem.title);
      setDescription(existingItem.description);
      setCategory(existingItem.category);
      setPricePerDay(existingItem.pricePerDay.toString());
      setDeposit(existingItem.deposit.toString());
      setCity(existingItem.city);
      setDistrict(existingItem.district || '');
      setImages(existingItem.images || []);
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
        pricePerDay: parseInt(pricePerDay),
        deposit: parseInt(deposit),
        city,
        district: district || null,
        images,
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
          'Dostigli ste limit od 2 besplatna oglasa. Da biste objavili više oglasa, potrebna vam je pretplata.',
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

  const selectedCategory = CATEGORIES.find(c => c.id === category);

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
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
                <Feather name="x" size={16} color="#FFFFFF" />
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
                  <Feather name="camera" size={24} color={theme.textTertiary} />
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
          <ThemedText type="body" style={{ color: selectedCategory ? theme.text : theme.textTertiary }}>
            {selectedCategory?.label || 'Izaberi kategoriju'}
          </ThemedText>
          <Feather name="chevron-down" size={20} color={theme.textTertiary} />
        </Pressable>
        {showCategoryPicker && (
          <View style={[styles.categoryList, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryItem,
                  category === cat.id && { backgroundColor: theme.primaryLight },
                ]}
                onPress={() => {
                  setCategory(cat.id);
                  setShowCategoryPicker(false);
                }}
              >
                <Feather name={cat.icon as any} size={18} color={category === cat.id ? theme.primary : theme.text} />
                <ThemedText type="body" style={{ marginLeft: Spacing.sm, color: category === cat.id ? theme.primary : theme.text }}>
                  {cat.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        )}
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

      <Button onPress={handleSubmit} disabled={isLoading} style={styles.submitButton}>
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : (isEditing ? 'Sačuvaj izmene' : 'Dodaj stvar')}
      </Button>
    </KeyboardAwareScrollViewCompat>
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
});
