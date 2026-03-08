import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  FlatList, StyleSheet, Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import LogoMark from '../components/LogoMark';
import SwatchCard from '../components/SwatchCard';
import { PAINTS, RECENT_SCANS, PROJECTS } from '../data/paints';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48 - 10) / 3;

const FILTERS = ['All', 'Sherwin-Williams', 'Behr', 'Favorites', 'Darks', 'Lights', 'Neutrals'];

export default function DashboardScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch]             = useState('');
  const [favs, setFavs]                 = useState(new Set([1, 3, 5, 8]));

  const toggleFav = (id) => {
    setFavs(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const filtered = PAINTS.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false;
    if (activeFilter === 'Sherwin-Williams') return p.brand === 'Sherwin-Williams';
    if (activeFilter === 'Behr') return p.brand === 'Behr';
    if (activeFilter === 'Favorites') return favs.has(p.id);
    if (activeFilter === 'Darks') return p.lrv < 25;
    if (activeFilter === 'Lights') return p.lrv > 65;
    if (activeFilter === 'Neutrals') return p.lrv >= 25 && p.lrv <= 65;
    return true;
  });

  const showFull = !search && activeFilter === 'All';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Sticky header */}
      <View style={styles.header}>
        <View style={styles.ambientGlow} pointerEvents="none" />
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.headerName}>Marcus W.</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={18} color={Colors.subLight} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <View style={styles.avatar}><Text style={styles.avatarText}>MW</Text></View>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={Colors.dim} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search colors, codes, buildings…"
            placeholderTextColor={Colors.dim}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={{ padding: 10 }}>
              <Ionicons name="close-circle" size={16} color={Colors.sub} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingRight: 20 }}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* Stats */}
        {showFull && (
          <View style={styles.statRow}>
            {[
              { val: '47', label: 'Colors', color: Colors.gold },
              { val: '12', label: 'Projects', color: Colors.blue },
              { val: '128', label: 'Scans', color: Colors.green },
            ].map(s => (
              <View key={s.label} style={[styles.statCard, { borderTopColor: s.color + '50' }]}>
                <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent scans */}
        {showFull && (
          <>
            <View style={styles.secHeader}>
              <Text style={styles.secTitle}>Recent Scans</Text>
              <TouchableOpacity><Text style={styles.secAction}>See all →</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentsRow}>
              {RECENT_SCANS.map(scan => {
                const paint = PAINTS.find(p => p.id === scan.paintId);
                if (!paint) return null;
                return (
                  <TouchableOpacity
                    key={scan.id}
                    style={styles.recentCard}
                    onPress={() => navigation.navigate('PaintDetail', { paintId: paint.id })}
                  >
                    <View style={[styles.recentSwatch, { backgroundColor: paint.hex }]}>
                      <View style={styles.recentBrandBadge}>
                        <Text style={styles.recentBrandText}>{paint.brand === 'Sherwin-Williams' ? 'SW' : 'Behr'}</Text>
                      </View>
                      <Text style={styles.recentTime}>{scan.time}</Text>
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentCode}>{paint.code}</Text>
                      <Text style={styles.recentName} numberOfLines={1}>{paint.name}</Text>
                      <Text style={styles.recentLoc} numberOfLines={1}>📍 {scan.zone}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Swatch grid */}
        <View style={styles.secHeader}>
          <Text style={styles.secTitle}>
            {activeFilter === 'All' ? 'Color Library' : activeFilter}
          </Text>
          <Text style={styles.secCount}>{filtered.length} colors</Text>
        </View>

        {filtered.length > 0 ? (
          <View style={styles.swatchGrid}>
            {filtered.map(p => (
              <View key={p.id} style={{ width: CARD_W }}>
                <SwatchCard
                  paint={p}
                  isFav={favs.has(p.id)}
                  onFavToggle={() => toggleFav(p.id)}
                  onPress={() => navigation.navigate('PaintDetail', { paintId: p.id })}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No colors match "{search || activeFilter}"</Text>
          </View>
        )}

        {/* Active projects */}
        {showFull && (
          <>
            <View style={styles.secHeader}>
              <Text style={styles.secTitle}>Active Projects</Text>
              <TouchableOpacity><Text style={styles.secAction}>See all →</Text></TouchableOpacity>
            </View>
            {PROJECTS.map(proj => (
              <View key={proj.id} style={styles.projCard}>
                <View style={styles.projTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.projName}>{proj.name}</Text>
                    <Text style={styles.projMeta}>{proj.zones} zones</Text>
                  </View>
                  <View style={styles.projDue}><Text style={styles.projDueText}>Due {proj.due}</Text></View>
                </View>
                <View style={styles.projColors}>
                  {proj.paintIds.map(pid => {
                    const p = PAINTS.find(x => x.id === pid);
                    return p ? <View key={pid} style={[styles.projColorDot, { backgroundColor: p.hex }]} /> : null;
                  })}
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${proj.progress}%` }]} />
                </View>
                <View style={styles.projProgressRow}>
                  <Text style={styles.projPct}>{proj.progress}% complete</Text>
                  <Text style={styles.projPctRight}>{100 - proj.progress}% remaining</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: { backgroundColor: Colors.bg, paddingTop: 52, overflow: 'hidden' },
  ambientGlow: {
    position: 'absolute', top: -40, left: 0, right: 0, height: 160,
    backgroundColor: 'rgba(232,197,71,0.06)',
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 16,
  },
  greeting: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.sub, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  headerName: { fontFamily: 'BebasNeue_400Regular', fontSize: 28, letterSpacing: 1, color: Colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: Colors.gold, borderWidth: 1.5, borderColor: Colors.bg,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'BebasNeue_400Regular', fontSize: 13, color: '#0A0B0D', letterSpacing: 0.5 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 14,
    backgroundColor: Colors.surface, borderWidth: 1.5,
    borderColor: Colors.border, borderRadius: 12, height: 42,
  },
  searchIcon: { marginLeft: 12, marginRight: 6 },
  searchInput: {
    flex: 1, height: 42, fontFamily: 'DMSans_400Regular',
    fontSize: 13, color: Colors.text,
  },

  filterRow: { paddingLeft: 20, marginBottom: 14 },
  filterChip: {
    paddingVertical: 6, paddingHorizontal: 13, marginRight: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: { backgroundColor: Colors.goldDim, borderColor: 'rgba(232,197,71,0.55)' },
  filterText: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: Colors.sub },
  filterTextActive: { color: Colors.gold },

  body: { flex: 1 },

  statRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 16, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderTopWidth: 2, borderRadius: 14, padding: 14,
  },
  statVal: { fontFamily: 'BebasNeue_400Regular', fontSize: 26, letterSpacing: 1, lineHeight: 28 },
  statLabel: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.sub, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 4 },

  secHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 12,
  },
  secTitle: { fontFamily: 'BebasNeue_400Regular', fontSize: 20, letterSpacing: 1, color: Colors.text },
  secAction: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: Colors.gold },
  secCount: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.sub },

  recentsRow: { paddingLeft: 20, paddingRight: 20, gap: 12, marginBottom: 24 },
  recentCard: {
    width: 160, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 16, overflow: 'hidden',
  },
  recentSwatch: { height: 72, position: 'relative' },
  recentBrandBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(10,11,13,0.65)',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
  },
  recentBrandText: { fontFamily: 'DMSans_600SemiBold', fontSize: 9, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 },
  recentTime: { position: 'absolute', bottom: 8, right: 8, fontFamily: 'DMSans_300Light', fontSize: 9, color: 'rgba(255,255,255,0.5)' },
  recentInfo: { padding: 10 },
  recentCode: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.sub, letterSpacing: 0.7, marginBottom: 2 },
  recentName: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: Colors.text, marginBottom: 4 },
  recentLoc: { fontFamily: 'DMSans_300Light', fontSize: 10, color: Colors.dim },

  swatchGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 20, gap: 10, marginBottom: 24,
  },
  emptyState: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontFamily: 'DMSans_300Light', fontSize: 13, color: Colors.sub },

  projCard: {
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 16, padding: 16,
  },
  projTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  projName: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: Colors.text, marginBottom: 3, lineHeight: 20, maxWidth: 200 },
  projMeta: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.sub },
  projDue: {
    paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20,
    backgroundColor: 'rgba(232,197,71,0.1)', borderWidth: 1, borderColor: 'rgba(232,197,71,0.2)',
  },
  projDueText: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: Colors.gold },
  projColors: { flexDirection: 'row', gap: 5, marginBottom: 12 },
  projColorDot: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)' },
  progressTrack: { height: 4, backgroundColor: Colors.muted, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: Colors.gold, borderRadius: 2 },
  projProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  projPct: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.sub },
  projPctRight: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.dim },
});
