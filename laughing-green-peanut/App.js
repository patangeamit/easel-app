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
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ARTWORKS_SEED } from './data/artworksSeed';
import { FALLBACK_IMAGE_URL, loadArtworks } from './lib/artworkData';

const { width, height } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

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
          <Tab.Screen name="DailyArt" component={DailyArtScreen} />
          <Tab.Screen name="Discover" children={() => <PlaceholderScreen title="Discover" />} />
          <Tab.Screen name="Search" children={() => <PlaceholderScreen title="Search" />} />
          <Tab.Screen name="Favourites" children={() => <PlaceholderScreen title="Favourites" />} />
          <Tab.Screen name="Settings" children={() => <PlaceholderScreen title="Settings" />} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function DailyArtScreen() {
  const [artworks, setArtworks] = useState(ARTWORKS_SEED);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const insets = useSafeAreaInsets();
  const scrollX = useRef(new Animated.Value(0)).current;
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
        colors={['#20150d', '#0d1018', '#06070b']}
        locations={[0, 0.42, 1]}
        style={styles.backgroundGlow}
      />
      <View style={styles.backgroundOrbOne} />
      <View style={styles.backgroundOrbTwo} />

      {errorMessage ? (
        <View style={[styles.banner, { top: insets.top + 12 }]}>
          <Text style={styles.bannerText}>{errorMessage}</Text>
        </View>
      ) : null}

      <AnimatedFlatList
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

function DailyArtPage({ item, index, scrollX, topInset }) {
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
            <Text style={styles.mastheadEyebrow}>Daily art</Text>
            <Text style={styles.mastheadTitle}>{item.dateLabel}</Text>
          </View>
          <View style={styles.iconRow}>
            <RoundIcon name="heart-outline" />
            <RoundIcon name="share-social-outline" />
          </View>
        </View>

        <Animated.View style={[styles.heroFrame, { transform: [{ translateX: imageTranslateX }] }]}>
          <Image
            source={{ uri: item.image || FALLBACK_IMAGE_URL }}
            resizeMode="cover"
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(244,228,204,0.08)', 'rgba(11,12,17,0.15)', 'rgba(11,12,17,0.58)']}
            locations={[0, 0.45, 1]}
            style={styles.heroGloss}
          />
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
            },
          ]}
        >
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

          <Text style={styles.previewMeta}>{item.medium}</Text>

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
            <Text style={styles.sectionLabel}>Why today&apos;s pick matters</Text>
            {essayParagraphs.map((paragraph, paragraphIndex) => (
              <Text key={`${item.id}-${paragraphIndex}`} style={styles.essayBody}>
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
    paddingBottom: 140,
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
    height: height * 0.44,
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
    marginBottom: 18,
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
