import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ARTWORKS_SEED } from './data/artworksSeed';
import { FALLBACK_IMAGE_URL, loadArtworks } from './lib/artworkData';

const { width, height } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const DailyArtStack = createStackNavigator();

const TAB_ICONS = {
  DailyArt: 'book-outline',
  Discover: 'grid-outline',
  Search: 'search-outline',
  Favourites: 'heart-outline',
  Settings: 'settings-outline',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: '#f3efe7',
            tabBarInactiveTintColor: '#6f7179',
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabLabel,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? TAB_ICONS[route.name].replace('-outline', '') : TAB_ICONS[route.name]}
                color={color}
                size={size}
              />
            ),
          })}
        >
          <Tab.Screen name="DailyArt" component={DailyArtStackScreen} />
          <Tab.Screen name="Discover" children={() => <PlaceholderScreen title="Discover" />} />
          <Tab.Screen name="Search" children={() => <PlaceholderScreen title="Search" />} />
          <Tab.Screen name="Favourites" children={() => <PlaceholderScreen title="Favourites" />} />
          <Tab.Screen name="Settings" children={() => <PlaceholderScreen title="Settings" />} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function DailyArtStackScreen() {
  const [artworks, setArtworks] = useState(ARTWORKS_SEED);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchArtworks() {
      try {
        const loadedArtworks = await loadArtworks();

        if (isMounted && Array.isArray(loadedArtworks) && loadedArtworks.length > 0) {
          setArtworks(loadedArtworks);
          setErrorMessage('');
        }
      } catch (fetchError) {
        if (isMounted) {
          setErrorMessage(fetchError.message || 'Unable to load artworks.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchArtworks();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DailyArtStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: styles.stackCard,
      }}
    >
      <DailyArtStack.Screen name="DailyArtPreview">
        {(props) => (
          <DailyArtPreviewScreen
            {...props}
            artworks={artworks}
            loading={loading}
            errorMessage={errorMessage}
          />
        )}
      </DailyArtStack.Screen>
      <DailyArtStack.Screen
        name="DailyArtEssay"
        component={DailyArtEssayScreen}
        options={{
          gestureDirection: 'vertical',
          ...TransitionPresets.ModalSlideFromBottomIOS,
        }}
      />
    </DailyArtStack.Navigator>
  );
}

function DailyArtPreviewScreen({ artworks, loading, errorMessage, navigation }) {
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <ActivityIndicator size="large" color="#f3efe7" />
        <Text style={styles.stateText}>Loading today&apos;s art...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#171009', '#0c0d12', '#07080b']}
        locations={[0, 0.45, 1]}
        style={styles.backgroundGlow}
      />

      {errorMessage ? (
        <View style={[styles.banner, { top: insets.top + 12 }]}>
          <Text style={styles.bannerText}>{errorMessage}</Text>
        </View>
      ) : null}

      <FlatList
        data={artworks}
        horizontal
        pagingEnabled
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={2}
        removeClippedSubviews
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <DailyArtCard
            item={item}
            topInset={insets.top}
            onOpenEssay={() => navigation.navigate('DailyArtEssay', { artwork: item })}
          />
        )}
      />
    </View>
  );
}

