import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Animated, Platform, Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { PAINTS } from '../data/paints';

const { width } = Dimensions.get('window');
const TABS = ['Specs', 'Formula', 'Application', 'History'];

function getLightness(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
}

export default function PaintDetailScreen({ route, navigation }) {
  const { paintId = 1 } = route?.params || {};
  const [currentId, setCurrentId] = useState(paintId);
  const [activeTab, setActiveTab] = useState(0);
  const [fav, setFav] = useState(false);
  const scrollRef = useRef(null);

  const paint = PAINTS.find(p => p.id === currentId) || PAINTS[0];
  const isLight = getLightness(paint.hex) > 0.55;
  const heroTextColor = 'rgba(255,255,255,0.9)';

  const switchPaint = (id) => {
    setCurrentId(id);
    setActiveTab(0);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
        <View style={styles.topActions}>
          <TouchableOpacity style={[styles.topBtn, fav && styles.topBtnFav]} onPress={() => setFav(v => !v)}>
            <Ionicons name={fav ? 'star' : 'star-outline'} size={17} color={fav ? Colors.gold : 'rgba(255,255,255,0.7)'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBtn}>
            <Ionicons name="share-outline" size={17} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: paint.hex }]}>
          <View style={styles.heroShimmer} pointerEvents="none" />
          <View style={styles.heroContent}>
            <View style={styles.heroBrandRow}>
              <View style={styles.heroBrandBadge}>
                <Text style={styles.heroBrandText}>{paint.brand}</Text>
              </View>
              <Text style={styles.heroLineBadge}>{paint.line}</Text>
            </View>
            <Text style={styles.heroName}>{paint.name}</Text>
            <View style={styles.heroCodeRow}>
              <View style={styles.heroCodePill}><Text style={styles.heroCodeText}>{paint.code}</Text></View>
              <Text style={styles.heroLrv}>LRV {paint.lrv}</Text>
              <View style={styles.heroSheenPill}><Text style={styles.heroSheenText}>{paint.sheen}</Text></View>
            </View>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>

          {/* Paint switcher */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcherRow}>
            {PAINTS.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.switchDot, { backgroundColor: p.hex }, currentId === p.id && styles.switchDotActive]}
                onPress={() => switchPaint(p.id)}
              />
            ))}
            <View style={styles.switchAdd}>
              <Ionicons name="add" size={16} color={Colors.dim} />
            </View>
          </ScrollView>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {TABS.map((t, i) => (
              <TouchableOpacity key={t} style={[styles.tab, activeTab === i && styles.tabActive]} onPress={() => setActiveTab(i)}>
                <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{t}</Text>
                {activeTab === i && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* ── SPECS ── */}
          {activeTab === 0 && (
            <View style={styles.tabPanel}>
              <View style={styles.specGrid}>
                {[
                  { icon: '🧪', label: 'VOC Content',   val: paint.voc,            accent: true  },
                  { icon: '🎨', label: 'Tint Base',      val: paint.tintBase,       accent: false },
                  { icon: '📐', label: 'Coverage Rate',  val: paint.coverage,       accent: false },
                  { icon: '🖌️', label: 'Coats Required', val: paint.coats + ' coats', accent: false },
                  { icon: '⏱',  label: 'Touch Dry',      val: paint.dryTime,        accent: false },
                  { icon: '⏳', label: 'Recoat Window',  val: paint.recoat,         accent: false },
                ].map(s => (
                  <View key={s.label} style={styles.specCard}>
                    <Text style={styles.specCardIcon}>{s.icon}</Text>
                    <Text style={styles.specLabel}>{s.label}</Text>
                    <Text style={[styles.specVal, s.accent && { color: Colors.gold }]}>{s.val}</Text>
                  </View>
                ))}
              </View>

              {/* LRV bar */}
              <View style={styles.lrvCard}>
                <View style={styles.lrvLabelRow}>
                  <Text style={styles.lrvTitle}>LIGHT REFLECTANCE VALUE</Text>
                  <Text style={styles.lrvNum}>{paint.lrv} / 100</Text>
                </View>
                <View style={styles.lrvTrack}>
                  <View style={[styles.lrvMarker, { left: `${paint.lrv}%` }]} />
                </View>
                <View style={styles.lrvEndRow}>
                  <Text style={styles.lrvEnd}>0 — Black</Text>
                  <Text style={styles.lrvEnd}>100 — White</Text>
                </View>
              </View>

              {/* Hex + compliance */}
              <View style={styles.infoRow}>
                <View style={[styles.colorDot, { backgroundColor: paint.hex }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>COLOR FAMILY</Text>
                  <Text style={styles.infoVal}>{paint.family}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.infoLabel}>HEX</Text>
                  <Text style={[styles.infoVal, { fontFamily: 'DMSans_400Regular', letterSpacing: 0.5 }]}>{paint.hex.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.complianceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>COMPLIANCE</Text>
                  <Text style={styles.infoVal}>Low-VOC formula — LEED eligible</Text>
                </View>
                <View style={styles.compBadge}>
                  <Text style={styles.compBadgeText}>✓ Compliant</Text>
                </View>
              </View>
            </View>
          )}

          {/* ── FORMULA ── */}
          {activeTab === 1 && (
            <View style={styles.tabPanel}>
              <View style={styles.formulaHeaderRow}>
                <Text style={styles.sectionTitle}>Colorant Mix</Text>
                <View style={styles.baseTag}><Text style={styles.baseTagText}>Base: {paint.tintBase}</Text></View>
              </View>

              <View style={styles.formulaCard}>
                {paint.formula.map((f, i) => (
                  <View key={i} style={[styles.formulaRow, i === paint.formula.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={[styles.formulaSwatch, { backgroundColor: f.hex }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formulaName}>{f.colorant}</Text>
                      <View style={styles.formulaBarWrap}>
                        <View style={[styles.formulaBarFill, { width: `${f.bar * 100}%` }]} />
                      </View>
                    </View>
                    <Text style={styles.formulaUnits}>{f.oz}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.formulaNote}>
                <Text style={styles.formulaNoteText}>
                  ⚠ Mix ratios per 48 units. Verify with colorant dispenser before large batches.
                </Text>
              </View>

              {[
                { label: 'Tint Base',    val: paint.tintBase },
                { label: 'Product Code', val: paint.code },
                { label: 'Brand',        val: paint.brand },
                { label: 'Product Line', val: paint.line },
              ].map(r => (
                <View key={r.label} style={styles.infoRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>{r.label}</Text>
                    <Text style={styles.infoVal}>{r.val}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── APPLICATION ── */}
          {activeTab === 2 && (
            <View style={styles.tabPanel}>
              {[
                { header: '🖌  Application Method', items: [
                  { icon: '🎯', bg: Colors.goldDim,   label: 'Method',              val: paint.method },
                  { icon: '🧱', bg: Colors.blueDim,   label: 'Compatible Surfaces', val: paint.surfaces },
                  { icon: '🔧', bg: Colors.purpleDim, label: 'Surface Prep',        val: paint.prep },
                ]},
                { header: '🌡  Environmental Conditions', items: [
                  { icon: '🌡', bg: Colors.greenDim,  label: 'Temperature & Humidity', val: paint.temp },
                  { icon: '⚠️', bg: Colors.redDim,    label: 'Do Not Apply',           val: 'In direct sun, on wet surfaces, or when rain is forecast within 4 hrs' },
                ]},
              ].map(section => (
                <View key={section.header} style={styles.appSection}>
                  <View style={styles.appSectionHeader}>
                    <Text style={styles.appSectionHeaderText}>{section.header}</Text>
                  </View>
                  {section.items.map(a => (
                    <View key={a.label} style={styles.appRow}>
                      <View style={[styles.appIconWrap, { backgroundColor: a.bg }]}>
                        <Text style={styles.appIconText}>{a.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.appLabel}>{a.label}</Text>
                        <Text style={styles.appVal}>{a.val}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}

              {/* Dry schedule */}
              <View style={styles.appSection}>
                <View style={styles.appSectionHeader}>
                  <Text style={styles.appSectionHeaderText}>⏱  Dry & Cure Schedule</Text>
                </View>
                {[
                  { label: 'Touch Dry', val: paint.dryTime, color: Colors.green },
                  { label: 'Recoat',    val: paint.recoat,  color: Colors.gold  },
                  { label: 'Full Cure', val: '30 days',     color: Colors.blue  },
                ].map(d => (
                  <View key={d.label} style={[styles.appRow, { alignItems: 'center' }]}>
                    <View style={[styles.cureIndicator, { backgroundColor: d.color }]} />
                    <Text style={{ fontFamily: 'DMSans_400Regular', flex: 1, fontSize: 13, color: Colors.text }}>{d.label}</Text>
                    <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 13, color: d.color }}>{d.val}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── HISTORY ── */}
          {activeTab === 3 && (
            <View style={styles.tabPanel}>
              <View style={styles.historyHeader}>
                <Text style={styles.sectionTitle}>Location Log</Text>
                <View style={styles.historyCountBadge}>
                  <Text style={styles.historyCountText}>{paint.locations.length} locations</Text>
                </View>
              </View>

              <View style={styles.historyCard}>
                {paint.locations.map((loc, i) => (
                  <View key={i} style={[styles.historyItem, i === paint.locations.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={styles.histItemTop}>
                      <Text style={styles.histBuilding}>{loc.building}</Text>
                      <Text style={styles.histDate}>{loc.date}</Text>
                    </View>
                    <Text style={styles.histZone}>📍 {loc.zone}</Text>
                    <View style={styles.histBottom}>
                      <View style={styles.histBy}>
                        <View style={styles.histAvatar}>
                          <Text style={styles.histAvatarText}>{loc.by.split(' ').map(w => w[0]).join('')}</Text>
                        </View>
                        <Text style={styles.histByName}>{loc.by}</Text>
                      </View>
                      <View style={styles.histScans}>
                        <View style={styles.histScansDot} />
                        <Text style={styles.histScansText}>{loc.scans} scans</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Stats */}
              <View style={styles.histStats}>
                {[
                  { val: paint.locations.reduce((a, l) => a + l.scans, 0), label: 'Total Scans' },
                  { val: paint.locations.length, label: 'Locations' },
                  { val: new Set(paint.locations.map(l => l.building)).size, label: 'Buildings' },
                ].map(s => (
                  <View key={s.label} style={styles.histStatCard}>
                    <Text style={styles.histStatVal}>{s.val}</Text>
                    <Text style={styles.histStatLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity style={styles.ctaSecondary}>
          <Ionicons name="share-outline" size={16} color={Colors.sub} />
          <Text style={styles.ctaSecText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 2 }} activeOpacity={0.85}>
          <LinearGradient colors={['#E8C547', '#D4914A']} style={styles.ctaPrimary}>
            <Text style={styles.ctaPrimaryText}>ORDER THIS PAINT →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 12,
  },
  topBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  topBtnFav: { backgroundColor: 'rgba(232,197,71,0.2)', borderColor: 'rgba(232,197,71,0.35)' },
  topActions: { flexDirection: 'row', gap: 8 },

  hero: { height: 240, justifyContent: 'flex-end', paddingBottom: 20, paddingHorizontal: 20 },
  heroShimmer: {
    position: 'absolute', inset: 0,
    backgroundColor: 'transparent',
  },
  heroContent: {},
  heroBrandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  heroBrandBadge: {
    backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  heroBrandText: { fontFamily: 'DMSans_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.8)', letterSpacing: 1, textTransform: 'uppercase' },
  heroLineBadge: { fontFamily: 'DMSans_300Light', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 },
  heroName: { fontFamily: 'BebasNeue_400Regular', fontSize: 46, letterSpacing: 1, color: 'rgba(255,255,255,0.95)', lineHeight: 48, marginBottom: 8 },
  heroCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroCodePill: {
    backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  heroCodeText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: 'rgba(255,255,255,0.9)', letterSpacing: 0.6 },
  heroLrv: { fontFamily: 'DMSans_300Light', fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  heroSheenPill: {
    marginLeft: 'auto', backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  heroSheenText: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },

  body: { backgroundColor: Colors.bg },

  switcherRow: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  switchDot: { width: 32, height: 32, borderRadius: 10, borderWidth: 2, borderColor: 'transparent' },
  switchDotActive: {
    borderColor: Colors.gold,
    shadowColor: Colors.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 6,
  },
  switchAdd: {
    width: 32, height: 32, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },

  tabRow: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border,
    marginHorizontal: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', position: 'relative' },
  tabActive: {},
  tabText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: Colors.sub, letterSpacing: 0.6, textTransform: 'uppercase' },
  tabTextActive: { color: Colors.gold },
  tabUnderline: {
    position: 'absolute', bottom: -1, left: 0, right: 0, height: 2,
    backgroundColor: Colors.gold, borderRadius: 1,
  },

  tabPanel: { paddingHorizontal: 20, paddingTop: 20 },

  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  specCard: {
    width: (width - 48) / 2, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12,
  },
  specCardIcon: { fontSize: 16, marginBottom: 6 },
  specLabel: { fontFamily: 'DMSans_400Regular', fontSize: 9.5, color: Colors.sub, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  specVal: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.text, lineHeight: 18 },

  lrvCard: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  lrvLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  lrvTitle: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.sub, letterSpacing: 1, textTransform: 'uppercase' },
  lrvNum: { fontFamily: 'BebasNeue_400Regular', fontSize: 16, letterSpacing: 1, color: Colors.text },
  lrvTrack: { height: 8, backgroundColor: Colors.dim, borderRadius: 4, marginBottom: 6, position: 'relative' },
  lrvMarker: {
    position: 'absolute', top: -3, width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.gold, borderWidth: 2, borderColor: Colors.bg,
    shadowColor: Colors.gold, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4,
    transform: [{ translateX: -7 }],
  },
  lrvEndRow: { flexDirection: 'row', justifyContent: 'space-between' },
  lrvEnd: { fontFamily: 'DMSans_300Light', fontSize: 9, color: Colors.sub },

  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, padding: 12, marginBottom: 8,
  },
  colorDot: { width: 42, height: 42, borderRadius: 11, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)' },
  infoLabel: { fontFamily: 'DMSans_400Regular', fontSize: 9.5, color: Colors.sub, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  infoVal: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.text },

  complianceRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, padding: 12, marginBottom: 8,
  },
  compBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    backgroundColor: Colors.greenDim, borderWidth: 1, borderColor: 'rgba(124,184,124,0.3)',
  },
  compBadgeText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: Colors.green },

  formulaHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontFamily: 'BebasNeue_400Regular', fontSize: 20, letterSpacing: 1, color: Colors.text },
  baseTag: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  baseTagText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.sub },
  formulaCard: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, overflow: 'hidden', marginBottom: 12,
  },
  formulaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 13, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  formulaSwatch: { width: 28, height: 28, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  formulaName: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.text },
  formulaBarWrap: { height: 3, backgroundColor: Colors.dim, borderRadius: 2, marginTop: 5, overflow: 'hidden' },
  formulaBarFill: { height: 3, backgroundColor: Colors.gold, borderRadius: 2 },
  formulaUnits: { fontFamily: 'DMSans_700Bold', fontSize: 13, color: Colors.gold, minWidth: 44, textAlign: 'right' },
  formulaNote: {
    backgroundColor: Colors.goldDim, borderWidth: 1, borderColor: 'rgba(232,197,71,0.2)',
    borderRadius: 10, padding: 12, marginBottom: 12,
  },
  formulaNoteText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: 'rgba(232,197,71,0.85)', lineHeight: 18 },

  appSection: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, overflow: 'hidden', marginBottom: 10,
  },
  appSectionHeader: { padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  appSectionHeaderText: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: Colors.sub, letterSpacing: 1.2, textTransform: 'uppercase' },
  appRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  appIconWrap: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  appIconText: { fontSize: 15 },
  appLabel: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.sub, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 3 },
  appVal: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.text, lineHeight: 18 },
  cureIndicator: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },

  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  historyCountBadge: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    backgroundColor: Colors.goldDim, borderWidth: 1, borderColor: 'rgba(232,197,71,0.2)',
  },
  historyCountText: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: Colors.gold },
  historyCard: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, overflow: 'hidden', marginBottom: 14,
  },
  historyItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  histItemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  histBuilding: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.text },
  histDate: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.sub },
  histZone: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.sub, marginBottom: 8 },
  histBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  histBy: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  histAvatar: {
    width: 18, height: 18, borderRadius: 5,
    backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  histAvatarText: { fontFamily: 'BebasNeue_400Regular', fontSize: 8, color: '#0A0B0D' },
  histByName: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.dim },
  histScans: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  histScansDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.gold },
  histScansText: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.sub },
  histStats: { flexDirection: 'row', gap: 8 },
  histStatCard: {
    flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  histStatVal: { fontFamily: 'BebasNeue_400Regular', fontSize: 26, color: Colors.gold, letterSpacing: 1, lineHeight: 28 },
  histStatLabel: { fontFamily: 'DMSans_400Regular', fontSize: 9.5, color: Colors.sub, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 4 },

  bottomCTA: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 20, paddingTop: 12,
    backgroundColor: Colors.bg,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  ctaSecondary: {
    flex: 1, height: 50, borderRadius: 14,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  ctaSecText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: Colors.sub },
  ctaPrimary: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ctaPrimaryText: { fontFamily: 'BebasNeue_400Regular', fontSize: 17, letterSpacing: 1.5, color: '#0A0B0D' },
});
