import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FALLBACK_IMAGE_URL, loadArtworkCatalog, loadArtworksForCurrentDay } from './lib/artworkData';
import { getArtworkReactions, setArtworkReaction } from './lib/localDatabase';

const { width, height } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const TAB_ICONS = {
  DailyArt: 'book-outline',
  Discover: 'grid-outline',
  Search: 'search-outline',
  Favourites: 'heart-outline',
  Profile: 'person-outline',
  Settings: 'settings-outline',
};

const PROFILE = {
  name: 'Ava Laurent',
  role: 'Product Designer',
  location: 'Brooklyn, New York',
  bio: 'Designing tactile digital products with a soft spot for editorial layouts, thoughtful motion, and brands that feel human.',
  avatar:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
  stats: [
    { label: 'Projects', value: '48' },
    { label: 'Followers', value: '12.8K' },
    { label: 'Rating', value: '4.9' },
  ],
  skills: ['Brand Systems', 'Mobile UX', 'Creative Direction', 'Prototyping'],
  highlights: [
    {
      title: 'Lead Product Designer',
      subtitle: 'Northstar Studio',
      period: '2023 - Present',
      detail: 'Building premium commerce experiences with a focus on visual clarity and conversion.',
      icon: 'sparkles-outline',
    },
    {
      title: 'Independent Consultant',
      subtitle: 'Selected Clients',
      period: '2020 - 2023',
      detail: 'Shaped launches for wellness, fashion, and creator-led startups across web and mobile.',
      icon: 'color-wand-outline',
    },
  ],
  links: [
    { label: 'Portfolio', icon: 'globe-outline' },
    { label: 'Instagram', icon: 'logo-instagram' },
    { label: 'LinkedIn', icon: 'logo-linkedin' },
  ],
};

const THEMES = {
  dark: {
    isLight: false,
    statusBarStyle: 'light-content',
    screenBackground: '#07080b',
    gradient: ['#20150d', '#0d1018', '#06070b'],
    orbOne: 'rgba(210, 158, 95, 0.12)',
    orbTwo: 'rgba(84, 116, 156, 0.1)',
    bannerBackground: 'rgba(125, 52, 52, 0.94)',
    bannerText: '#fff4e8',
    tabBarBackground: 'rgba(8, 9, 13, 0.96)',
    tabBarActive: '#f3efe7',
    tabBarInactive: '#6f7179',
    stateText: '#f4efe8',
    loadingIndicator: '#f3efe7',
    mastheadEyebrow: '#d1b48c',
    title: '#f7f3ec',
    roundIconBackground: 'rgba(28, 31, 39, 0.88)',
    roundIconForeground: '#f7f3ec',
    heroFrameBackground: '#171920',
    heroFrameBorder: 'rgba(245, 234, 214, 0.08)',
    previewBackground: 'rgba(15, 16, 21, 0.98)',
    previewBorder: 'rgba(245, 234, 214, 0.06)',
    medium: '#959aa5',
    artistChipBackground: '#21242c',
    artistAvatarBackground: '#d8d3c8',
    artistAvatarText: '#1b1d22',
    artistName: '#f7f3ec',
    yearChipBackground: '#171a20',
    yearChipText: '#f7f3ec',
    divider: '#20232b',
    sectionLabel: '#c8b48e',
    essayBody: '#b0b4bd',
    placeholderIcon: '#d4c4ab',
    placeholderTitle: '#f4efe8',
    placeholderText: '#9ea2aa',
    settingsCard: '#151922',
    settingsCardBorder: 'rgba(245, 234, 214, 0.08)',
    settingsLabel: '#f3efe7',
    settingsDescription: '#a2a7b0',
    settingsValue: '#cdb38d',
    switchTrackFalse: '#2c3340',
    switchTrackTrue: '#d8be93',
    switchThumb: '#fffaf2',
  },
  light: {
    isLight: true,
    statusBarStyle: 'dark-content',
    screenBackground: '#f6f0e6',
    gradient: ['#fff8ef', '#f2eadf', '#eae0d4'],
    orbOne: 'rgba(224, 177, 120, 0.22)',
    orbTwo: 'rgba(115, 150, 191, 0.14)',
    bannerBackground: 'rgba(188, 92, 92, 0.92)',
    bannerText: '#fffaf4',
    tabBarBackground: 'rgba(252, 248, 241, 0.96)',
    tabBarActive: '#2f2c26',
    tabBarInactive: '#968c80',
    stateText: '#2f2c26',
    loadingIndicator: '#2f2c26',
    mastheadEyebrow: '#9a6d2e',
    title: '#241f1a',
    roundIconBackground: 'rgba(255, 251, 245, 0.96)',
    roundIconForeground: '#2d2924',
    heroFrameBackground: '#efe6da',
    heroFrameBorder: 'rgba(84, 62, 37, 0.08)',
    previewBackground: 'rgba(255, 252, 247, 0.98)',
    previewBorder: 'rgba(84, 62, 37, 0.08)',
    medium: '#6d655c',
    artistChipBackground: '#efe7db',
    artistAvatarBackground: '#c9bca8',
    artistAvatarText: '#2e261d',
    artistName: '#241f1a',
    yearChipBackground: '#f2e8dc',
    yearChipText: '#241f1a',
    divider: '#e0d6ca',
    sectionLabel: '#8f6733',
    essayBody: '#5f594f',
    placeholderIcon: '#9f7d4a',
    placeholderTitle: '#241f1a',
    placeholderText: '#71695e',
    settingsCard: '#fffaf3',
    settingsCardBorder: 'rgba(84, 62, 37, 0.08)',
    settingsLabel: '#241f1a',
    settingsDescription: '#72695f',
    settingsValue: '#8f6733',
    switchTrackFalse: '#d5cbc0',
    switchTrackTrue: '#d3ab67',
    switchThumb: '#fffdf8',
  },
};

