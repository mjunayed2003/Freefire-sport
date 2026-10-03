import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;

interface HeroBannerProps {
  onPressMatch: () => void;
}

const SLIDES = [
  {
    id: '1',
    title: 'BERMUDA CLASH CHAMPIONSHIP',
    subtitle: 'Daily Solo & Squad High Stakes Battle',
    tag: 'PRIZE POOL ৳ 2,000+',
    map: 'Bermuda',
    image: require('../assets/images/image.png'),
    badge: 'LIVE REGISTRATION',
    badgeColor: Colors.success,
  },
  {
    id: '2',
    title: 'WEEKLY SQUAD BATTLE ROYALE',
    subtitle: 'Clash Squad Master Division Tournament',
    tag: 'FIRST PRIZE ৳ 1,200',
    map: 'Kalahari',
    image: require('../assets/images/image2.png'),
    badge: 'HIGH STAKES',
    badgeColor: Colors.primary,
  },
  {
    id: '3',
    title: 'PURGATORY DUO BLITZ',
    subtitle: 'Team up with your squadmate and conquer',
    tag: 'PER KILL ৳ 15',
    map: 'Purgatory',
    image: require('../assets/images/image3.png'),
    badge: 'FAST & FURIOUS',
    badgeColor: Colors.gold,
  },
  {
    id: '4',
    title: 'NEXTERRA FUTURISTIC COMBAT',
    subtitle: 'Anti-gravity combat with top-tier players',
    tag: 'TOTAL SLOTS 48',
    map: 'NexTerra',
    image: require('../assets/images/image4.png'),
    badge: 'SPECIAL EVENT',
    badgeColor: Colors.purple,
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ onPressMatch }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / BANNER_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {SLIDES.map((slide) => (
          <TouchableOpacity
            key={slide.id}
            style={styles.bannerCard}
            activeOpacity={0.9}
            onPress={onPressMatch}
          >
            <Image source={slide.image} style={styles.bannerImage} resizeMode="cover" />
            <View style={styles.overlay} />

            {/* Badges on top */}
            <View style={styles.topRow}>
              <View style={[styles.statusBadge, { borderColor: slide.badgeColor }]}>
                <View style={[styles.dot, { backgroundColor: slide.badgeColor }]} />
                <Text style={[styles.statusText, { color: slide.badgeColor }]}>{slide.badge}</Text>
              </View>

              <View style={styles.mapBadge}>
                <Text style={styles.mapText}>🗺️ {slide.map}</Text>
              </View>
            </View>

            {/* Slide Details */}
            <View style={styles.bottomContent}>
              <View style={styles.prizePill}>
                <Text style={styles.prizePillText}>🏆 {slide.tag}</Text>
              </View>

              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>

              <View style={styles.actionRow}>
                <View style={styles.joinBtn}>
                  <Text style={styles.joinBtnText}>JOIN MATCH</Text>
                  <Text style={styles.arrowIcon}>➔</Text>
                </View>
                <Text style={styles.instantText}>⚡ Room Code via App</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dotIndicator,
              i === activeIndex && styles.activeDotIndicator,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 190,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 90, 0, 0.35)',
    marginRight: 12,
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 13, 17, 0.75)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mapBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapText: {
    color: '#E2E8F0',
    fontSize: 9.5,
    fontWeight: '700',
  },
  bottomContent: {
    marginTop: 'auto',
    padding: 12,
  },
  prizePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  prizePillText: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 10.5,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  instantText: {
    color: Colors.yellow,
    fontSize: 10,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#374151',
  },
  activeDotIndicator: {
    width: 18,
    backgroundColor: Colors.primary,
  },
});
