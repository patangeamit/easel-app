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
import { ARTWORKS_SEED } from './data/artworksSeed';
import { FALLBACK_IMAGE_URL, loadArtworks } from './lib/artworkData';

const { width, height } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const TAB_ICONS = {
  DailyArt: 'book-outline',
  Discover: 'grid-outline',
  Search: 'search-outline',
  Favourites: 'heart-outline',
  Settings: 'settings-outline',
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
  const theme = isLightTheme ? THEMES.light : THEMES.dark;

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
                  rootNavigation={navigation}
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
          />
        )}
      </Tab.Screen>
      {/* <Tab.Screen name="Discover">
        {() => <PlaceholderScreen title="Discover" theme={theme} />}
      </Tab.Screen> */}
      {/* <Tab.Screen name="Search">
        {() => <PlaceholderScreen title="Search" theme={theme} />}
      </Tab.Screen> */}
      <Tab.Screen name="Favourites">
        {() => <PlaceholderScreen title="Favourites" theme={theme} />}
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

function DailyArtScreen({ theme, resetToLatestSignal, onOpenArtwork }) {
  const [artworks, setArtworks] = useState(() => sortArtworksByDateAsc(ARTWORKS_SEED));
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
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
        const loadedArtworks = await loadArtworks();
        console.log('Loaded artworks:', loadedArtworks);
        if (isMounted && Array.isArray(loadedArtworks) && loadedArtworks.length > 0) {
          setArtworks(sortArtworksByDateAsc(loadedArtworks));
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
            onOpenArtwork={onOpenArtwork}
          />
        )}
      />

      {/* <View style={[styles.pageIndicatorWrap, { bottom: insets.bottom + 88 }]}>
        <Text style={styles.pageIndicatorKicker}>Daily curation</Text>
        <View style={styles.pageIndicatorRow}>
          {artworks.map((artwork, index) => (
            <View
              key={artwork.id}
              style={[styles.pageIndicatorDot, index === activeIndex && styles.pageIndicatorDotActive]}
            />
          ))}
        </View>
      </View> */}
    </View>
  );
}

function DailyArtPage({ item, index, scrollX, topInset, theme, onOpenArtwork }) {
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
            <Text style={[styles.mastheadEyebrow, { color: theme.mastheadEyebrow }]}>Daily art</Text>
            <Text style={[styles.mastheadTitle, { color: theme.title }]}>{item.dateLabel}</Text>
          </View>
          <View style={styles.iconRow}>
            <RoundIcon name="heart-outline" theme={theme} />
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
          {/* <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{item.dateLabel}</Text>
          </View> */}
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

{/* 
          <View style={styles.summaryCard}>
            <Text style={styles.sectionLabel}>Curator note</Text>
            <Text style={styles.previewEssay}>{getEssayPreview(item.essay)}</Text>
          </View> */}

          {/* <View style={styles.metricsRow}>
            <InfoPill label="Artist" value={item.artist} />
            <InfoPill label="Made in" value={item.year} />
          </View> */}

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: theme.sectionLabel }]}>
              Why today's pick matters
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

          {/* <View style={styles.footerCard}>
            <Text style={styles.footerCardTitle}>Swipe for the next day</Text>
            <Text style={styles.footerCardText}>
              Each page keeps its own scroll, so the journey feels calm, tactile, and uninterrupted.
            </Text>
            <View style={styles.footerActionRow}>
              <Pressable style={styles.openEssayButton}>
                <Text style={styles.openEssayLabel}>Saved to today&apos;s collection</Text>
              </Pressable>
              <View style={styles.arrowButton}>
                <Ionicons name="arrow-forward" size={18} color="#111218" />
              </View>
            </View>
          </View> */}
        </Animated.View>
      </ScrollView>
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

function InfoPill({ label, value }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoPillLabel}>{label}</Text>
      <Text style={styles.infoPillValue}>{value}</Text>
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

function getEssayPreview(essay) {
  const firstParagraphs = essay.split('\n\n').slice(0, 2).join('\n\n');
  return `${firstParagraphs.slice(0, 320).trim()}...`;
}

function sortArtworksByDateAsc(items) {
  return [...items].sort((left, right) => parseArtworkDate(left.dateLabel) - parseArtworkDate(right.dateLabel));
}

function parseArtworkDate(dateLabel) {
  const parsed = Date.parse(dateLabel);
  return Number.isNaN(parsed) ? 0 : parsed;
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
  heroBadge: {
    position: 'absolute',
    left: 18,
    bottom: 18,
    backgroundColor: 'rgba(11, 12, 17, 0.72)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(247, 243, 236, 0.12)',
  },
  heroBadgeText: {
    color: '#fff4e8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
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
  previewEssay: {
    color: '#c5c8cf',
    fontSize: 16,
    lineHeight: 29,
  },
  summaryCard: {
    backgroundColor: '#171a21',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  metricsRow: {
    marginTop: 14,
    gap: 10,
  },
  sectionBlock: {
    marginTop: 20,
  },
  openEssayButton: {
    backgroundColor: '#efe3cc',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  openEssayLabel: {
    color: '#15161c',
    fontSize: 15,
    fontWeight: '700',
  },
  arrowButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#c9b18a',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 12,
    textAlign: 'justify'
  },
  essayBodyLast: {
    marginBottom: 0,
  },
  footerCard: {
    marginTop: 10,
    backgroundColor: '#12151d',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 234, 214, 0.05)',
  },
  footerCardTitle: {
    color: '#f3efe7',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  footerCardText: {
    color: '#959aa5',
    fontSize: 15,
    lineHeight: 24,
  },
  footerActionRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pageIndicatorWrap: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 10,
  },
  pageIndicatorKicker: {
    color: '#8f949d',
    fontSize: 12,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  pageIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(8, 9, 13, 0.76)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pageIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(244, 239, 232, 0.25)',
  },
  pageIndicatorDotActive: {
    width: 26,
    backgroundColor: '#e7d2ae',
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
    borderTopLeftRadius:24,
    borderTopRightRadius:24,
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