export default function App() {
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [dailyArtResetSignal, setDailyArtResetSignal] = useState(0);
  const [artworkCatalog, setArtworkCatalog] = useState([]);
  const [artworkReactions, setArtworkReactionsState] = useState({});
  const theme = isLightTheme ? THEMES.light : THEMES.dark;

  useEffect(() => {
    let isMounted = true;

    async function fetchArtworkCatalog() {
      try {
        const loadedCatalog = await loadArtworkCatalog();

        if (isMounted && Array.isArray(loadedCatalog)) {
          setArtworkCatalog(loadedCatalog);
        }
      } catch (error) {
        console.warn('Failed to load artwork catalog from the configured data source.', error);
      }
    }

    fetchArtworkCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadReactions() {
      try {
        const storedReactions = await getArtworkReactions();

        if (isMounted) {
          setArtworkReactionsState(storedReactions);
        }
      } catch (error) {
        console.warn('Failed to load local artwork reactions.', error);
      }
    }

    loadReactions();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleReaction = async (artworkId, requestedReaction) => {
    const previousReaction = artworkReactions[artworkId] ?? null;
    const nextReaction = previousReaction === requestedReaction ? null : requestedReaction;

    setArtworkReactionsState((currentReactions) => {
      const updatedReactions = { ...currentReactions };

      if (nextReaction) {
        updatedReactions[artworkId] = nextReaction;
      } else {
        delete updatedReactions[artworkId];
      }

      return updatedReactions;
    });

    try {
      await setArtworkReaction(artworkId, nextReaction);
    } catch (error) {
      console.warn('Failed to save local artwork reaction.', error);
      setArtworkReactionsState((currentReactions) => {
        const rolledBackReactions = { ...currentReactions };

        if (previousReaction) {
          rolledBackReactions[artworkId] = previousReaction;
        } else {
          delete rolledBackReactions[artworkId];
        }

        return rolledBackReactions;
      });
    }
  };

  return (
    <GestureHandlerRootView style={styles.appRoot}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle={theme.statusBarStyle} translucent backgroundColor="transparent" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs">
              {({ navigation }) => (
                <MainTabs
                  theme={theme}
                  dailyArtResetSignal={dailyArtResetSignal}
                  onResetDailyArt={() => setDailyArtResetSignal((currentSignal) => currentSignal + 1)}
                  onToggleTheme={setIsLightTheme}
                  isLightTheme={isLightTheme}
                  artworkCatalog={artworkCatalog}
                  artworkReactions={artworkReactions}
                  onToggleReaction={handleToggleReaction}
                  rootNavigation={navigation}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="ArtworkDetail">
              {({ navigation, route }) => (
                <ArtworkDetailScreen
                  navigation={navigation}
                  route={route}
                  theme={theme}
                  artworkReactions={artworkReactions}
                  onToggleReaction={handleToggleReaction}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="ArtworkViewer">
              {({ navigation, route }) => (
                <ArtworkViewerScreen
                  navigation={navigation}
                  route={route}
                  theme={theme}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="FavouriteDailyArt">
              {({ navigation, route }) => (
                <FavouriteDailyArtScreen
                  navigation={navigation}
                  route={route}
                  theme={theme}
                  artworkReactions={artworkReactions}
                  onToggleReaction={handleToggleReaction}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function MainTabs({
  theme,
  dailyArtResetSignal,
  onResetDailyArt,
  onToggleTheme,
  isLightTheme,
  artworkCatalog,
  artworkReactions,
  onToggleReaction,
  rootNavigation,
}) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: [styles.tabBar, { backgroundColor: theme.tabBarBackground }],
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
      <Tab.Screen
        name="DailyArt"
        listeners={{
          tabPress: () => {
            onResetDailyArt();
          },
        }}
      >
        {() => (
          <DailyArtScreen
            theme={theme}
            resetToLatestSignal={dailyArtResetSignal}
            onOpenArtwork={(artwork) => rootNavigation.navigate('ArtworkViewer', artwork)}
            onOpenArtworkDetail={(artwork) =>
              rootNavigation.navigate('ArtworkDetail', { artwork })
            }
            reactions={artworkReactions}
            onToggleReaction={onToggleReaction}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Favourites">
        {() => (
          <FavouritesScreen
            theme={theme}
            artworks={artworkCatalog}
            reactions={artworkReactions}
            onOpenArtworkDetail={(artwork) =>
              rootNavigation.navigate('FavouriteDailyArt', { artwork })
            }
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {() => <ProfileScreen theme={theme} />}
      </Tab.Screen>
      <Tab.Screen name="Settings">
        {() => (
          <SettingsScreen
            theme={theme}
            isLightTheme={isLightTheme}
            onToggleTheme={onToggleTheme}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function DailyArtScreen({
  theme,
  resetToLatestSignal,
  onOpenArtwork,
  onOpenArtworkDetail,
  reactions,
  onToggleReaction,
}) {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentDay, setCurrentDay] = useState(1);
  const insets = useSafeAreaInsets();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 60 }), []);
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]?.index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  useEffect(() => {
    let isMounted = true;

    async function fetchArtworks() {
      try {
        const { artworks: loadedArtworks, currentDay: resolvedDay } = await loadArtworksForCurrentDay();
        console.log('Loaded artworks:', loadedArtworks);
        if (isMounted && Array.isArray(loadedArtworks) && loadedArtworks.length > 0) {
          setArtworks(sortArtworksByDayAsc(loadedArtworks));
          setCurrentDay(resolvedDay);
          setErrorMessage('');
        } else if (isMounted) {
          setArtworks([]);
          setCurrentDay(resolvedDay);
          setErrorMessage(`No artwork is available yet for day ${resolvedDay}.`);
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

  useEffect(() => {
    if (!flatListRef.current || artworks.length === 0) {
      return;
    }

    const latestIndex = artworks.length - 1;

    flatListRef.current.scrollToIndex({
      index: latestIndex,
      animated: resetToLatestSignal > 0,
    });
    setActiveIndex(latestIndex);
  }, [artworks, resetToLatestSignal]);

  if (loading) {
    return (
      <View style={[styles.screen, styles.centeredState, { backgroundColor: theme.screenBackground }]}>
        <ActivityIndicator size="large" color={theme.loadingIndicator} />
        <Text style={[styles.stateText, { color: theme.stateText }]}>Loading today&apos;s art...</Text>
      </View>
    );
  }

  if (artworks.length === 0) {
    return (
      <View style={[styles.screen, styles.centeredState, { backgroundColor: theme.screenBackground }]}>
        <LinearGradient colors={theme.gradient} locations={[0, 0.42, 1]} style={styles.backgroundGlow} />
        <Text style={[styles.stateText, { color: theme.stateText }]}>
          {errorMessage || `No artwork is available yet for day ${currentDay}.`}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.42, 1]}
        style={styles.backgroundGlow}
      />
      <View style={[styles.backgroundOrbOne, { backgroundColor: theme.orbOne }]} />
      <View style={[styles.backgroundOrbTwo, { backgroundColor: theme.orbTwo }]} />

      {errorMessage ? (
        <View style={[styles.banner, { top: insets.top + 12, backgroundColor: theme.bannerBackground }]}>
          <Text style={[styles.bannerText, { color: theme.bannerText }]}>{errorMessage}</Text>
        </View>
      ) : null}

      <AnimatedFlatList
        ref={flatListRef}
        data={artworks}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        directionalLockEnabled
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={2}
        removeClippedSubviews
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <DailyArtPage
            item={item}
            index={index}
            scrollX={scrollX}
            topInset={insets.top}
            theme={theme}
            currentDay={currentDay}
            onOpenArtwork={onOpenArtwork}
            onOpenArtworkDetail={onOpenArtworkDetail}
            reaction={reactions[item.id] ?? null}
            onToggleReaction={onToggleReaction}
          />
        )}
      />
    </View>
  );
}

function DailyArtPage({
  item,
  index,
  scrollX,
  topInset,
  theme,
  currentDay,
  onOpenArtwork,
  onOpenArtworkDetail,
  reaction,
  onToggleReaction,
  showTitle = true,
}) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  const imageTranslateX = scrollX.interpolate({
    inputRange,
    outputRange: [-28, 0, 28],
    extrapolate: 'clamp',
  });
  const cardTranslateY = scrollX.interpolate({
    inputRange,
    outputRange: [16, 0, 16],
    extrapolate: 'clamp',
  });
  const cardOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.74, 1, 0.74],
    extrapolate: 'clamp',
  });
  const essayParagraphs = item.essay.split('\n\n');

  return (
    <View style={styles.page}>
      <ScrollView
        bounces
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.dailyPageScrollContent, { paddingTop: topInset + 18 }]}
      >
        <View style={styles.dailyPageTopRow}>
            <View>
              <Text style={[styles.mastheadEyebrow, { color: theme.mastheadEyebrow }]}>{showTitle && "Daily art"}</Text>
              <Text style={[styles.mastheadTitle, { color: theme.title }]}>{showTitle && formatArtworkDayLabel(item.day)}</Text>
            </View>
          <View style={styles.iconRow}>
              <ReactionToggle
                value={reaction}
                theme={theme}
                onChange={(nextReaction) => onToggleReaction(item.id, nextReaction)}
              />
            <RoundIcon name="share-social-outline" theme={theme} />
          </View>
        </View>

        <Animated.View
          style={[
            styles.heroFrame,
            {
              transform: [{ translateX: imageTranslateX }],
              backgroundColor: theme.heroFrameBackground,
              borderColor: theme.heroFrameBorder,
            },
          ]}
        >
          <Pressable onPress={() => onOpenArtwork(item)} style={styles.heroTapTarget}>
            <ArtworkHeroImage imageUri={item.image || FALLBACK_IMAGE_URL} />
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(244,228,204,0.08)', 'rgba(11,12,17,0.15)', 'rgba(11,12,17,0.58)']}
              locations={[0, 0.45, 1]}
              style={styles.heroGloss}
            />
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[
            styles.previewPanel,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }],
              backgroundColor: theme.previewBackground,
              borderColor: theme.previewBorder,
            },
          ]}
        >
          <Text style={[styles.previewTitle, { color: theme.title }]}>{item.title}</Text>

          <View style={styles.metadataRow}>
            <View style={[styles.artistChip, { backgroundColor: theme.artistChipBackground }]}>
              <View style={[styles.artistAvatar, { backgroundColor: theme.artistAvatarBackground }]}>
                <Text style={[styles.artistAvatarText, { color: theme.artistAvatarText }]}>
                  {getInitials(item.artist)}
                </Text>
              </View>
              <Text style={[styles.artistName, { color: theme.artistName }]}>{item.artist}</Text>
            </View>
            <View style={[styles.yearChip, { backgroundColor: theme.yearChipBackground }]}>
              <Text style={[styles.yearChipText, { color: theme.yearChipText }]}>{item.year}</Text>
            </View>
          </View>

          <View style={[styles.previewDivider, { backgroundColor: theme.divider }]} />

          <Text style={[styles.previewMeta, { color: theme.medium }]}>{item.medium}</Text>


          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: theme.sectionLabel }]}>
              {Number(item.day) === currentDay ? "Why today's pick matters" : `Why day ${item.day} mattered`}
            </Text>
            {essayParagraphs.map((paragraph, paragraphIndex) => (
              <Text
                key={`${item.id}-${paragraphIndex}`}
                style={[
                  styles.essayBody,
                  { color: theme.essayBody },
                  paragraphIndex === essayParagraphs.length - 1 && styles.essayBodyLast,
                ]}
              >
                {paragraph}
              </Text>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function ReactionToggle({ value, theme, onChange }) {
  return (
    <View style={styles.reactionToggleRow}>
      <Pressable
        onPress={() => onChange('like')}
        style={[
          styles.reactionButton,
          value === 'like' && styles.reactionButtonLiked,
        ]}
      >
        <Ionicons
          name={value === 'like' ? 'heart' : 'heart-outline'}
          size={16}
          color={value === 'like' ? '#fff8ef' : theme.roundIconForeground}
        />
        <Text
          style={[
            styles.reactionButtonText,
            { color: value === 'like' ? '#fff8ef' : theme.roundIconForeground },
          ]}
        >
          Like
        </Text>
      </Pressable>
    </View>
  );
}

function ArtworkHeroImage({ imageUri }) {
  const [aspectRatio, setAspectRatio] = useState(null);

  useEffect(() => {
    let isMounted = true;

    Image.getSize(
      imageUri,
      (imageWidth, imageHeight) => {
        if (isMounted && imageWidth > 0 && imageHeight > 0) {
          setAspectRatio(imageWidth / imageHeight);
        }
      },
      () => {
        if (isMounted) {
          setAspectRatio(null);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [imageUri]);

  return (
    <View style={[styles.heroImageWrap, aspectRatio ? { aspectRatio } : styles.heroImageFallback]}>
      <Image
        source={{ uri: imageUri }}
        resizeMode="contain"
        style={styles.heroImage}
      />
    </View>
  );
}

function ArtworkViewerScreen({ navigation, route, theme }) {
  const insets = useSafeAreaInsets();
  const imageUri = route.params?.image || FALLBACK_IMAGE_URL;
  const title = route.params?.title ?? 'Artwork';
  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const baseScale = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const baseTranslateX = useRef(new Animated.Value(0)).current;
  const baseTranslateY = useRef(new Animated.Value(0)).current;
  const panTranslateX = useRef(new Animated.Value(0)).current;
  const panTranslateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);
  const lastOffset = useRef({ x: 0, y: 0 });
  const scale = Animated.multiply(baseScale, pinchScale);
  const translateX = Animated.add(baseTranslateX, panTranslateX);
  const translateY = Animated.add(baseTranslateY, panTranslateY);
  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true }
  );
  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: panTranslateX, translationY: panTranslateY } }],
    { useNativeDriver: true }
  );

  const onPinchStateChange = (event) => {
    if (event.nativeEvent.oldState !== State.ACTIVE) {
      return;
    }

    const nextScale = Math.min(Math.max(lastScale.current * event.nativeEvent.scale, 1), 4);
    lastScale.current = nextScale;
    baseScale.setValue(nextScale);
    pinchScale.setValue(1);

    if (nextScale === 1) {
      lastOffset.current = { x: 0, y: 0 };
      baseTranslateX.setValue(0);
      baseTranslateY.setValue(0);
      panTranslateX.setValue(0);
      panTranslateY.setValue(0);
    }
  };

  const onPanStateChange = (event) => {
    if (event.nativeEvent.oldState !== State.ACTIVE) {
      return;
    }

    if (lastScale.current <= 1) {
      lastOffset.current = { x: 0, y: 0 };
      baseTranslateX.setValue(0);
      baseTranslateY.setValue(0);
      panTranslateX.setValue(0);
      panTranslateY.setValue(0);
      return;
    }

    const nextX = lastOffset.current.x + event.nativeEvent.translationX;
    const nextY = lastOffset.current.y + event.nativeEvent.translationY;
    lastOffset.current = { x: nextX, y: nextY };
    baseTranslateX.setValue(nextX);
    baseTranslateY.setValue(nextY);
    panTranslateX.setValue(0);
    panTranslateY.setValue(0);
  };

  return (
    <View style={[styles.viewerScreen, { backgroundColor: theme.screenBackground }]}>
      <StatusBar barStyle={theme.statusBarStyle} translucent backgroundColor="transparent" />

      <Pressable
        onPress={() => navigation.goBack()}
        style={[
          styles.viewerBackButton,
          {
            top: insets.top + 14,
            backgroundColor: theme.roundIconBackground,
          },
        ]}
      >
        <Ionicons name="arrow-back" size={20} color={theme.roundIconForeground} />
        <Text style={[styles.viewerBackLabel, { color: theme.roundIconForeground }]}>Back</Text>
      </Pressable>

      <View style={styles.viewerImageStage}>
        <PanGestureHandler
          ref={panRef}
          simultaneousHandlers={pinchRef}
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onPanStateChange}
        >
          <Animated.View style={styles.viewerGestureLayer}>
            <PinchGestureHandler
              ref={pinchRef}
              simultaneousHandlers={panRef}
              onGestureEvent={onPinchGestureEvent}
              onHandlerStateChange={onPinchStateChange}
            >
              <Animated.View
                style={[
                  styles.viewerImageWrap,
                  { transform: [{ translateX }, { translateY }, { scale }] },
                ]}
              >
                <Image source={{ uri: imageUri }} resizeMode="contain" style={styles.viewerImage} />
              </Animated.View>
            </PinchGestureHandler>
          </Animated.View>
        </PanGestureHandler>
      </View>

      <View style={[styles.viewerCaption, { bottom: insets.bottom + 18 }]}>
        <Text style={[styles.viewerCaptionText, { color: theme.medium }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}

function FavouriteDailyArtScreen({
  navigation,
  route,
  theme,
  artworkReactions,
  onToggleReaction,
}) {
  const insets = useSafeAreaInsets();
  const artwork = route.params?.artwork;
  const scrollX = useRef(new Animated.Value(0)).current;

  if (!artwork) {
    return (
      <View style={[styles.screen, styles.centeredState, { backgroundColor: theme.screenBackground }]}>
        <Text style={[styles.stateText, { color: theme.stateText }]}>Artwork details are unavailable.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <LinearGradient colors={theme.gradient} locations={[0, 0.42, 1]} style={styles.backgroundGlow} />
      <View style={[styles.backgroundOrbOne, { backgroundColor: theme.orbOne }]} />
      <View style={[styles.backgroundOrbTwo, { backgroundColor: theme.orbTwo }]} />

      <DailyArtPage
        item={artwork}
        index={0}
        scrollX={scrollX}
        topInset={insets.top}
        theme={theme}
        currentDay={Number(artwork.day ?? 0)}
        onOpenArtwork={(selectedArtwork) => navigation.navigate('ArtworkViewer', selectedArtwork)}
        onOpenArtworkDetail={() => {}}
        reaction={artworkReactions[artwork.id] ?? null}
        onToggleReaction={onToggleReaction}
        showTitle={false}
      />

      <Pressable
        onPress={() => navigation.goBack()}
        style={[
          styles.favouriteDailyArtBackButton,
          {
            top: insets.top + 18,
            backgroundColor: theme.roundIconBackground,
          },
        ]}
      >
        <Ionicons name="arrow-back" size={18} color={theme.roundIconForeground} />
      </Pressable>
    </View>
  );
}

function ArtworkDetailScreen({ navigation, route, theme, artworkReactions, onToggleReaction }) {
  const insets = useSafeAreaInsets();
  const artwork = route.params?.artwork;

  if (!artwork) {
    return (
      <View style={[styles.screen, styles.centeredState, { backgroundColor: theme.screenBackground }]}>
        <Text style={[styles.stateText, { color: theme.stateText }]}>Artwork details are unavailable.</Text>
      </View>
    );
  }

  const essayParagraphs = artwork.essay.split('\n\n');
  const reaction = artworkReactions[artwork.id] ?? null;

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <LinearGradient colors={theme.gradient} locations={[0, 0.42, 1]} style={styles.backgroundGlow} />
      <View style={[styles.backgroundOrbOne, { backgroundColor: theme.orbOne }]} />
      <View style={[styles.backgroundOrbTwo, { backgroundColor: theme.orbTwo }]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.artworkDetailContent, { paddingTop: insets.top + 18 }]}
      >
        <View style={styles.dailyPageTopRow}>
          <View>
            <Text style={[styles.mastheadEyebrow, { color: theme.mastheadEyebrow }]}>Artwork details</Text>
            <Text style={[styles.mastheadTitle, { color: theme.title }]}>{formatArtworkDayLabel(artwork.day)}</Text>
          </View>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.roundIcon, { backgroundColor: theme.roundIconBackground }]}
          >
            <Ionicons name="arrow-back" size={18} color={theme.roundIconForeground} />
          </Pressable>
        </View>

        <View
          style={[
            styles.heroFrame,
            {
              backgroundColor: theme.heroFrameBackground,
              borderColor: theme.heroFrameBorder,
            },
          ]}
        >
          <Pressable onPress={() => navigation.navigate('ArtworkViewer', artwork)} style={styles.heroTapTarget}>
            <ArtworkHeroImage imageUri={artwork.image || FALLBACK_IMAGE_URL} />
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(244,228,204,0.08)', 'rgba(11,12,17,0.15)', 'rgba(11,12,17,0.58)']}
              locations={[0, 0.45, 1]}
              style={styles.heroGloss}
            />
          </Pressable>
        </View>

        <View
          style={[
            styles.previewPanel,
            styles.artworkDetailPanel,
            {
              backgroundColor: theme.previewBackground,
              borderColor: theme.previewBorder,
            },
          ]}
        >
          <Text style={[styles.previewTitle, { color: theme.title }]}>{artwork.title}</Text>

          <View style={styles.metadataRow}>
            <View style={[styles.artistChip, { backgroundColor: theme.artistChipBackground }]}>
              <View style={[styles.artistAvatar, { backgroundColor: theme.artistAvatarBackground }]}>
                <Text style={[styles.artistAvatarText, { color: theme.artistAvatarText }]}>
                  {getInitials(artwork.artist)}
                </Text>
              </View>
              <Text style={[styles.artistName, { color: theme.artistName }]}>{artwork.artist}</Text>
            </View>
            <View style={[styles.yearChip, { backgroundColor: theme.yearChipBackground }]}>
              <Text style={[styles.yearChipText, { color: theme.yearChipText }]}>{artwork.year}</Text>
            </View>
          </View>

          <View style={[styles.previewDivider, { backgroundColor: theme.divider }]} />
          <Text style={[styles.previewMeta, { color: theme.medium }]}>{artwork.medium}</Text>

          <View style={styles.artworkActionRow}>
            <ReactionToggle
              value={reaction}
              theme={theme}
              onChange={(nextReaction) => onToggleReaction(artwork.id, nextReaction)}
            />
            <Pressable
              onPress={() => navigation.navigate('ArtworkViewer', artwork)}
              style={styles.detailButton}
            >
              <Text style={styles.detailButtonText}>Open image</Text>
              <Ionicons name="expand-outline" size={16} color="#15161c" />
            </Pressable>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: theme.sectionLabel }]}>Why this piece matters</Text>
            {essayParagraphs.map((paragraph, paragraphIndex) => (
              <Text
                key={`${artwork.id}-${paragraphIndex}`}
                style={[
                  styles.essayBody,
                  { color: theme.essayBody },
                  paragraphIndex === essayParagraphs.length - 1 && styles.essayBodyLast,
                ]}
              >
                {paragraph}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function RoundIcon({ name, theme }) {
  return (
    <Pressable style={[styles.roundIcon, { backgroundColor: theme.roundIconBackground }]}>
      <Ionicons name={name} size={18} color={theme.roundIconForeground} />
    </Pressable>
  );
}

function PlaceholderScreen({ title, theme }) {
  return (
    <View style={[styles.placeholderScreen, { backgroundColor: theme.screenBackground }]}>
      <Ionicons name={TAB_ICONS[title]} size={32} color={theme.placeholderIcon} />
      <Text style={[styles.placeholderTitle, { color: theme.placeholderTitle }]}>{title}</Text>
      <Text style={[styles.placeholderText, { color: theme.placeholderText }]}>
        Frontend stub for the {title.toLowerCase()} tab.
      </Text>
    </View>
  );
}

function FavouritesScreen({ theme, artworks, reactions, onOpenArtworkDetail }) {
  console.log('Rendering FavouritesScreen with artworks:', artworks);
  console.log('Rendering FavouritesScreen with reactions:', reactions);
  const insets = useSafeAreaInsets();
  const reactedArtworks = useMemo(
    () =>
      [...artworks]
        .filter((artwork) => Boolean(reactions[artwork.id]))
        .sort((left, right) => Number(right.day ?? 0) - Number(left.day ?? 0)),
    [artworks, reactions]
  );
  console.log('Reacted artworks for FavouritesScreen:', reactedArtworks);
  if (reactedArtworks.length === 0) {
    return (
      <View style={[styles.placeholderScreen, { backgroundColor: theme.screenBackground }]}>
        <LinearGradient colors={theme.gradient} locations={[0, 0.42, 1]} style={styles.backgroundGlow} />
        <Ionicons name="heart-dislike-outline" size={32} color={theme.placeholderIcon} />
        <Text style={[styles.placeholderTitle, { color: theme.placeholderTitle }]}>Favourites</Text>
        <Text style={[styles.placeholderText, { color: theme.placeholderText }]}>
          Like or dislike a daily artwork to save it here.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <LinearGradient colors={theme.gradient} locations={[0, 0.42, 1]} style={styles.backgroundGlow} />
      <View style={[styles.backgroundOrbOne, { backgroundColor: theme.orbOne }]} />
      <View style={[styles.backgroundOrbTwo, { backgroundColor: theme.orbTwo }]} />

      <FlatList
        data={reactedArtworks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.favouritesListContent,
          {
            paddingTop: insets.top + 18,
            paddingBottom: insets.bottom + 96,
          },
        ]}
        ListHeaderComponent={(
          <View style={styles.favouritesHeader}>
            <Text style={[styles.settingsEyebrow, { color: theme.sectionLabel }]}>Saved locally</Text>
            <Text style={[styles.settingsTitle, { color: theme.title }]}>Favourites</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
          onPress={() => onOpenArtworkDetail(item)}
          style={[
            styles.favouriteCard,
            {
              backgroundColor: theme.previewBackground,
              borderColor: theme.previewBorder,
            },
          ]}
          >
            <Image source={{ uri: item.image || FALLBACK_IMAGE_URL }} style={styles.favouriteImage} />
            <View style={styles.favouriteCardBody}>
              <View style={styles.favouriteCardTopRow}>
                <Text style={[styles.favouriteDayLabel, { color: theme.sectionLabel }]}>
                  {formatArtworkDayLabel(item.day)}
                </Text>
                <View
                  style={[
                    styles.reactionBadge,
                    reactions[item.id] === 'like' ? styles.reactionBadgeLiked : styles.reactionBadgeDisliked,
                  ]}
                >
                  <Ionicons
                    name={reactions[item.id] === 'like' ? 'heart' : 'thumbs-down'}
                    size={12}
                    color="#fff8ef"
                  />
                  <Text style={styles.reactionBadgeText}>
                    {reactions[item.id] === 'like' ? 'Liked' : 'Disliked'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.favouriteTitle, { color: theme.title }]}>{item.title}</Text>
              <Text style={[styles.favouriteSubtitle, { color: theme.medium }]}>
                {item.artist} · {item.year}
              </Text>
              <Text numberOfLines={2} style={[styles.favouriteEssayPreview, { color: theme.essayBody }]}>
                {item.essay}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

function ProfileScreen({ theme }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.profileScreen, { backgroundColor: theme.screenBackground }]}>
      <LinearGradient colors={theme.gradient} locations={[0, 0.42, 1]} style={styles.backgroundGlow} />
      <View style={[styles.backgroundOrbOne, { backgroundColor: theme.orbOne }]} />
      <View style={[styles.backgroundOrbTwo, { backgroundColor: theme.orbTwo }]} />
      <View style={styles.profileTopGlow} />
      <View style={styles.profileBottomGlow} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.profileContent,
          {
            paddingTop: insets.top + 18,
            paddingBottom: insets.bottom + 96,
          },
        ]}
      >
        <View style={styles.profileHeaderRow}>
          <Text style={[styles.profileEyebrow, { color: theme.sectionLabel }]}>Creative Profile</Text>
          <Pressable style={[styles.profileHeaderButton, { backgroundColor: theme.roundIconBackground }]}>
            <Ionicons name="ellipsis-horizontal" size={18} color={theme.roundIconForeground} />
          </Pressable>
        </View>

        <LinearGradient colors={['#263557', '#1c2743']} style={styles.profileHeroCard}>
          <View style={styles.profileHeroAccent} />

          <View style={styles.profileHeroTopRow}>
            <Image source={{ uri: PROFILE.avatar }} style={styles.profileAvatar} />
            <View style={styles.profileHeroCopy}>
              <Text style={styles.profileName}>{PROFILE.name}</Text>
              <Text style={styles.profileRole}>{PROFILE.role}</Text>
              <View style={styles.profileLocationRow}>
                <Ionicons name="location-outline" size={14} color="#c6d4f7" />
                <Text style={styles.profileLocation}>{PROFILE.location}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.profileBio}>{PROFILE.bio}</Text>

          <View style={styles.profileActionRow}>
            <Pressable style={styles.profilePrimaryButton}>
              <Text style={styles.profilePrimaryButtonText}>Hire Me</Text>
            </Pressable>
            <Pressable style={styles.profileSecondaryButton}>
              <Ionicons name="paper-plane-outline" size={16} color="#f3efe8" />
              <Text style={styles.profileSecondaryButtonText}>Message</Text>
            </Pressable>
          </View>
        </LinearGradient>

        <View style={styles.profileStatsRow}>
          {PROFILE.stats.map((item) => (
            <View key={item.label} style={styles.profileStatCard}>
              <Text style={styles.profileStatValue}>{item.value}</Text>
              <Text style={styles.profileStatLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.profileSectionHeader}>
          <Text style={[styles.profileSectionTitle, { color: theme.title }]}>About</Text>
          <Text style={[styles.profileSectionTag, { color: theme.medium }]}>Curated</Text>
        </View>
        <View style={styles.profileAboutCard}>
          <Text style={styles.profileAboutText}>
            I create interfaces that feel warm, premium, and easy to trust. My process blends sharp
            systems thinking with visual storytelling so products feel both useful and memorable.
          </Text>
          <View style={styles.profileSkillWrap}>
            {PROFILE.skills.map((skill) => (
              <View key={skill} style={styles.profileSkillChip}>
                <Text style={styles.profileSkillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.profileSectionHeader}>
          <Text style={[styles.profileSectionTitle, { color: theme.title }]}>Experience</Text>
          <Text style={[styles.profileSectionTag, { color: theme.medium }]}>Recent</Text>
        </View>
        {PROFILE.highlights.map((item) => (
          <View key={item.title} style={styles.profileTimelineCard}>
            <View style={styles.profileTimelineIcon}>
              <Ionicons name={item.icon} size={18} color="#f6f1e8" />
            </View>
            <View style={styles.profileTimelineBody}>
              <View style={styles.profileTimelineHeader}>
                <Text style={styles.profileTimelineTitle}>{item.title}</Text>
                <Text style={styles.profileTimelinePeriod}>{item.period}</Text>
              </View>
              <Text style={styles.profileTimelineSubtitle}>{item.subtitle}</Text>
              <Text style={styles.profileTimelineDetail}>{item.detail}</Text>
            </View>
          </View>
        ))}

        <View style={styles.profileSectionHeader}>
          <Text style={[styles.profileSectionTitle, { color: theme.title }]}>Connect</Text>
          <Text style={[styles.profileSectionTag, { color: theme.medium }]}>Online</Text>
        </View>
        <View style={styles.profileLinkRow}>
          {PROFILE.links.map((item) => (
            <Pressable key={item.label} style={styles.profileLinkCard}>
              <Ionicons name={item.icon} size={18} color="#eef3ff" />
              <Text style={styles.profileLinkLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function SettingsScreen({ theme, isLightTheme, onToggleTheme }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.settingsScreen, { backgroundColor: theme.screenBackground }]}>
      <LinearGradient colors={theme.gradient} locations={[0, 0.42, 1]} style={styles.backgroundGlow} />
      <View style={[styles.backgroundOrbOne, { backgroundColor: theme.orbOne }]} />
      <View style={[styles.backgroundOrbTwo, { backgroundColor: theme.orbTwo }]} />

      <View style={[styles.settingsContainer, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.settingsEyebrow, { color: theme.sectionLabel }]}>Appearance</Text>
        <Text style={[styles.settingsTitle, { color: theme.title }]}>Settings</Text>

        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: theme.settingsCard,
              borderColor: theme.settingsCardBorder,
            },
          ]}
        >
          <View style={styles.settingsRow}>
            <View style={styles.settingsTextWrap}>
              <Text style={[styles.settingsLabel, { color: theme.settingsLabel }]}>Light theme</Text>
              <Text style={[styles.settingsDescription, { color: theme.settingsDescription }]}>
                Switch the app between the warm dark look and a brighter reading mode.
              </Text>
            </View>
            <Switch
              value={isLightTheme}
              onValueChange={onToggleTheme}
              trackColor={{
                false: theme.switchTrackFalse,
                true: theme.switchTrackTrue,
              }}
              thumbColor={theme.switchThumb}
            />
          </View>

          <View style={[styles.settingsDivider, { backgroundColor: theme.divider }]} />

          <View style={styles.settingsMetaRow}>
            <Text style={[styles.settingsDescription, { color: theme.settingsDescription }]}>Current mode</Text>
            <Text style={[styles.settingsValue, { color: theme.settingsValue }]}>
              {isLightTheme ? 'Light' : 'Dark'}
            </Text>
          </View>
        </View>
      </View>
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

function sortArtworksByDayAsc(items) {
  return [...items].sort((left, right) => {
    const dayDelta = Number(left.day ?? 0) - Number(right.day ?? 0);

    if (dayDelta !== 0) {
      return dayDelta;
    }

    return String(left.id).localeCompare(String(right.id));
  });
}

function formatArtworkDayLabel(day) {
  return `Day ${Number(day ?? 0)}`;
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
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
  backgroundOrbOne: {
    position: 'absolute',
    top: -60,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(210, 158, 95, 0.12)',
  },
  backgroundOrbTwo: {
    position: 'absolute',
    left: -80,
    bottom: height * 0.2,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(84, 116, 156, 0.1)',
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
  dailyPageScrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 92,
  },
  dailyPageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  mastheadEyebrow: {
    color: '#d1b48c',
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: '700',
  },
  mastheadTitle: {
    color: '#f7f3ec',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    maxWidth: width * 0.58,
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
    borderRadius: 36,
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
  heroImageWrap: {
    width: '100%',
  },
  heroTapTarget: {
    width: '100%',
  },
  heroImageFallback: {
    minHeight: height * 0.44,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGloss: {
    ...StyleSheet.absoluteFillObject,
  },
  viewerScreen: {
    flex: 1,
    backgroundColor: '#07080b',
  },
  viewerBackButton: {
    position: 'absolute',
    left: 18,
    zIndex: 5,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewerBackLabel: {
    color: '#f7f3ec',
    fontSize: 15,
    fontWeight: '700',
  },
  viewerImageStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  viewerGestureLayer: {
    width: '100%',
    height: '100%',
  },
  viewerImageWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  viewerCaption: {
    position: 'absolute',
    left: 18,
    right: 18,
    alignItems: 'center',
  },
  viewerCaptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewPanel: {
    marginTop: -28,
    backgroundColor: 'rgba(15, 16, 21, 0.98)',
    borderRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(245, 234, 214, 0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  previewTitle: {
    color: '#f7f3ec',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  previewMeta: {
    marginTop: 14,
    color: '#959aa5',
    fontSize: 15,
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
  sectionBlock: {
    marginTop: 20,
  },
  artworkActionRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  reactionToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  reactionButton: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reactionButtonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  reactionButtonLiked: {
    backgroundColor: '#a44d5f',
    borderColor: '#a44d5f',
  },
  reactionButtonDisliked: {
    backgroundColor: '#46617f',
    borderColor: '#46617f',
  },
  reactionButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailButton: {
    minHeight: 44,
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: '#efe3cc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  detailButtonText: {
    color: '#15161c',
    fontSize: 14,
    fontWeight: '700',
  },
  favouriteDailyArtBackButton: {
    position: 'absolute',
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  artworkDetailContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  artworkDetailPanel: {
    marginTop: 18,
  },
  essayBody: {
    color: '#b0b4bd',
    fontSize: 16,
    lineHeight: 30,
    marginBottom: 12,
    textAlign: 'justify',
  },
  essayBodyLast: {
    marginBottom: 0,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  favouritesHeader: {
    marginBottom: 16,
  },
  favouritesListContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  favouriteCard: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  favouriteImage: {
    width: '100%',
    height: 220,
  },
  favouriteCardBody: {
    padding: 18,
  },
  favouriteCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  favouriteDayLabel: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  reactionBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reactionBadgeLiked: {
    backgroundColor: '#a44d5f',
  },
  reactionBadgeDisliked: {
    backgroundColor: '#46617f',
  },
  reactionBadgeText: {
    color: '#fff8ef',
    fontSize: 12,
    fontWeight: '700',
  },
  favouriteTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  favouriteSubtitle: {
    marginTop: 6,
    fontSize: 14,
  },
  favouriteEssayPreview: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
  },
  profileScreen: {
    flex: 1,
  },
  profileTopGlow: {
    position: 'absolute',
    top: 40,
    right: -16,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(109, 146, 255, 0.15)',
  },
  profileBottomGlow: {
    position: 'absolute',
    left: -40,
    bottom: 150,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 170, 109, 0.12)',
  },
  profileContent: {
    paddingHorizontal: 20,
    gap: 18,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileEyebrow: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  profileHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeroCard: {
    overflow: 'hidden',
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  profileHeroAccent: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  profileHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileAvatar: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  profileHeroCopy: {
    flex: 1,
  },
  profileName: {
    color: '#f8f5ef',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
  },
  profileRole: {
    marginTop: 4,
    color: '#d7def4',
    fontSize: 15,
    fontWeight: '600',
  },
  profileLocationRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileLocation: {
    color: '#c6d4f7',
    fontSize: 13,
  },
  profileBio: {
    marginTop: 18,
    color: '#eef3ff',
    fontSize: 16,
    lineHeight: 25,
  },
  profileActionRow: {
    marginTop: 22,
    flexDirection: 'row',
    gap: 12,
  },
  profilePrimaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6eee2',
  },
  profilePrimaryButtonText: {
    color: '#17213b',
    fontSize: 15,
    fontWeight: '800',
  },
  profileSecondaryButton: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  profileSecondaryButtonText: {
    color: '#f3efe8',
    fontSize: 15,
    fontWeight: '700',
  },
  profileStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  profileStatCard: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  profileStatValue: {
    color: '#fff8ef',
    fontSize: 22,
    fontWeight: '800',
  },
  profileStatLabel: {
    marginTop: 6,
    color: '#9cb1df',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  profileSectionHeader: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileSectionTitle: {
    fontSize: 21,
    fontWeight: '800',
  },
  profileSectionTag: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  profileAboutCard: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: '#f4ede1',
  },
  profileAboutText: {
    color: '#23304d',
    fontSize: 15,
    lineHeight: 24,
  },
  profileSkillWrap: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  profileSkillChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#dde5f8',
  },
  profileSkillText: {
    color: '#23304d',
    fontSize: 13,
    fontWeight: '700',
  },
  profileTimelineCard: {
    flexDirection: 'row',
    gap: 14,
    borderRadius: 26,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  profileTimelineIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  profileTimelineBody: {
    flex: 1,
    gap: 4,
  },
  profileTimelineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  profileTimelineTitle: {
    flex: 1,
    color: '#fbf7f0',
    fontSize: 16,
    fontWeight: '800',
  },
  profileTimelinePeriod: {
    color: '#96a9d6',
    fontSize: 12,
    fontWeight: '700',
  },
  profileTimelineSubtitle: {
    color: '#d3def8',
    fontSize: 13,
    fontWeight: '600',
  },
  profileTimelineDetail: {
    marginTop: 4,
    color: '#b8c6ea',
    fontSize: 14,
    lineHeight: 21,
  },
  profileLinkRow: {
    flexDirection: 'row',
    gap: 12,
  },
  profileLinkCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1a2340',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  profileLinkLabel: {
    color: '#eef3ff',
    fontSize: 13,
    fontWeight: '700',
  },
  settingsScreen: {
    flex: 1,
  },
  settingsContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  settingsEyebrow: {
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 12,
  },
  settingsTitle: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 24,
  },
  settingsCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  settingsTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  settingsLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  settingsDescription: {
    fontSize: 15,
    lineHeight: 23,
  },
  settingsDivider: {
    height: 1,
    marginVertical: 18,
  },
  settingsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingsValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