function DailyArtCard({ item, topInset, onOpenEssay }) {
  const essayPreview = getEssayPreview(item.essay);

  return (
    <View style={styles.page}>
      <View style={[styles.previewContent, { paddingTop: topInset + 18 }]}>


        <View style={styles.heroFrame}>
          <Image
            source={{ uri: item.image || FALLBACK_IMAGE_URL }}
            resizeMode="cover"
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(255,255,255,0.06)', 'rgba(0,0,0,0.14)']}
            locations={[0, 1]}
            style={styles.heroGloss}
          />
        </View>

        <View style={styles.previewPanel}>
          <View style={styles.previewPanelTop}>
            <View style={styles.previewHeader}>
              <Text style={styles.dateBadge}>{item.dateLabel}</Text>
              <View style={styles.iconRow}>
                <RoundIcon name="heart-outline" />
                <RoundIcon name="share-social-outline" />
              </View>
            </View>
            <Text style={styles.previewTitle}>{item.title}</Text>

            <View style={styles.metadataRow}>
              <View style={styles.artistChip}>
                <View style={styles.artistAvatar}>
                  <Text style={styles.artistAvatarText}>{getInitials(item.artist)}</Text>
                </View>
                <Text style={styles.artistName}>{item.artist}</Text>
              </View>
              <View style={styles.yearChip}>
                <Text style={styles.yearChipText}>{item.year}</Text>
              </View>
            </View>

            <View style={styles.previewDivider} />

            <View style={styles.previewEssayContainer}>
              <Text style={styles.previewEssay}>{essayPreview}</Text>
            </View>
          </View>

          <Pressable style={styles.openEssayButton} onPress={onOpenEssay}>
            <View>
              <Text style={styles.openEssayLabel}>Read short essay</Text>
              {/* <Text style={styles.openEssayHint}>Open the full essay and metadata</Text> */}
            </View>
            <View style={styles.arrowButton}>
              <Ionicons name="arrow-up" size={18} color="#0b0c11" />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function DailyArtEssayScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { artwork: item } = route.params;

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#121319', '#08090d']} style={styles.essayBackground} />

      <View style={[styles.essayHeader, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={22} color="#f6f1e8" />
        </Pressable>
        <Text style={styles.essayHeaderLabel}>Daily Art Essay</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        bounces
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.essayContent}
      >
        <Image
          source={{ uri: item.image || FALLBACK_IMAGE_URL }}
          resizeMode="cover"
          style={styles.essayHero}
        />

        <View style={styles.essayCard}>
          <Text style={styles.essayTitle}>{item.title}</Text>
          <Text style={styles.essaySubtitle}>{item.medium}</Text>

          <View style={styles.essayInfoGrid}>
            <InfoPill label="Artist" value={item.artist} />
            <InfoPill label="Year" value={item.year} />
            <InfoPill label="Edition" value={item.dateLabel} />
          </View>

          <View style={styles.previewDivider} />

          {item.essay.split('\n\n').map((paragraph, index) => (
            <Text key={`${item.id}-${index}`} style={styles.essayBody}>
              {paragraph}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoPill({ label, value }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoPillLabel}>{label}</Text>
      <Text style={styles.infoPillValue}>{value}</Text>
    </View>
  );
}

function RoundIcon({ name }) {
  return (
    <Pressable style={styles.roundIcon}>
      <Ionicons name={name} size={18} color="#f7f3ec" />
    </Pressable>
  );
}

function PlaceholderScreen({ title }) {
  return (
    <View style={styles.placeholderScreen}>
      <Ionicons name={TAB_ICONS[title]} size={32} color="#d4c4ab" />
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderText}>Frontend stub for the {title.toLowerCase()} tab.</Text>
    </View>
  );
}

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getEssayPreview(essay) {
  const firstParagraphs = essay.split('\n\n').slice(0, 2).join('\n\n');
  return `${firstParagraphs.slice(0, 320).trim()}...`;
}

const styles = StyleSheet.create({
  stackCard: {
    backgroundColor: '#07080b',
  },
  screen: {
    flex: 1,
    backgroundColor: '#07080b',
  },
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 14,
    color: '#f4efe8',
    fontSize: 16,
    textAlign: 'center',
  },
  backgroundGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(125, 52, 52, 0.94)',
  },
  bannerText: {
    color: '#fff4e8',
    fontSize: 13,
    textAlign: 'center',
  },
  page: {
    width,
    height,
  },
  previewContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 120,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  dateBadge: {
    color: '#fff4e8',
    backgroundColor: 'rgba(125, 84, 53, 0.96)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roundIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(28, 31, 39, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFrame: {
    width: '100%',
    height: height * 0.42,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: '#171920',
    borderWidth: 1,
    borderColor: 'rgba(245, 234, 214, 0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGloss: {
    ...StyleSheet.absoluteFillObject,
  },
  previewPanel: {
    flex: 1,
    marginTop: -28,
    backgroundColor: 'rgba(15, 16, 21, 0.98)',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(245, 234, 214, 0.06)',
  },
  previewPanelTop: {
    flex: 1,
  },
  previewTitle: {
    color: '#f7f3ec',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  previewMeta: {
    marginTop: 8,
    color: '#a2a6b0',
    fontSize: 16,
    lineHeight: 24,
  },
  metadataRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  artistChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21242c',
    borderRadius: 999,
    paddingRight: 16,
    paddingLeft: 8,
    paddingVertical: 8,
    flexShrink: 1,
  },
  artistAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#d8d3c8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  artistAvatarText: {
    color: '#1b1d22',
    fontSize: 12,
    fontWeight: '800',
  },
  artistName: {
    color: '#f7f3ec',
    fontSize: 16,
    fontWeight: '700',
  },
  yearChip: {
    backgroundColor: '#171a20',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  yearChipText: {
    color: '#f7f3ec',
    fontSize: 15,
    fontWeight: '700',
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#20232b',
    marginTop: 22,
    marginBottom: 18,
  },
  sectionLabel: {
    color: '#c8b48e',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  previewEssay: {
    color: '#b0b4bd',
    fontSize: 16,
    lineHeight: 28,
  },
  previewEssayContainer: {
    flex: 1,
  },
  openEssayButton: {
    marginTop: 22,
    backgroundColor: '#efe3cc',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  openEssayLabel: {
    color: '#15161c',
    fontSize: 17,
    fontWeight: '700',
  },
  openEssayHint: {
    color: '#4b4d56',
    fontSize: 13,
    marginTop: 4,
  },
  arrowButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#c9b18a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  essayBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  essayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(27, 29, 34, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  essayHeaderLabel: {
    color: '#f5efe6',
    fontSize: 15,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 42,
  },
  essayContent: {
    paddingHorizontal: 18,
    paddingBottom: 120,
  },
  essayHero: {
    width: '100%',
    height: height * 0.34,
    borderRadius: 28,
    marginBottom: 18,
    backgroundColor: '#171920',
  },
  essayCard: {
    backgroundColor: '#101116',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 234, 214, 0.06)',
  },
  essayTitle: {
    color: '#f7f3ec',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  essaySubtitle: {
    color: '#a1a6af',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  essayInfoGrid: {
    marginTop: 18,
    gap: 10,
  },
  infoPill: {
    backgroundColor: '#1a1d24',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoPillLabel: {
    color: '#c8b48e',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  infoPillValue: {
    color: '#f7f3ec',
    fontSize: 16,
    fontWeight: '600',
  },
  essayBody: {
    color: '#b0b4bd',
    fontSize: 16,
    lineHeight: 30,
    marginBottom: 18,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 74,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 0,
    borderRadius: 24,
    backgroundColor: 'rgba(8, 9, 13, 0.96)',
    elevation: 0,
  },
  tabLabel: {
    fontSize: 11,
    marginBottom: 2,
    fontWeight: '600',
  },
  placeholderScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07080b',
    paddingHorizontal: 24,
  },
  placeholderTitle: {
    color: '#f4efe8',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
  },
  placeholderText: {
    color: '#9ea2aa',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});
