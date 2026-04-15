import { TextStyle } from 'react-native';

// Font families — install with:
//   npx expo install @expo-google-fonts/nunito @expo-google-fonts/dm-sans expo-font
// Until installed, system fonts are used as fallback.
const nunito = 'Nunito_700Bold';
const nunitoSemiBold = 'Nunito_600SemiBold';
const dmSans = 'DMSans_400Regular';
const dmSansMedium = 'DMSans_500Medium';

export const typography = {
  h1: {
    fontFamily: nunito,
    fontSize: 32,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: nunito,
    fontSize: 24,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: nunitoSemiBold,
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 26,
  },
  h4: {
    fontFamily: nunitoSemiBold,
    fontSize: 17,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 22,
  },
  body: {
    fontFamily: dmSans,
    fontSize: 15,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 22,
  },
  bodyBold: {
    fontFamily: dmSansMedium,
    fontSize: 15,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 22,
  },
  caption: {
    fontFamily: dmSans,
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 18,
  },
  captionBold: {
    fontFamily: dmSans,
    fontSize: 13,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 18,
  },
  small: {
    fontFamily: dmSans,
    fontSize: 11,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 16,
  },
  button: {
    fontFamily: nunitoSemiBold,
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  label: {
    fontFamily: nunitoSemiBold,
    fontSize: 12,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  stat: {
    fontFamily: nunito,
    fontSize: 22,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 28,
  },
} as const;
