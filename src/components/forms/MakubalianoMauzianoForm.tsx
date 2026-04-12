/**
 * Makubaliano ya Mauziano Form
 * Sale/Lease Agreement Form
 * 
 * Service: Makubaliano ya Mauziano
 * Fee: 3% of transaction value (min 5,000 TZS, max 500,000 TZS)
 */
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Loader2, CheckCircle, ArrowLeft, ArrowRight, Eye, FileCheck, 
  Home, User, Users, FileSignature, Search, Upload, FileText, X,
  MapPin, DollarSign, Calendar, CreditCard, Phone, Mail, Bell, 
  Shield, Info, TrendingUp, AlertCircle, Grid, CheckSquare, Building
} from 'lucide-react';
import { FormProps, labels } from './types';
import { supabase } from '../../lib/supabase';

// Fee constants
const MIN_FEE = 5000;
const MAX_FEE = 500000;
const FEE_PERCENTAGE = 0.03;

// Asset type options
const ASSET_TYPES = [
  { label: 'Nyumba / House', value: 'HOUSE' },
  { label: 'Gari / Vehicle', value: 'VEHICLE' },
  { label: 'Ardhi / Land', value: 'LAND' },
  { label: 'Biashara / Business', value: 'BUSINESS' },
  { label: 'Vifaa / Equipment', value: 'EQUIPMENT' },
  { label: 'Nyingine / Other', value: 'OTHER' },
];

// Currency options
const CURRENCY_OPTIONS = [
  { label: 'TZS - Shilingi ya Tanzania', value: 'TZS' },
  { label: 'USD - Dola ya Marekani', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
];

// Payment terms
const PAYMENT_TERMS = [
  { label: 'Malipo Kamili / Full Payment', value: 'FULL' },
  { label: 'Awamu / Installments', value: 'INSTALLMENTS' },
  { label: 'Kodi ya Mwezi / Monthly Rent', value: 'MONTHLY_RENT' },
  { label: 'Kodi ya Mwaka / Annual Rent', value: 'ANNUAL_RENT' },
];

// Tanzania Regions
const TANZANIA_REGIONS = [
  { label: 'Arusha', value: 'ARUSHA' },
  { label: 'Dar es Salaam', value: 'DAR_ES_SALAAM' },
  { label: 'Dodoma', value: 'DODOMA' },
  { label: 'Geita', value: 'GEITA' },
  { label: 'Iringa', value: 'IRINGA' },
  { label: 'Kagera', value: 'KAGERA' },
  { label: 'Katavi', value: 'KATAVI' },
  { label: 'Kigoma', value: 'KIGOMA' },
  { label: 'Kilimanjaro', value: 'KILIMANJARO' },
  { label: 'Lindi', value: 'LINDI' },
  { label: 'Manyara', value: 'MANYARA' },
  { label: 'Mara', value: 'MARA' },
  { label: 'Mbeya', value: 'MBEYA' },
  { label: 'Morogoro', value: 'MOROGORO' },
  { label: 'Mtwara', value: 'MTWARA' },
  { label: 'Mwanza', value: 'MWANZA' },
  { label: 'Njombe', value: 'NJOMBE' },
  { label: 'Pwani', value: 'PWANI' },
  { label: 'Rukwa', value: 'RUKWA' },
  { label: 'Ruvuma', value: 'RUVUMA' },
  { label: 'Shinyanga', value: 'SHINYANGA' },
  { label: 'Simiyu', value: 'SIMIYU' },
  { label: 'Singida', value: 'SINGIDA' },
  { label: 'Songwe', value: 'SONGWE' },
  { label: 'Tabora', value: 'TABORA' },
  { label: 'Tanga', value: 'TANGA' },
];

// Districts by Region
const DISTRICTS_BY_REGION: Record<string, { label: string; value: string }[]> = {
  ARUSHA: [
    { label: 'Arusha City', value: 'ARUSHA_CITY' },
    { label: 'Arusha Rural', value: 'ARUSHA_RURAL' },
    { label: 'Karatu', value: 'KARATU' },
    { label: 'Longido', value: 'LONGIDO' },
    { label: 'Monduli', value: 'MONDULI' },
    { label: 'Ngorongoro', value: 'NGORONGORO' },
  ],
  DAR_ES_SALAAM: [
    { label: 'Ilala', value: 'ILALA' },
    { label: 'Kinondoni', value: 'KINONDONI' },
    { label: 'Ubungo', value: 'UBUNGO' },
    { label: 'Kigamboni', value: 'KIGAMBONI' },
    { label: 'Temeke', value: 'TEMEKE' },
  ],
  DODOMA: [
    { label: 'Dodoma City', value: 'DODOMA_CITY' },
    { label: 'Bahi', value: 'BAHI' },
    { label: 'Chamwino', value: 'CHAMWINO' },
    { label: 'Chemba', value: 'CHEMBA' },
    { label: 'Kondoa', value: 'KONDOA' },
    { label: 'Kongwa', value: 'KONGWA' },
    { label: 'Mpwapwa', value: 'MPWAPWA' },
  ],
  GEITA: [
    { label: 'Geita Town', value: 'GEITA_TOWN' },
    { label: 'Bukombe', value: 'BUKOMBE' },
    { label: 'Chato', value: 'CHATO' },
    { label: 'Mbogwe', value: 'MBOGWE' },
    { label: 'Nyang\'hwale', value: 'NYANG_HWALE' },
  ],
  IRINGA: [
    { label: 'Iringa City', value: 'IRINGA_CITY' },
    { label: 'Iringa Rural', value: 'IRINGA_RURAL' },
    { label: 'Kilolo', value: 'KILOLO' },
    { label: 'Mafinga', value: 'MAFINGA' },
  ],
  KAGERA: [
    { label: 'Bukoba Urban', value: 'BUKOBA_URBAN' },
    { label: 'Bukoba Rural', value: 'BUKOBA_RURAL' },
    { label: 'Biharamulo', value: 'BIHARAMULO' },
    { label: 'Karagwe', value: 'KARAGWE' },
    { label: 'Kyerwa', value: 'KYERWA' },
    { label: 'Missenyi', value: 'MISSENYI' },
    { label: 'Muleba', value: 'MULEBA' },
    { label: 'Ngara', value: 'NGARA' },
  ],
  KATAVI: [
    { label: 'Mpanda Town', value: 'MPANDA_TOWN' },
    { label: 'Mpanda Rural', value: 'MPANDA_RURAL' },
    { label: 'Mlele', value: 'MLELE' },
    { label: 'Tanganyika', value: 'TANGANYIKA' },
  ],
  KIGOMA: [
    { label: 'Kigoma Urban', value: 'KIGOMA_URBAN' },
    { label: 'Kigoma Rural', value: 'KIGOMA_RURAL' },
    { label: 'Buhigwe', value: 'BUHIGWE' },
    { label: 'Kakonko', value: 'KAKONKO' },
    { label: 'Kasulu Town', value: 'KASULU_TOWN' },
    { label: 'Kasulu Rural', value: 'KASULU_RURAL' },
    { label: 'Kibondo', value: 'KIBONDO' },
    { label: 'Uvinza', value: 'UVINZA' },
  ],
  KILIMANJARO: [
    { label: 'Moshi Urban', value: 'MOSHI_URBAN' },
    { label: 'Moshi Rural', value: 'MOSHI_RURAL' },
    { label: 'Hai', value: 'HAI' },
    { label: 'Mwanga', value: 'MWANGA' },
    { label: 'Rombo', value: 'ROMBO' },
    { label: 'Same', value: 'SAME' },
    { label: 'Siha', value: 'SIHA' },
  ],
  LINDI: [
    { label: 'Lindi Urban', value: 'LINDI_URBAN' },
    { label: 'Lindi Rural', value: 'LINDI_RURAL' },
    { label: 'Kilwa', value: 'KILWA' },
    { label: 'Liwale', value: 'LIWALE' },
    { label: 'Nachingwea', value: 'NACHINGWEA' },
    { label: 'Ruangwa', value: 'RUANGWA' },
  ],
  MANYARA: [
    { label: 'Babati Urban', value: 'BABATI_URBAN' },
    { label: 'Babati Rural', value: 'BABATI_RURAL' },
    { label: 'Hanang', value: 'HANANG' },
    { label: 'Kiteto', value: 'KITETO' },
    { label: 'Mbulu', value: 'MBULU' },
    { label: 'Simanjiro', value: 'SIMANJIRO' },
  ],
  MARA: [
    { label: 'Musoma Urban', value: 'MUSOMA_URBAN' },
    { label: 'Musoma Rural', value: 'MUSOMA_RURAL' },
    { label: 'Bunda', value: 'BUNDA' },
    { label: 'Butiama', value: 'BUTIAMA' },
    { label: 'Rorya', value: 'RORYA' },
    { label: 'Serengeti', value: 'SERENGETI' },
    { label: 'Tarime', value: 'TARIME' },
  ],
  MBEYA: [
    { label: 'Mbeya City', value: 'MBEYA_CITY' },
    { label: 'Mbeya Rural', value: 'MBEYA_RURAL' },
    { label: 'Busokelo', value: 'BUSOKELO' },
    { label: 'Chunya', value: 'CHUNYA' },
    { label: 'Kyela', value: 'KYELA' },
    { label: 'Mbarali', value: 'MBARALI' },
    { label: 'Rungwe', value: 'RUNGWE' },
  ],
  MOROGORO: [
    { label: 'Morogoro Urban', value: 'MOROGORO_URBAN' },
    { label: 'Morogoro Rural', value: 'MOROGORO_RURAL' },
    { label: 'Gairo', value: 'GAIRO' },
    { label: 'Kilosa', value: 'KILOSA' },
    { label: 'Malinyi', value: 'MALINYI' },
    { label: 'Mlimba', value: 'MLIMBA' },
    { label: 'Mvomero', value: 'MVOMERO' },
    { label: 'Ulanga', value: 'ULANGA' },
  ],
  MTWARA: [
    { label: 'Mtwara Urban', value: 'MTWARA_URBAN' },
    { label: 'Mtwara Rural', value: 'MTWARA_RURAL' },
    { label: 'Masasi Town', value: 'MASASI_TOWN' },
    { label: 'Masasi Rural', value: 'MASASI_RURAL' },
    { label: 'Nanyumbu', value: 'NANYUMBU' },
    { label: 'Newala', value: 'NEWALA' },
    { label: 'Tandahimba', value: 'TANDAHIMBA' },
  ],
  MWANZA: [
    { label: 'Mwanza City', value: 'MWANZA_CITY' },
    { label: 'Ilemela', value: 'ILEMELA' },
    { label: 'Kwimba', value: 'KWIMBA' },
    { label: 'Magu', value: 'MAGU' },
    { label: 'Misungwi', value: 'MISUNGWI' },
    { label: 'Nyamagana', value: 'NYAMAGANA' },
    { label: 'Sengerema', value: 'SENGEREMA' },
    { label: 'Ukerewe', value: 'UKEREWE' },
  ],
  NJOMBE: [
    { label: 'Njombe Town', value: 'NJOMBE_TOWN' },
    { label: 'Njombe Rural', value: 'NJOMBE_RURAL' },
    { label: 'Ludewa', value: 'LUDEWA' },
    { label: 'Makambako', value: 'MAKAMBAKO' },
    { label: 'Makete', value: 'MAKETE' },
    { label: 'Wanging\'ombe', value: 'WANGING_OMBE' },
  ],
  PWANI: [
    { label: 'Kibaha Town', value: 'KIBAHA_TOWN' },
    { label: 'Kibaha Rural', value: 'KIBAHA_RURAL' },
    { label: 'Bagamoyo', value: 'BAGAMOYO' },
    { label: 'Chalinze', value: 'CHALINZE' },
    { label: 'Kibiti', value: 'KIBITI' },
    { label: 'Kisarawe', value: 'KISARAWE' },
    { label: 'Mafia', value: 'MAFIA' },
    { label: 'Mkuranga', value: 'MKURANGA' },
    { label: 'Rufiji', value: 'RUFIJI' },
  ],
  RUKWA: [
    { label: 'Sumbawanga Urban', value: 'SUMBAWANGA_URBAN' },
    { label: 'Sumbawanga Rural', value: 'SUMBAWANGA_RURAL' },
    { label: 'Kalambo', value: 'KALAMBO' },
    { label: 'Nkasi', value: 'NKASI' },
  ],
  RUVUMA: [
    { label: 'Songea Urban', value: 'SONGEA_URBAN' },
    { label: 'Songea Rural', value: 'SONGEA_RURAL' },
    { label: 'Mbinga', value: 'MBINGA' },
    { label: 'Namtumbo', value: 'NAMTUMBO' },
    { label: 'Nyasa', value: 'NYASA' },
    { label: 'Tunduru', value: 'TUNDURU' },
  ],
  SHINYANGA: [
    { label: 'Shinyanga Urban', value: 'SHINYANGA_URBAN' },
    { label: 'Shinyanga Rural', value: 'SHINYANGA_RURAL' },
    { label: 'Kahama Town', value: 'KAHAMA_TOWN' },
    { label: 'Kahama Rural', value: 'KAHAMA_RURAL' },
    { label: 'Kishapu', value: 'KISHAPU' },
    { label: 'Msalala', value: 'MSALALA' },
    { label: 'Ushetu', value: 'USHETU' },
  ],
  SIMIYU: [
    { label: 'Bariadi Town', value: 'BARIADI_TOWN' },
    { label: 'Bariadi Rural', value: 'BARIADI_RURAL' },
    { label: 'Busega', value: 'BUSEGA' },
    { label: 'Itilima', value: 'ITILIMA' },
    { label: 'Maswa', value: 'MASWA' },
    { label: 'Meatu', value: 'MEATU' },
  ],
  SINGIDA: [
    { label: 'Singida Urban', value: 'SINGIDA_URBAN' },
    { label: 'Singida Rural', value: 'SINGIDA_RURAL' },
    { label: 'Ikungi', value: 'IKUNGI' },
    { label: 'Iramba', value: 'IRAMBA' },
    { label: 'Manyoni', value: 'MANYONI' },
    { label: 'Mkalama', value: 'MKALAMA' },
  ],
  SONGWE: [
    { label: 'Vwawa', value: 'VWAWA' },
    { label: 'Ileje', value: 'ILEJE' },
    { label: 'Mbozi', value: 'MBOZI' },
    { label: 'Momba', value: 'MOMBA' },
    { label: 'Songwe', value: 'SONGWE' },
    { label: 'Tunduma', value: 'TUNDUMA' },
  ],
  TABORA: [
    { label: 'Tabora Urban', value: 'TABORA_URBAN' },
    { label: 'Tabora Rural', value: 'TABORA_RURAL' },
    { label: 'Igunga', value: 'IGUNGA' },
    { label: 'Kaliua', value: 'KALIUA' },
    { label: 'Nzega', value: 'NZEGA' },
    { label: 'Sikonge', value: 'SIKONGE' },
    { label: 'Urambo', value: 'URAMBO' },
  ],
  TANGA: [
    { label: 'Tanga City', value: 'TANGA_CITY' },
    { label: 'Handeni Town', value: 'HANDENI_TOWN' },
    { label: 'Handeni Rural', value: 'HANDENI_RURAL' },
    { label: 'Kilindi', value: 'KILINDI' },
    { label: 'Korogwe Town', value: 'KOROGWE_TOWN' },
    { label: 'Korogwe Rural', value: 'KOROGWE_RURAL' },
    { label: 'Lushoto', value: 'LUSHOTO' },
    { label: 'Mkinga', value: 'Mkinga' },
    { label: 'Muheza', value: 'MUHEZA' },
    { label: 'Pangani', value: 'PANGANI' },
  ],
};

// Wards by District (simplified - add more as needed)
const WARDS_BY_DISTRICT: Record<string, { label: string; value: string }[]> = {
  // Dar es Salaam - Ilala
  ILALA: [
    { label: 'Buguruni', value: 'BUGURUNI' },
    { label: 'Chanika', value: 'CHANIKA' },
    { label: 'Gerezani', value: 'GEREZANI' },
    { label: 'Ilala', value: 'ILALA' },
    { label: 'Jangwani', value: 'JANGWANI' },
    { label: 'Kariakoo', value: 'KARIAKOO' },
    { label: 'Kipawa', value: 'KIPAWA' },
    { label: 'Kitunda', value: 'KITUNDA' },
    { label: 'Kisutu', value: 'KISUTU' },
    { label: 'Mchafukoge', value: 'MCHAFUKOGE' },
    { label: 'Mchikichini', value: 'MCHIKICHINI' },
    { label: 'Msongola', value: 'MSONGOLA' },
    { label: 'Pugu', value: 'PUGU' },
    { label: 'Tabata', value: 'TABATA' },
    { label: 'Upanga Magharibi', value: 'UPANGA_MAGHARIBI' },
    { label: 'Upanga Mashariki', value: 'UPANGA_MASHARIKI' },
    { label: 'Vingunguti', value: 'VINGUNGUTI' },
  ],
  KINONDONI: [
    { label: 'Bunju', value: 'BUNJU' },
    { label: 'Hananasif', value: 'HANANASIF' },
    { label: 'Kawe', value: 'KAWE' },
    { label: 'Kibamba', value: 'KIBAMBA' },
    { label: 'Kijitonyama', value: 'KIJITONYAMA' },
    { label: 'Kunduchi', value: 'KUNDUCHI' },
    { label: 'Mabibo', value: 'MABIBO' },
    { label: 'Magogoni', value: 'MAGOGONI' },
    { label: 'Makongo', value: 'MAKONGO' },
    { label: 'Makumbusho', value: 'MAKUMBUSHO' },
    { label: 'Manzese', value: 'MANZESE' },
    { label: 'Mbezi', value: 'MBEZI' },
    { label: 'Mikocheni', value: 'MIKOCHENI' },
    { label: 'Msasani', value: 'MSASANI' },
    { label: 'Mwananyamala', value: 'MWANANYAMALA' },
    { label: 'Ndugumbi', value: 'NDUGUMBI' },
    { label: 'Sinza', value: 'SINZA' },
    { label: 'Tandale', value: 'TANDALE' },
  ],
  UBUNGO: [
    { label: 'Goba', value: 'GOBA' },
    { label: 'Kimara', value: 'KIMARA' },
    { label: 'Kibamba', value: 'KIBAMBA' },
    { label: 'Kwembe', value: 'KWEMBE' },
    { label: 'Makuburi', value: 'MAKUBURI' },
    { label: 'Mbezi Juu', value: 'MBEZI_JUU' },
    { label: 'Msigani', value: 'MSIGANI' },
    { label: 'Saranga', value: 'SARANGA' },
    { label: 'Sinza', value: 'SINZA' },
    { label: 'Ubungo', value: 'UBUNGO' },
  ],
  TEMEKE: [
    { label: 'Azimio', value: 'AZIMIO' },
    { label: 'Chamazi', value: 'CHAMAZI' },
    { label: 'Keko', value: 'KEKO' },
    { label: 'Kiburugwa', value: 'KIBURUGWA' },
    { label: 'Kijichi', value: 'KIJICHI' },
    { label: 'Makangarawe', value: 'MAKANGARAWE' },
    { label: 'Mbagala', value: 'MBAGALA' },
    { label: 'Mbagala Kuu', value: 'MBAGALA_KUU' },
    { label: 'Mianzini', value: 'MIANZINI' },
    { label: 'Miburani', value: 'MIBURANI' },
    { label: 'Mjimwema', value: 'MJIMWEMA' },
    { label: 'Mtoni', value: 'MTONI' },
    { label: 'Sandali', value: 'SANDALI' },
    { label: 'Tandika', value: 'TANDIKA' },
    { label: 'Temeke', value: 'TEMEKE' },
    { label: 'Toangoma', value: 'TOANGOMA' },
    { label: 'Yombo Vituka', value: 'YOMBO_VITUKA' },
  ],
  KIGAMBONI: [
    { label: 'Kigamboni', value: 'KIGAMBONI' },
    { label: 'Kimbiji', value: 'KIMBIJI' },
    { label: 'Pemba Mnazi', value: 'PEMBA_MNAZI' },
    { label: 'Somangila', value: 'SOMANGILA' },
    { label: 'Vijibweni', value: 'VIJIBWENI' },
  ],
  
  // Arusha - Arusha City
  ARUSHA_CITY: [
    { label: 'Baraa', value: 'BARAA' },
    { label: 'Daraja Mbili', value: 'DARAJA_MBILI' },
    { label: 'Elerai', value: 'ELERAI' },
    { label: 'Kaloleni', value: 'KALOLENI' },
    { label: 'Kati', value: 'KATI' },
    { label: 'Kimandolu', value: 'KIMANDOLU' },
    { label: 'Lemara', value: 'LEMARA' },
    { label: 'Levolosi', value: 'LEVOLOSI' },
    { label: 'Ngarenaro', value: 'NGARENARO' },
    { label: 'Olorien', value: 'OLORIEN' },
    { label: 'Sakina', value: 'SAKINA' },
    { label: 'Sombetini', value: 'SOMBETINI' },
    { label: 'Terrat', value: 'TERRAT' },
    { label: 'Themi', value: 'THEMI' },
  ],
  
  // Mwanza - Mwanza City
  MWANZA_CITY: [
    { label: 'Buhongwa', value: 'BUHONGWA' },
    { label: 'Butimba', value: 'BUTIMBA' },
    { label: 'Igoma', value: 'IGOMA' },
    { label: 'Isamilo', value: 'ISAMILO' },
    { label: 'Mahina', value: 'MAHINA' },
    { label: 'Mbugani', value: 'MBUGANI' },
    { label: 'Mikuyuni', value: 'MIKUYUNI' },
    { label: 'Mirongo', value: 'MIRONGO' },
    { label: 'Mkolani', value: 'MKOLANI' },
    { label: 'Nyakato', value: 'NYAKATO' },
    { label: 'Nyamanoro', value: 'NYAMANORO' },
    { label: 'Pasiansi', value: 'PASIASI' },
    { label: 'Pamba', value: 'PAMBA' },
  ],
  
  // Mbeya - Mbeya City
  MBEYA_CITY: [
    { label: 'Iganjo', value: 'IGANJO' },
    { label: 'Igawilo', value: 'IGAWILO' },
    { label: 'Iyela', value: 'IYELA' },
    { label: 'Itezi', value: 'ITEZI' },
    { label: 'Itagano', value: 'ITAGANO' },
    { label: 'Mwansekwa', value: 'MWANSEKWA' },
    { label: 'Mwasanga', value: 'MWASANGA' },
    { label: 'Nonde', value: 'NONDE' },
    { label: 'Ruanda', value: 'RUANDA' },
    { label: 'Sinde', value: 'SINDE' },
    { label: 'Tembela', value: 'TEMBELA' },
  ],
  
  // Tanga - Tanga City
  TANGA_CITY: [
    { label: 'Central', value: 'CENTRAL' },
    { label: 'Chongoleani', value: 'CHONGOLEANI' },
    { label: 'Kigoda', value: 'KIGODA' },
    { label: 'Kijima', value: 'KIJIMA' },
    { label: 'Kiomoni', value: 'KIOMONI' },
    { label: 'Mabawa', value: 'MABAWA' },
    { label: 'Majengo', value: 'MAJENGO' },
    { label: 'Makorora', value: 'MAKORORA' },
    { label: 'Marungu', value: 'MARUNGU' },
    { label: 'Maweni', value: 'MAWENI' },
    { label: 'Msambweni', value: 'MSAMBWENI' },
    { label: 'Mzingani', value: 'MZINGANI' },
    { label: 'Nguvumali', value: 'NGUVUMALI' },
    { label: 'Pongwe', value: 'PONGWE' },
    { label: 'Ras Kazone', value: 'RAS_KAZONE' },
    { label: 'Tanga', value: 'TANGA' },
    { label: 'Tongoni', value: 'TONGONI' },
  ],
};

// House features for quick selection
const HOUSE_FEATURES = [
  { label: 'Vyumba 2', value: 'BEDROOMS_2' },
  { label: 'Vyumba 3', value: 'BEDROOMS_3' },
  { label: 'Vyumba 4+', value: 'BEDROOMS_4' },
  { label: 'Sebule', value: 'LIVING_ROOM' },
  { label: 'Jiko la Ndani', value: 'INDOOR_KITCHEN' },
  { label: 'Bafu ya Ndani', value: 'INDOOR_BATHROOM' },
  { label: 'Choo cha Ndani', value: 'INDOOR_TOILET' },
  { label: 'Garage', value: 'GARAGE' },
  { label: 'Bustani', value: 'GARDEN' },
  { label: 'Ua', value: 'COMPOUND' },
  { label: 'Majiko', value: 'WATER_HEATER' },
  { label: 'Mabati', value: 'IRON_SHEET' },
  { label: 'Tiles', value: 'TILES' },
  { label: 'Sakafu ya Saruji', value: 'CEMENT_FLOOR' },
  { label: 'Fencing', value: 'FENCING' },
  { label: 'Security', value: 'SECURITY' },
  { label: 'CCTV', value: 'CCTV' },
  { label: 'Askari', value: 'GUARD' },
];

// Vehicle features for quick selection
const VEHICLE_FEATURES = [
  { label: 'Toyota', value: 'TOYOTA' },
  { label: 'Nissan', value: 'NISSAN' },
  { label: 'Mitsubishi', value: 'MITSUBISHI' },
  { label: 'Suzuki', value: 'SUZUKI' },
  { label: 'Isuzu', value: 'ISUZU' },
  { label: 'Mazda', value: 'MAZDA' },
  { label: 'Honda', value: 'HONDA' },
  { label: 'Daihatsu', value: 'DAIHATSU' },
  { label: 'Petrol', value: 'PETROL' },
  { label: 'Diesel', value: 'DIESEL' },
  { label: 'Automatic', value: 'AUTOMATIC' },
  { label: 'Manual', value: 'MANUAL' },
  { label: 'AC', value: 'AC' },
  { label: 'Power Windows', value: 'POWER_WINDOWS' },
  { label: 'Central Lock', value: 'CENTRAL_LOCK' },
  { label: 'Radio', value: 'RADIO' },
  { label: 'Bluetooth', value: 'BLUETOOTH' },
  { label: 'GPS', value: 'GPS' },
  { label: 'Reverse Camera', value: 'REVERSE_CAMERA' },
  { label: 'ABS', value: 'ABS' },
  { label: 'Airbags', value: 'AIRBAGS' },
];

// Land features for quick selection
const LAND_FEATURES = [
  { label: 'Eneo la Biashara', value: 'COMMERCIAL' },
  { label: 'Eneo la Makazi', value: 'RESIDENTIAL' },
  { label: 'Eneo la Kilimo', value: 'AGRICULTURAL' },
  { label: 'Karibu na Barabara', value: 'NEAR_ROAD' },
  { label: 'Umeme', value: 'ELECTRICITY' },
  { label: 'Maji', value: 'WATER' },
  { label: 'Fencing', value: 'FENCING' },
  { label: 'Title Deed', value: 'TITLE_DEED' },
  { label: 'Surveyed', value: 'SURVEYED' },
  { label: 'Beach Front', value: 'BEACH_FRONT' },
  { label: 'Mlimani', value: 'HILLSIDE' },
  { label: 'Bonde', value: 'VALLEY' },
];

// Business features for quick selection
const BUSINESS_FEATURES = [
  { label: 'Duka', value: 'SHOP' },
  { label: 'Mgahawa', value: 'RESTAURANT' },
  { label: 'Hoteli', value: 'HOTEL' },
  { label: 'Ofisi', value: 'OFFICE' },
  { label: 'Warsha', value: 'WORKSHOP' },
  { label: 'Kiwanda', value: 'FACTORY' },
  { label: 'Ghorofa', value: 'MULTI_STOREY' },
  { label: 'Umeme', value: 'ELECTRICITY' },
  { label: 'Maji', value: 'WATER' },
  { label: 'Parking', value: 'PARKING' },
  { label: 'Security', value: 'SECURITY' },
  { label: 'Customer Parking', value: 'CUSTOMER_PARKING' },
];

interface FormData {
  asset_type: string;
  asset_description: string;
  asset_location: string;
  region: string;
  district: string;
  ward: string;
  street: string;
  currency: string;
  sale_price: number;
  payment_terms: string;
  effective_date: string;
  expiry_date: string;
  seller_tin: string;
  seller_additional_contact: string;
  special_conditions: string;
  witness_name: string;
  witness_phone: string;
  witness_address: string;
  terms_accepted: boolean;
  selected_features: string[];
}

interface LookupResult {
  id: string;
  citizen_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  region?: string;
  district?: string;
}

type Step = 'asset' | 'seller' | 'buyer' | 'terms' | 'review';

export const MakubalianoMauzianoForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const t = labels[lang];
  const [currentStep, setCurrentStep] = useState<Step>('asset');
  const [showReview, setShowReview] = useState(false);
  
  // Citizen lookup state
  const [citizenId, setCitizenId] = useState('');
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [lookupError, setLookupError] = useState('');
  
  // File upload state
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  
  // Location state
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  
  // Asset features state
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customDescription, setCustomDescription] = useState('');
  
  const { register, handleSubmit, formState: { errors }, trigger, getValues, watch, setValue } = useForm<FormData>();

  const steps: { key: Step; label: string; swLabel: string }[] = [
    { key: 'asset', label: 'Asset Details', swLabel: 'Taarifa za Mali' },
    { key: 'seller', label: 'Seller Info', swLabel: 'Muuzaji' },
    { key: 'buyer', label: 'Buyer Lookup', swLabel: 'Tafuta Mnunuji' },
    { key: 'terms', label: 'Terms', swLabel: 'Masharti' },
    { key: 'review', label: 'Review', swLabel: 'Hakiki' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Watch sale price for fee calculation
  const salePrice = watch('sale_price') || 0;
  const currency = watch('currency');
  const assetType = watch('asset_type');

  // Calculate fee based on transaction value
  const feeBreakdown = useMemo(() => {
    if (salePrice <= 0) return null;
    
    const calculated = Math.round(salePrice * FEE_PERCENTAGE);
    const finalFee = Math.max(MIN_FEE, Math.min(MAX_FEE, calculated));
    
    return {
      calculated,
      finalFee,
      minFee: MIN_FEE,
      maxFee: MAX_FEE,
      percentage: FEE_PERCENTAGE * 100
    };
  }, [salePrice]);

  // Get available districts based on selected region
  const availableDistricts = selectedRegion ? DISTRICTS_BY_REGION[selectedRegion] || [] : [];
  
  // Get available wards based on selected district
  const availableWards = selectedDistrict ? WARDS_BY_DISTRICT[selectedDistrict] || [] : [];

  // Get feature options based on asset type
  const getFeatureOptions = () => {
    switch (assetType) {
      case 'HOUSE':
        return HOUSE_FEATURES;
      case 'VEHICLE':
        return VEHICLE_FEATURES;
      case 'LAND':
        return LAND_FEATURES;
      case 'BUSINESS':
        return BUSINESS_FEATURES;
      default:
        return [];
    }
  };

  // Toggle feature selection
  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => {
      if (prev.includes(feature)) {
        return prev.filter(f => f !== feature);
      } else {
        return [...prev, feature];
      }
    });
  };

  // Generate asset description from selected features and custom description
  const generateAssetDescription = () => {
    const featureLabels = selectedFeatures.map(f => {
      const feature = getFeatureOptions().find(opt => opt.value === f);
      return feature ? feature.label : f;
    });
    
    const featuresText = featureLabels.join(', ');
    
    if (featuresText && customDescription) {
      return `${featuresText}. ${customDescription}`;
    } else if (featuresText) {
      return featuresText;
    } else {
      return customDescription;
    }
  };

  // Update form value when features or custom description change
  useEffect(() => {
    const description = generateAssetDescription();
    setValue('asset_description', description);
  }, [selectedFeatures, customDescription, assetType]);

  // Citizen lookup handler
  const handleCitizenLookup = async () => {
    if (!citizenId.trim()) {
      setLookupError(lang === 'sw' ? 'Tafadhali ingiza Namba ya Raia' : 'Please enter Citizen ID');
      return;
    }

    setSearching(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, citizen_id, first_name, middle_name, last_name, phone, email, region, district')
        .eq('citizen_id', citizenId.trim().toUpperCase())
        .single();

      if (error || !data) {
        setLookupError(lang === 'sw' 
          ? 'Mtumiaji hajapatikana. Hakikisha namba ni sahihi.' 
          : 'User not found. Please verify the ID.');
        return;
      }

      // Prevent selecting self
      if (userProfile && data.id === userProfile.id) {
        setLookupError(lang === 'sw' 
          ? 'Huwezi kuchagua wewe mwenyewe kama mhusika wa pili.' 
          : 'You cannot select yourself as the second party.');
        return;
      }

      setLookupResult({
        id: data.id,
        citizen_id: data.citizen_id,
        full_name: `${data.first_name} ${data.middle_name || ''} ${data.last_name}`.trim(),
        phone: data.phone,
        email: data.email,
        region: data.region,
        district: data.district
      });
    } catch {
      setLookupError(lang === 'sw' ? 'Hitilafu ya mtandao' : 'Network error');
    } finally {
      setSearching(false);
    }
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(lang === 'sw' ? 'Faili kubwa sana. Upeo ni 10MB.' : 'File too large. Maximum is 10MB.');
      return;
    }

    setAgreementFile(file);
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `agreements/${Date.now()}_${userProfile?.id || 'unknown'}.${fileExt}`;

      const { error } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      setUploadedUrl(urlData.publicUrl);
    } catch {
      alert(lang === 'sw' ? 'Imeshindikana kupakia faili' : 'Failed to upload file');
      setAgreementFile(null);
    } finally {
      setUploading(false);
    }
  };

  // Step validation
  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (currentStep) {
      case 'asset':
        fieldsToValidate = ['asset_type', 'asset_description', 'sale_price', 'currency', 'effective_date', 'region', 'district', 'ward', 'street'];
        break;
      case 'seller':
        return true; // Optional fields
      case 'buyer':
        return !!lookupResult;
      case 'terms':
        fieldsToValidate = ['terms_accepted'];
        return !!uploadedUrl && await trigger(fieldsToValidate);
    }
    
    return trigger(fieldsToValidate);
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex].key);
      }
      if (currentStep === 'terms') {
        setShowReview(true);
      }
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const onFormSubmit = async (data: FormData) => {
    if (!lookupResult || !feeBreakdown) return;

    const submitData = {
      ...data,
      service_fee: feeBreakdown.finalFee,
      buyer_id: lookupResult.id,
      buyer_citizen_id: lookupResult.citizen_id,
      buyer_name: lookupResult.full_name,
      agreement_document_url: uploadedUrl,
      seller_name: userProfile ? `${userProfile.first_name} ${userProfile.middle_name || ''} ${userProfile.last_name}`.trim() : '',
      seller_citizen_id: userProfile?.citizen_id || '',
      selected_features: selectedFeatures,
    };

    onSubmit(submitData);
  };

  const confirmSubmit = () => {
    handleSubmit(onFormSubmit)();
  };

  // Styling classes
  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-1";
  const sectionClass = "bg-linear-to-r from-emerald-100 to-teal-50 p-4 rounded-xl border border-emerald-200";

  // Progress bar component
  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={step.key}
            className={`flex items-center gap-1 text-xs font-medium ${
              index <= currentStepIndex ? 'text-emerald-600' : 'text-stone-400'
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              index < currentStepIndex 
                ? 'bg-emerald-600 text-white' 
                : index === currentStepIndex 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-stone-200 text-stone-500'
            }`}>
              {index < currentStepIndex ? <CheckCircle className="h-4 w-4" /> : index + 1}
            </span>
            <span className="hidden md:inline">{lang === 'sw' ? step.swLabel : step.label}</span>
          </div>
        ))}
      </div>
      <div className="bg-stone-200 h-2 rounded-full overflow-hidden">
        <div
          ref={progressFillRef}
          className="progress-bar bg-linear-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
        />
      </div>
    </div>
  );

  // Review section component
  const ReviewSection = () => {
    const data = getValues();
    
    return (
      <div className="space-y-6">
        <div className={sectionClass}>
          <h3 className="font-bold text-emerald-800 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {lang === 'sw' ? 'HAKIKI MAKUBALIANO' : 'REVIEW AGREEMENT'}
          </h3>
        </div>

        {/* Asset Summary */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
          <h4 className="font-bold text-stone-800 flex items-center gap-2">
            <Home className="h-4 w-4" />
            {lang === 'sw' ? 'Taarifa za Mali' : 'Asset Details'}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-stone-500">{lang === 'sw' ? 'Aina:' : 'Type:'}</span>
              <p className="font-medium">{ASSET_TYPES.find(a => a.value === data.asset_type)?.label || data.asset_type}</p>
            </div>
            <div>
              <span className="text-stone-500">{lang === 'sw' ? 'Bei:' : 'Price:'}</span>
              <p className="font-medium">{Number(data.sale_price).toLocaleString()} {data.currency}</p>
            </div>
            <div className="col-span-2">
              <span className="text-stone-500">{lang === 'sw' ? 'Maelezo:' : 'Description:'}</span>
              <p className="font-medium">{data.asset_description}</p>
            </div>
            <div className="col-span-2">
              <span className="text-stone-500">{lang === 'sw' ? 'Mahali:' : 'Location:'}</span>
              <p className="font-medium">{data.street}, {data.ward}, {data.district}, {data.region}</p>
            </div>
          </div>
        </div>

        {/* Parties Summary */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
          <h4 className="font-bold text-stone-800 flex items-center gap-2">
            <Users className="h-4 w-4" />
            {lang === 'sw' ? 'Pande za Makubaliano' : 'Agreement Parties'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 p-3 rounded-lg">
              <span className="text-xs text-emerald-600 font-medium">{lang === 'sw' ? 'MUUZAJI / MPANGISHAJI' : 'SELLER / LANDLORD'}</span>
              <p className="font-bold text-emerald-800">
                {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : '-'}
              </p>
              <p className="text-sm text-emerald-600">{userProfile?.citizen_id || ''}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg">
              <span className="text-xs text-emerald-600 font-medium">{lang === 'sw' ? 'MNUNUZI / MPANGAJI' : 'BUYER / TENANT'}</span>
              <p className="font-bold text-emerald-800">{lookupResult?.full_name || '-'}</p>
              <p className="text-sm text-emerald-600">{lookupResult?.citizen_id || ''}</p>
            </div>
          </div>
        </div>

        {/* Fee Summary */}
        {feeBreakdown && (
          <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
            <h4 className="font-bold text-emerald-800 mb-3">{lang === 'sw' ? 'Muhtasari wa Ada' : 'Fee Summary'}</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700">{lang === 'sw' ? 'Thamani ya Mauziano:' : 'Transaction Value:'}</span>
                <span className="font-medium">{Number(data.sale_price).toLocaleString()} {data.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700">{lang === 'sw' ? 'Ada (3%):' : 'Fee (3%):'}</span>
                <span className="font-medium">{feeBreakdown.calculated.toLocaleString()} TZS</span>
              </div>
              {feeBreakdown.calculated !== feeBreakdown.finalFee && (
                <>
                  <div className="border-t border-emerald-200 my-2"></div>
                  <div className="flex justify-between text-emerald-600">
                    <span>{lang === 'sw' ? 'Kiwango cha Chini:' : 'Minimum Fee:'}</span>
                    <span>{feeBreakdown.minFee.toLocaleString()} TZS</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>{lang === 'sw' ? 'Kiwango cha Juu:' : 'Maximum Fee:'}</span>
                    <span>{feeBreakdown.maxFee.toLocaleString()} TZS</span>
                  </div>
                </>
              )}
              
              <div className="border-t border-emerald-200 my-2"></div>
              <div className="flex justify-between font-bold text-lg">
                <span className="text-emerald-800">{lang === 'sw' ? 'Ada ya Mwisho:' : 'Final Fee:'}</span>
                <span className="text-emerald-600">{feeBreakdown.finalFee.toLocaleString()} TZS</span>
              </div>
            </div>
            
            <p className="text-xs text-emerald-600 mt-3">
              {lang === 'sw' 
                ? 'Ada ni 3% ya thamani ya mauziano (kiwango cha chini 5,000 TZS, kiwango cha juu 500,000 TZS). Malipo yatakamilishwa baada ya kuwasilisha.'
                : 'Fee is 3% of the transaction value (minimum 5,000 TZS, maximum 500,000 TZS). Payment will be completed after submission.'}
            </p>
          </div>
        )}

        {/* Important Notices */}
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-800 mb-1">
                  {lang === 'sw' ? 'Arifa kwa Mhusika' : 'Notification to Second Party'}
                </h4>
                <p className="text-sm text-blue-700">
                  {lang === 'sw' 
                    ? 'Baada ya kuwasilisha, mnunuzi/mpangaji atapokea arifa ya kukagua na kuidhinisha makubaliano haya. Makubaliano hayatakamilika mpaka wakubali.'
                    : 'After submission, the buyer/tenant will receive a notification to review and approve this agreement. The agreement will not be finalized until they accept.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-800 mb-1">
                  {lang === 'sw' ? 'Uhalali wa Makubaliano' : 'Agreement Validity'}
                </h4>
                <p className="text-sm text-emerald-700">
                  {lang === 'sw' 
                    ? 'Makubaliano haya yatakuwa na nguvu ya kisheria baada ya pande zote mbili kukubali. Hakikisha umesoma na kuelewa masharti yote.'
                    : 'This agreement will be legally binding after both parties accept. Ensure you have read and understood all terms.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowReview(false)}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            {lang === 'sw' ? 'Rudi' : 'Back'}
          </button>
          <button
            type="button"
            onClick={confirmSubmit}
            disabled={isLoading || !lookupResult || !uploadedUrl || !feeBreakdown}
            className="flex-1 py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <FileCheck className="h-5 w-5" />
                {lang === 'sw' ? 'Wasilisha Makubaliano' : 'Submit Agreement'}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (showReview) {
    return (
      <form className="space-y-6">
        <ReviewSection />
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <ProgressBar />

      {/* Step 1: Asset Details */}
      {currentStep === 'asset' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Home className="h-5 w-5" />
              {lang === 'sw' ? 'TAARIFA ZA MALI' : 'ASSET DETAILS'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Aina ya Mali' : 'Asset Type'} <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('asset_type', { required: true })} 
                className={inputClass}
                onChange={(e) => {
                  setValue('asset_type', e.target.value);
                  setSelectedFeatures([]);
                }}
              >
                <option value="">{t.selectOption}</option>
                {ASSET_TYPES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.asset_type && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Sarafu' : 'Currency'} <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('currency', { required: true })} 
                className={inputClass}
                defaultValue="TZS"
              >
                {CURRENCY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.currency && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>
          </div>

          {/* Asset Features Quick Selection */}
          {assetType && getFeatureOptions().length > 0 && (
            <div className="space-y-3">
              <label className={labelClass}>
                {lang === 'sw' ? 'Vipengele vya Mali (Bofya kuchagua)' : 'Asset Features (Click to select)'}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {getFeatureOptions().map(feature => (
                  <button
                    key={feature.value}
                    type="button"
                    onClick={() => toggleFeature(feature.value)}
                    className={`p-2 text-xs rounded-lg border transition-all flex items-center gap-1 ${
                      selectedFeatures.includes(feature.value)
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <CheckSquare className={`h-3 w-3 ${
                      selectedFeatures.includes(feature.value) ? 'text-emerald-600' : 'text-stone-400'
                    }`} />
                    {feature.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Maelezo ya Ziada (Hiari)' : 'Additional Description (Optional)'}
            </label>
            <textarea 
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className={inputClass}
              rows={3}
              placeholder={lang === 'sw' 
                ? 'Andika maelezo ya ziada hapa...' 
                : 'Write additional description here...'}
            />
          </div>

          {/* Hidden field for asset_description */}
          <input 
            type="hidden" 
            {...register('asset_description', { required: true })} 
          />

          {/* Location Section */}
          <div className="border-t border-stone-200 pt-4">
            <h4 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {lang === 'sw' ? 'Mahali pa Mali' : 'Asset Location'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  {lang === 'sw' ? 'Mkoa' : 'Region'} <span className="text-red-500">*</span>
                </label>
                <select 
                  {...register('region', { required: true })}
                  className={inputClass}
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setSelectedDistrict('');
                    setSelectedWard('');
                    setValue('region', e.target.value);
                    setValue('district', '');
                    setValue('ward', '');
                  }}
                >
                  <option value="">{lang === 'sw' ? 'Chagua Mkoa' : 'Select Region'}</option>
                  {TANZANIA_REGIONS.map(region => (
                    <option key={region.value} value={region.value}>{region.label}</option>
                  ))}
                </select>
                {errors.region && <span className="text-red-500 text-sm">{t.required}</span>}
              </div>

              <div>
                <label className={labelClass}>
                  {lang === 'sw' ? 'Wilaya' : 'District'} <span className="text-red-500">*</span>
                </label>
                <select 
                  {...register('district', { required: true })}
                  className={inputClass}
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setSelectedWard('');
                    setValue('district', e.target.value);
                    setValue('ward', '');
                  }}
                  disabled={!selectedRegion}
                >
                  <option value="">{lang === 'sw' ? 'Chagua Wilaya' : 'Select District'}</option>
                  {availableDistricts.map(district => (
                    <option key={district.value} value={district.value}>{district.label}</option>
                  ))}
                </select>
                {errors.district && <span className="text-red-500 text-sm">{t.required}</span>}
              </div>

              <div>
                <label className={labelClass}>
                  {lang === 'sw' ? 'Kata' : 'Ward'} <span className="text-red-500">*</span>
                </label>
                <select 
                  {...register('ward', { required: true })}
                  className={inputClass}
                  value={selectedWard}
                  onChange={(e) => {
                    setSelectedWard(e.target.value);
                    setValue('ward', e.target.value);
                  }}
                  disabled={!selectedDistrict}
                >
                  <option value="">{lang === 'sw' ? 'Chagua Kata' : 'Select Ward'}</option>
                  {availableWards.map(ward => (
                    <option key={ward.value} value={ward.value}>{ward.label}</option>
                  ))}
                </select>
                {errors.ward && <span className="text-red-500 text-sm">{t.required}</span>}
              </div>

              <div>
                <label className={labelClass}>
                  {lang === 'sw' ? 'Mtaa / Kitongoji' : 'Street / Neighborhood'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input 
                    type="text" 
                    {...register('street', { required: true })} 
                    className={`${inputClass} pl-10`}
                    placeholder={lang === 'sw' ? 'Mtaa, namba ya nyumba, alama' : 'Street, house number, landmarks'}
                  />
                </div>
                {errors.street && <span className="text-red-500 text-sm">{t.required}</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Bei ya Mauziano / Kodi' : 'Sale Price / Rent'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="number" 
                  {...register('sale_price', { 
                    required: true, 
                    min: 1,
                    validate: value => value > 0 || 'Price must be greater than 0'
                  })} 
                  className={`${inputClass} pl-10`}
                  placeholder="0"
                />
              </div>
              {errors.sale_price && <span className="text-red-500 text-sm">{errors.sale_price.message || t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Masharti ya Malipo' : 'Payment Terms'}
              </label>
              <select 
                {...register('payment_terms')} 
                className={inputClass}
              >
                <option value="">{lang === 'sw' ? 'Chagua...' : 'Select...'}</option>
                {PAYMENT_TERMS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Tarehe ya Kuanza' : 'Effective Date'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="date" 
                  {...register('effective_date', { required: true })} 
                  className={`${inputClass} pl-10`}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.effective_date && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Tarehe ya Kuisha (kama ipo)' : 'Expiry Date (if applicable)'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="date" 
                  {...register('expiry_date', {
                    validate: (value, formValues) => {
                      if (!value) return true;
                      return new Date(value) > new Date(formValues.effective_date) || 
                        (lang === 'sw' ? 'Tarehe ya kuisha lazima iwe baada ya tarehe ya kuanza' : 'Expiry date must be after effective date');
                    }
                  })} 
                  className={`${inputClass} pl-10`}
                  min={watch('effective_date')}
                />
              </div>
              {errors.expiry_date && <span className="text-red-500 text-sm">{errors.expiry_date.message}</span>}
            </div>
          </div>

          {/* Live Fee Preview */}
          {salePrice > 0 && feeBreakdown && (
            <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-emerald-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {lang === 'sw' ? 'Ada ya Makadirio:' : 'Estimated Fee:'}
                </span>
                <span className="font-bold text-lg text-emerald-600">{feeBreakdown.finalFee.toLocaleString()} TZS</span>
              </div>
              <div className="text-xs text-emerald-600 flex items-center gap-1">
                <Info className="h-3 w-3" />
                <span>
                  {lang === 'sw' 
                    ? `3% ya ${salePrice.toLocaleString()} ${currency || 'TZS'} = ${feeBreakdown.calculated.toLocaleString()} TZS` 
                    : `3% of ${salePrice.toLocaleString()} ${currency || 'TZS'} = ${feeBreakdown.calculated.toLocaleString()} TZS`}
                </span>
              </div>
              {(feeBreakdown.calculated < MIN_FEE || feeBreakdown.calculated > MAX_FEE) && (
                <div className="text-xs text-emerald-600 mt-1">
                  {feeBreakdown.calculated < MIN_FEE && (
                    <span>{lang === 'sw' ? `Ada ya chini ${MIN_FEE.toLocaleString()} TZS imetumika` : `Minimum fee of ${MIN_FEE.toLocaleString()} TZS applied`}</span>
                  )}
                  {feeBreakdown.calculated > MAX_FEE && (
                    <span>{lang === 'sw' ? `Ada ya juu ${MAX_FEE.toLocaleString()} TZS imetumika` : `Maximum fee of ${MAX_FEE.toLocaleString()} TZS applied`}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Seller/Landlord Information */}
      {currentStep === 'seller' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <User className="h-5 w-5" />
              {lang === 'sw' ? 'TAARIFA ZA MUUZAJI / MPANGISHAJI' : 'SELLER / LANDLORD INFORMATION'}
            </h3>
          </div>

          {/* Verified profile info display */}
          {userProfile && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {lang === 'sw' ? 'Taarifa Zako (Kutoka kwa Wasifu)' : 'Your Information (From Profile)'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Jina Kamili' : 'Full Name'}</span>
                  <p className="font-medium">{userProfile.first_name} {userProfile.middle_name || ''} {userProfile.last_name}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'}</span>
                  <p className="font-medium">{userProfile.nida_number || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Simu' : 'Phone'}</span>
                  <p className="font-medium">{userProfile.phone}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">Email</span>
                  <p className="font-medium">{userProfile.email}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Anwani' : 'Address'}</span>
                  <p className="font-medium">{userProfile.region || ''} {userProfile.district || ''} {userProfile.ward || ''}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Namba ya TIN (TRA) - Hiari' : 'TIN Number (TRA) - Optional'}
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input 
                type="text" 
                {...register('seller_tin')} 
                className={`${inputClass} pl-10`}
                placeholder="123-456-789"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Simu ya Ziada (Hiari)' : 'Additional Phone (Optional)'}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input 
                type="tel" 
                {...register('seller_additional_contact')} 
                className={`${inputClass} pl-10`}
                placeholder="+255 7XX XXX XXX"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                {lang === 'sw' 
                  ? 'Taarifa zako za msingi zitatumika kutoka kwa wasifu wako. Unaweza kuongeza TIN na namba ya simu ya ziada kwa ajili ya mawasiliano.'
                  : 'Your basic information will be taken from your profile. You can add TIN and additional phone number for contact.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Buyer/Tenant Lookup */}
      {currentStep === 'buyer' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              {lang === 'sw' ? 'TAFUTA MNUNUZI / MPANGAJI' : 'FIND BUYER / TENANT'}
            </h3>
          </div>

          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Search className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  {lang === 'sw' 
                    ? 'Ingiza Namba ya Raia (Citizen ID) ya mtu unayetaka kuingia naye makubaliano. Namba hii inapatikana kwenye wasifu wa mtumiaji.'
                    : 'Enter the Citizen ID of the person you want to enter into agreement with. This number is found on the user\'s profile.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                type="text"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value.toUpperCase())}
                placeholder="CT2026A12345"
                className="w-full p-3 pl-10 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono uppercase tracking-wider"
              />
            </div>
            <button
              type="button"
              onClick={handleCitizenLookup}
              disabled={searching}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-amber-400 text-white rounded-xl font-semibold flex items-center gap-2 transition-all"
            >
              {searching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">
                {lang === 'sw' ? 'Tafuta' : 'Search'}
              </span>
            </button>
          </div>

          {/* User found result */}
          {lookupResult && (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                <span className="font-bold text-emerald-700 text-lg">
                  {lang === 'sw' ? 'Mtumiaji Amepatikana!' : 'User Found!'}
                </span>
              </div>
              
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-stone-400" />
                  <span className="font-semibold text-stone-600 w-24">{lang === 'sw' ? 'Jina:' : 'Name:'}</span>
                  <span className="font-bold text-stone-900">{lookupResult.full_name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-stone-400" />
                  <span className="font-semibold text-stone-600 w-24">{lang === 'sw' ? 'Namba:' : 'ID:'}</span>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded">{lookupResult.citizen_id}</span>
                </div>
                
                {lookupResult.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-stone-400" />
                    <span className="font-semibold text-stone-600 w-24">{lang === 'sw' ? 'Simu:' : 'Phone:'}</span>
                    <span className="text-stone-700">{lookupResult.phone}</span>
                  </div>
                )}
                
                {lookupResult.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-stone-400" />
                    <span className="font-semibold text-stone-600 w-24">Email:</span>
                    <span className="text-stone-700">{lookupResult.email}</span>
                  </div>
                )}
                
                {(lookupResult.region || lookupResult.district) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-stone-400" />
                    <span className="font-semibold text-stone-600 w-24">{lang === 'sw' ? 'Anwani:' : 'Address:'}</span>
                    <span className="text-stone-700">{lookupResult.region || ''} {lookupResult.district || ''}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <Bell className="h-4 w-4" />
                  {lang === 'sw' 
                    ? 'Baada ya kutuma ombi, mtumiaji huyu atapokea arifa ya kuidhinisha makubaliano haya.'
                    : 'After submission, this user will receive a notification to approve this agreement.'}
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {lookupError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-red-700 font-medium">{lookupError}</span>
                  <p className="text-xs text-red-500 mt-1">
                    {lang === 'sw' 
                      ? 'Hakikisha mtumiaji amesajiliwa kwenye E-Serikali Mtaa na umeingiza namba sahihi.'
                      : 'Ensure the user is registered on E-Serikali Mtaa and you entered the correct number.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tip for finding ID */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              {lang === 'sw' ? 'Jinsi ya Kupata Namba ya Raia' : 'How to Find Citizen ID'}
            </h4>
            <p className="text-sm text-emerald-700">
              {lang === 'sw' 
                ? 'Namba ya Raia inapatikana kwenye wasifu wa mtumiaji. Mfano: CT2026A12345. Hakikisha unaandika kwa usahihi.'
                : 'Citizen ID is found on the user\'s profile. Example: CT2026A12345. Make sure you type it correctly.'}
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Terms and Documents */}
      {currentStep === 'terms' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              {lang === 'sw' ? 'MASHARTI NA NYARAKA' : 'TERMS AND DOCUMENTS'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Masharti Maalum / Maelezo ya Ziada' : 'Special Conditions / Additional Notes'}
            </label>
            <textarea 
              {...register('special_conditions')} 
              className={inputClass}
              rows={4}
              placeholder={lang === 'sw' 
                ? 'Andika masharti yoyote maalum ya makubaliano haya (mfano: malipo ya awamu, masharti ya ukaguzi, n.k.)' 
                : 'Write any special conditions for this agreement (e.g., installment payments, inspection conditions, etc.)'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Jina la Shahidi (Hiari)' : 'Witness Name (Optional)'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="text" 
                  {...register('witness_name')} 
                  className={`${inputClass} pl-10`}
                  placeholder={lang === 'sw' ? 'Jina kamili la shahidi' : 'Full name of witness'}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Simu ya Shahidi (Hiari)' : 'Witness Phone (Optional)'}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="tel" 
                  {...register('witness_phone')} 
                  className={`${inputClass} pl-10`}
                  placeholder="+255 7XX XXX XXX"
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Anwani ya Shahidi (Hiari)' : 'Witness Address (Optional)'}
            </label>
            <input 
              type="text" 
              {...register('witness_address')} 
              className={inputClass}
              placeholder={lang === 'sw' ? 'Anwani kamili ya shahidi' : 'Full address of witness'}
            />
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Pakia Mkataba wa Makubaliano (Signed Agreement)' : 'Upload Signed Agreement'} <span className="text-red-500">*</span>
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              aria-label="Upload signed agreement document"
            />
            
            {!agreementFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Upload agreement document"
                className="w-full p-8 border-2 border-dashed border-stone-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center gap-3"
              >
                {uploading ? (
                  <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-stone-400" />
                    <div className="text-center">
                      <span className="text-stone-600 font-medium block">
                        {lang === 'sw' ? 'Bofya kupakia mkataba' : 'Click to upload agreement'}
                      </span>
                      <span className="text-xs text-stone-400 mt-1 block">
                        PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                      </span>
                    </div>
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-800">{agreementFile.name}</p>
                    <p className="text-xs text-emerald-600">{(agreementFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Remove uploaded file"
                  onClick={() => {
                    setAgreementFile(null);
                    setUploadedUrl('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="p-2 hover:bg-red-100 rounded-full transition-all"
                >
                  <X className="h-5 w-5 text-red-500" />
                </button>
              </div>
            )}
          </div>

          {/* Upload status */}
          {uploadedUrl && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">
                  {lang === 'sw' ? 'Mkataba umepakiwa kikamilifu!' : 'Agreement uploaded successfully!'}
                </span>
              </div>
            </div>
          )}

          {/* Terms Acceptance Checkbox */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                {...register('terms_accepted', { required: true })} 
                className="w-5 h-5 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div>
                <span className="font-medium text-emerald-800">
                  {lang === 'sw' 
                    ? 'Nakubali masharti na kanuni za makubaliano' 
                    : 'I accept the terms and conditions of this agreement'}
                </span>
                <p className="text-xs text-emerald-600 mt-1">
                  {lang === 'sw' 
                    ? 'Kwa kukubali, unathibitisha kuwa taarifa ulizotoa ni sahihi na unaelewa kuwa makubaliano haya yatakuwa na nguvu ya kisheria baada ya pande zote mbili kukubali.'
                    : 'By accepting, you confirm that the information provided is correct and you understand that this agreement will be legally binding after both parties accept.'}
                </p>
              </div>
            </label>
            {errors.terms_accepted && (
              <span className="text-red-500 text-sm block mt-2">
                {lang === 'sw' ? 'Lazima ukubali masharti ili kuendelea' : 'You must accept the terms to continue'}
              </span>
            )}
          </div>

          {/* Document requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {lang === 'sw' ? 'Mahitaji ya Mkataba' : 'Agreement Requirements'}
            </h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{lang === 'sw' ? 'Mkataba uwe umesainiwa na pande zote mbili' : 'Agreement must be signed by both parties'}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{lang === 'sw' ? 'Mkataba uwe unaonesha wazi bei, masharti, na tarehe' : 'Agreement must clearly show price, terms, and dates'}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{lang === 'sw' ? 'Faili liwe wazi na lisomeke vizuri' : 'File must be clear and legible'}</span>
              </li>
            </ul>
          </div>

          {/* Fee Summary in Terms Step */}
          {feeBreakdown && (
            <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
              <h4 className="font-bold text-emerald-800 mb-2">{lang === 'sw' ? 'Ada ya Usindikaji' : 'Processing Fee'}</h4>
              <div className="flex justify-between items-center">
                <span className="text-emerald-700">{lang === 'sw' ? 'Jumla ya Ada:' : 'Total Fee:'}</span>
                <span className="font-bold text-xl text-emerald-600">{feeBreakdown.finalFee.toLocaleString()} TZS</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-6 border-t border-stone-200">
        {currentStepIndex > 0 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            {lang === 'sw' ? 'Nyuma' : 'Previous'}
          </button>
        )}
        
        {currentStep !== 'review' && (
          <button
            type="button"
            onClick={handleNext}
            className={`flex-1 py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
              currentStepIndex === 0 ? 'w-full' : ''
            }`}
          >
            {currentStep === 'terms' ? (
              <>
                {lang === 'sw' ? 'Hakiki Makubaliano' : 'Review Agreement'}
                <Eye className="h-5 w-5" />
              </>
            ) : (
              <>
                {lang === 'sw' ? 'Endelea' : 'Continue'}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden submit for form completion */}
      {currentStep === 'review' && (
        <button type="submit" className="hidden" aria-label="Submit form" />
      )}
    </form>
  );
};

export default MakubalianoMauzianoForm;
