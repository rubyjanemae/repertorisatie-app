// Middelprofielen — gecureerde acute materia medica samenvattingen
// Volgorde: causa, pijn/sensatie, opvallendheden, modaliteiten, sleutelSX, indicaties

export interface RemedyProfile {
  abbr: string;
  causa: string[];
  pijnSensatie: string[];
  opvallendheden: string[];
  modaliteiten: {
    erger: string[];
    beter: string[];
  };
  sleutelSx: string[];
  veelGebruiktBij: string[];
}

const remedyProfiles: RemedyProfile[] = [
  {
    abbr: 'acon',
    causa: ['Afkoeling (koude droge wind)', 'Schrik/angst', 'Plotselinge kou'],
    pijnSensatie: ['Hevig, onverdraaglijk', 'Brandend', 'Tintelend/verdoofd'],
    opvallendheden: ['Grote angst en onrust', 'Angst voor de dood', 'Voorspelt tijdstip van overlijden', 'Extreme dorst'],
    modaliteiten: {
      erger: ['Avond/nacht (rond middernacht)', 'Koude droge wind', 'Warmte kamer', 'Muziek'],
      beter: ['Open lucht', 'Rust', 'Zweten'],
    },
    sleutelSx: ['Plotseling begin na kou', 'Eén wang rood, één bleek', 'Hoge koorts met droge huid', 'Angst + onrust'],
    veelGebruiktBij: ['Griep (eerste stadium)', 'Keelontsteking', 'Oorontsteking', 'Croup', 'Koorts', 'Paniekaanval'],
  },
  {
    abbr: 'apis',
    causa: ['Insectenbeten/-steken', 'Onderdrukking van uitslag', 'Jaloezie/verdriet'],
    pijnSensatie: ['Stekend', 'Brandend', 'Pijnlijk bij aanraking'],
    opvallendheden: ['Dorstloos ondanks koorts', 'Oedemateuze zwellingen', 'Rozig-rode zwelling', 'Jaloers, druk, rusteloos'],
    modaliteiten: {
      erger: ['Warmte (in elke vorm)', 'Aanraking', 'Druk', 'Rechts', 'Na slapen'],
      beter: ['Koude (koude kompressen)', 'Open lucht', 'Onbedekt zijn'],
    },
    sleutelSx: ['Zwelling met stekende pijn', 'Dorstloos bij koorts', 'Beter van koude applicaties', 'Rechter kant'],
    veelGebruiktBij: ['Blaasontsteking', 'Allergische reacties', 'Bijensteken', 'Urticaria', 'Keelontsteking', 'Gewrichtszwelling'],
  },
  {
    abbr: 'arn',
    causa: ['Trauma/verwonding', 'Overbelasting', 'Schok', 'Val/stoot'],
    pijnSensatie: ['Gekneusd gevoel', 'Lamheid', 'Pijnlijk bij aanraking'],
    opvallendheden: ['Zegt dat er niets aan de hand is', 'Wil niet aangeraakt worden', 'Bed voelt te hard', 'Blauwe plekken'],
    modaliteiten: {
      erger: ['Aanraking', 'Beweging', 'Rust (stijf)', 'Vochtig weer'],
      beter: ['Liggen (hoofd laag)', 'Uitgestrekt liggen'],
    },
    sleutelSx: ['Gekneusd gevoel overal', 'Stuurt dokter weg ("niets aan de hand")', 'Bed voelt te hard', 'Blauwe plekken na trauma'],
    veelGebruiktBij: ['Kneuzingen', 'Na operatie', 'Bloedingen', 'Spierpijn', 'Overbelasting', 'Schokverwerking', 'Botbreuken (eerste hulp)'],
  },
  {
    abbr: 'ars',
    causa: ['Voedselvergiftiging', 'Bedorven voedsel/water', 'Koude dranken/ijsjes', 'Angst/ongerustheid'],
    pijnSensatie: ['Brandend (maar beter van warmte)', 'Stekend'],
    opvallendheden: ['Extreme onrust (fysiek + mentaal)', 'Angst voor de dood', 'Dorst kleine slokjes', 'Smetvrees, ordelijk', 'Uitputting bij onrust'],
    modaliteiten: {
      erger: ['Na middernacht (1-3 uur)', 'Koude', 'Koude dranken/ijs', 'Alleen zijn'],
      beter: ['Warmte', 'Warme dranken', 'Gezelschap', 'Hoofd hoog'],
    },
    sleutelSx: ['Brandende pijn beter door warmte', 'Onrust + uitputting + angst', 'Dorst kleine slokjes', 'Verergering na middernacht'],
    veelGebruiktBij: ['Voedselvergiftiging', 'Gastro-enteritis', 'Diarree', 'Griep', 'Hooikoorts', 'Angststoornis'],
  },
  {
    abbr: 'bell',
    causa: ['Afkoeling hoofd', 'Zon/hitte', 'Nat haar/hoofd', 'Tandjes krijgen'],
    pijnSensatie: ['Kloppend/bonzend', 'Schietend', 'Komt en gaat plotseling'],
    opvallendheden: ['Rood, heet, gezwollen', 'Wijde pupillen', 'Delirium bij koorts', 'Hoge koorts met zweten', 'Overgevoelig voor licht/geluid/aanraking'],
    modaliteiten: {
      erger: ['Aanraking', 'Schokken/bewegen', 'Licht', 'Geluid', 'Namiddag (15u)', 'Kou (tocht)'],
      beter: ['Halfzittend', 'Rust in donkere kamer', 'Warmte (lokaal)', 'Bedekt zijn'],
    },
    sleutelSx: ['Plotseling begin, heftige klachten', 'Rood-heet-gezwollen', 'Kloppende pijn', 'Gevoelig voor licht+geluid+aanraking'],
    veelGebruiktBij: ['Keelontsteking', 'Oorontsteking', 'Koorts (hoog)', 'Hoofdpijn', 'Zonnesteek', 'Tandjes krijgen'],
  },
  {
    abbr: 'bry',
    causa: ['Afkoeling bij warm weer', 'Boosheid/irritatie', 'Onderdrukking van uitslag', 'Financiële zorgen'],
    pijnSensatie: ['Stekend', 'Scheurend', 'Erger bij minste beweging'],
    opvallendheden: ['Wil absoluut stil liggen', 'Geïrriteerd, wil met rust gelaten worden', 'Droge slijmvliezen', 'Grote dorst (grote slokken, koud water)', 'Praat over zaken/werk bij koorts'],
    modaliteiten: {
      erger: ['Elke beweging', 'Aanraking', 'Warmte', 'Eten', 'Ochtend (9u)'],
      beter: ['Absolute rust', 'Druk (op pijnlijke plek liggen)', 'Koele kamer', 'Koude dranken'],
    },
    sleutelSx: ['Elke beweging verergert', 'Beter van stevige druk/erop liggen', 'Droog + dorstig', 'Prikkelbaar, wil met rust gelaten worden'],
    veelGebruiktBij: ['Griep', 'Hoofdpijn', 'Hoest (droog, pijnlijk)', 'Obstipatie', 'Gewrichtsklachten', 'Mastitis'],
  },
  {
    abbr: 'calc',
    causa: ['Overbelasting (mentaal/fysiek)', 'Koud-nat weer', 'Angst'],
    pijnSensatie: ['Krampend', 'Snijdend'],
    opvallendheden: ['Kouwelijk maar zweet makkelijk (vooral hoofd)', 'Traag metabolisme', 'Angst voor ziekte/dood', 'Verlangt naar eieren', 'Zure afscheidingen/zweet'],
    modaliteiten: {
      erger: ['Koude (nat)', 'Inspanning (mentaal/fysiek)', 'Volle maan', 'Melk'],
      beter: ['Droog weer', 'Warmte', 'Liggen op pijnlijke kant', 'Constipatie (voelt beter)'],
    },
    sleutelSx: ['Kouwelijk + transpireert makkelijk', 'Zure afscheidingen', 'Langzaam, traag, phlegmatisch', 'Verlangen naar eieren'],
    veelGebruiktBij: ['Recidiverende verkoudheden', 'Oorontsteking (chronisch)', 'Tandjes krijgen', 'Angst', 'Rugpijn'],
  },
  {
    abbr: 'calen',
    causa: ['Wonden (open, gescheurd)', 'Chirurgie', 'Snijwonden'],
    pijnSensatie: ['Rauwe, schrijnende pijn', 'Buitenproportioneel pijnlijk'],
    opvallendheden: ['Bevordert wondgenezing', 'Voorkomt infectie', 'Anti-septisch', 'Vooral open wonden'],
    modaliteiten: {
      erger: ['Vochtig weer', 'Avond', 'Aanraking'],
      beter: ['Warmte', 'Stilliggen', 'Lopen'],
    },
    sleutelSx: ['Open wonden die slecht genezen', 'Buitensporig pijnlijke wonden', 'Infectiepreventie na chirurgie'],
    veelGebruiktBij: ['Wondverzorging', 'Na operatie', 'Snijwonden', 'Scheuren', 'Tandextractie'],
  },
  {
    abbr: 'canth',
    causa: ['Infectie (urinewegen)', 'Brandwonden', 'Insectenbeten'],
    pijnSensatie: ['Hevig brandend', 'Snijdend', 'Onverdraaglijk'],
    opvallendheden: ['Constante aandrang om te plassen', 'Druppelsgewijs plassen met brandende pijn', 'Onrust door pijn', 'Dorstig maar afkeer van water'],
    modaliteiten: {
      erger: ['Plassen', 'Drinken (zelfs water zien)', 'Aanraking', 'Koffie'],
      beter: ['Warmte', 'Wrijven', 'Rust'],
    },
    sleutelSx: ['Brandende blaaspijn met constante aandrang', 'Druppelsgewijs plassen', 'Afkeer van water bij dorst', 'Onverdraaglijke brandende pijn'],
    veelGebruiktBij: ['Blaasontsteking (acuut)', 'Brandwonden', 'Blaren', 'Nierkoliek'],
  },
  {
    abbr: 'cham',
    causa: ['Woede/driftbui', 'Tandjes krijgen', 'Koffie', 'Koude wind'],
    pijnSensatie: ['Onverdraaglijk (buiten proportie)', 'Verdovend'],
    opvallendheden: ['Extreem prikkelbaar en ongeduldig', 'Kind wil gedragen worden', 'Eén wang rood, één bleek', 'Groene diarree', 'Overgevoelig voor pijn'],
    modaliteiten: {
      erger: ['Woede', 'Warmte', 'Nacht (21u)', 'Wind', 'Koffie'],
      beter: ['Gedragen worden', 'Rijden in auto', 'Warm weer'],
    },
    sleutelSx: ['Onverdraaglijke pijn → woede', 'Kind: wil gedragen worden, wil alles, gooit het weg', 'Eén wang rood + één bleek', 'Groene diarree'],
    veelGebruiktBij: ['Tandjes krijgen', 'Oorontsteking (kind)', 'Koliek (baby)', 'Diarree (tandenkinderen)', 'Menstruatiepijn'],
  },
  {
    abbr: 'chin',
    causa: ['Vochtverlies (bloed, diarree, zweet)', 'Malaria', 'Uitputting'],
    pijnSensatie: ['Barstend', 'Kloppend'],
    opvallendheden: ['Zwakte na vochtverlies', 'Periodieke klachten', 'Opgeblazen buik (flatulentie helpt niet)', 'Overgevoelig voor aanraking', 'Bleek gezicht'],
    modaliteiten: {
      erger: ['Aanraking (licht)', 'Tocht', 'Om de dag', 'Vochtverlies', 'Fruit'],
      beter: ['Stevige druk', 'Warmte', 'Buigen (dubbelvouwen)'],
    },
    sleutelSx: ['Zwakte na vochtverlies', 'Periodieke klachten', 'Lichte aanraking verergert, stevige druk verbetert', 'Opgezette buik niet verlicht door winden laten'],
    veelGebruiktBij: ['Bloedingen', 'Diarree (uitputtend)', 'Koorts (intermitterend)', 'Bloedarmoede', 'Na operatie (vochtverlies)'],
  },
  {
    abbr: 'coloc',
    causa: ['Woede/verontwaardiging', 'Boosheid met ingehouden emotie', 'Kou (afkoeling)'],
    pijnSensatie: ['Hevig krampend/snijdend', 'Samenbindend', 'Golvend (komt en gaat)'],
    opvallendheden: ['Dubbelvouwen van de pijn', 'Onrust door pijn', 'Woede als trigger'],
    modaliteiten: {
      erger: ['Eten/drinken', 'Woede', 'Liggen op pijnloze kant'],
      beter: ['Dubbelbuigen', 'Stevige druk op buik', 'Warmte', 'Koffie'],
    },
    sleutelSx: ['Hevige buikkrampen → dubbelvouwen', 'Beter van stevige druk + warmte', 'Na woede/verontwaardiging', 'Golvende krampen'],
    veelGebruiktBij: ['Darmkrampen/koliek', 'Diarree (krampend)', 'Nierkoliek', 'Menstruatiekrampen', 'Ischias'],
  },
  {
    abbr: 'dros',
    causa: ['Verkoudheid', 'Kinkhoest', 'Na mazelen'],
    pijnSensatie: ['Kriebel diep in keel/borst', 'Beklemming'],
    opvallendheden: ['Hoest zo hevig → kokhalzen/braken', 'Blaffende hoest', 'Aanvallen van hoest snel na elkaar'],
    modaliteiten: {
      erger: ['Na middernacht', 'Liggen', 'Warmte', 'Praten/zingen', 'Drinken'],
      beter: ['Open lucht', 'Bewegen', 'Druk op borst'],
    },
    sleutelSx: ['Droge blaffende hoest met kokhalzen', 'Aanvalsgewijs, snel achter elkaar', 'Erger na middernacht en bij liggen', 'Zo hard hoesten dat je braakt'],
    veelGebruiktBij: ['Kinkhoest', 'Kriebelhoest', 'Croup', 'Astma (nachtelijk)'],
  },
  {
    abbr: 'dulc',
    causa: ['Koud-nat weer', 'Nat worden', 'Zitten op koude grond', 'Herfst/najaarsklachten'],
    pijnSensatie: ['Stijf', 'Pijnlijk', 'Schietend'],
    opvallendheden: ['Klachten beginnen altijd bij koud-nat weer', 'Dikke gele afscheiding', 'Huidklachten bij koude'],
    modaliteiten: {
      erger: ['Koud-nat weer', 'Nacht', 'Rust', 'Herfst/weerswisseling'],
      beter: ['Warmte', 'Droog weer', 'Beweging'],
    },
    sleutelSx: ['Alle klachten door koud-nat weer', 'Stijfheid bij natheid', 'Blaasklachten na verkoeling'],
    veelGebruiktBij: ['Blaasontsteking (na kou)', 'Verkoudheid', 'Reuma (bij nat weer)', 'Eczeem', 'Diarree (na verkilling)'],
  },
  {
    abbr: 'eup-per',
    causa: ['Griep', 'Malaria', 'Koude/vochtige omgeving'],
    pijnSensatie: ['Diep zeurend in botten', 'Alsof botten breken', 'Kneuzig gevoel'],
    opvallendheden: ['Intense botpijn', 'Rillerigheid', 'Dorst naar koude dranken', 'Braakt na drinken als het warm wordt in de maag'],
    modaliteiten: {
      erger: ['Periodiek (7-9u ochtend)', 'Koude lucht', 'Beweging', 'Liggen op pijnlijke deel'],
      beter: ['Zweten', 'Braken van gal', 'Gesprek (afleiding)'],
    },
    sleutelSx: ['Griep met intens zeurende botpijn', 'Alsof botten breken', 'Braakt gal/water zodra het warm wordt in maag', 'Koude rillingen langs de rug'],
    veelGebruiktBij: ['Griep (met botpijn)', 'Malaria-achtige koorts', 'Dengue-koorts'],
  },
  {
    abbr: 'ferr-p',
    causa: ['Begin verkoudheid/ontsteking', 'Geleidelijk begin (niet zo plotseling als Acon)'],
    pijnSensatie: ['Kloppend', 'Pijnlijk', 'Gecongesteerd gevoel'],
    opvallendheden: ['Eerste stadium ontsteking (vóór pus)', 'Matige koorts', 'Blozen, afwisselend bleek', 'Weinig duidelijke symptomen ("weet niet wat het is")'],
    modaliteiten: {
      erger: ['Nacht (4-6u)', 'Beweging', 'Aanraking', 'Rechter kant'],
      beter: ['Koude kompressen', 'Langzaam bewegen', 'Alleenzijn'],
    },
    sleutelSx: ['Begin ontsteking zonder duidelijk beeld', 'Afwisselend rood en bleek', 'Kloppende pijn', 'Neusbloedingen bij koorts'],
    veelGebruiktBij: ['Oorontsteking (begin)', 'Keelontsteking (begin)', 'Griep (eerste stadium)', 'Bloedneus', 'Bronchitis (begin)'],
  },
  {
    abbr: 'gels',
    causa: ['Opkomende griep', 'Anticipatie-angst', 'Schrik', 'Slecht nieuws', 'Warm-vochtig weer'],
    pijnSensatie: ['Loom, zwaar, dof', 'Band om hoofd gevoel', 'Trillerig'],
    opvallendheden: ['Extreme lamheid/loomheid', 'Zware oogleden (kan ogen niet openhouden)', 'Geen dorst', 'Trillen van zwakte', 'Afwezigheid van angst (gelaten)'],
    modaliteiten: {
      erger: ['Ochtend (10u)', 'Vochtig-warm weer', 'Emoties', 'Roken', 'Zon'],
      beter: ['Plassen (overvloedig)', 'Frisse lucht', 'Stimulantia', 'Zweten'],
    },
    sleutelSx: ['Griep met totale lamheid', 'Zware oogleden, slaperig', 'Geen dorst bij koorts', 'Trillerig en zwak', 'Verbetering na overvloedig plassen'],
    veelGebruiktBij: ['Griep', 'Plankenkoorts/examenvrees', 'Hoofdpijn', 'Verkoudheid (zomergriep)'],
  },
  {
    abbr: 'hep',
    causa: ['Koude (droge) wind', 'Mercurius-misbruik', 'Onderdrukking van afscheidingen'],
    pijnSensatie: ['Splintergevoel', 'Alsof er een visgraat in de keel zit', 'Stekend'],
    opvallendheden: ['Extreem kouwelijk', 'Extreem prikkelbaar', 'Dik geel pus', 'Overgevoelig voor pijn, kou, aanraking', 'Stinkende afscheidingen'],
    modaliteiten: {
      erger: ['Koude (lucht, tocht, ontbloten)', 'Aanraking', 'Nacht', 'Liggen op pijnlijke kant'],
      beter: ['Warmte (warm inwikkelen)', 'Vochtig-warm weer', 'Na eten'],
    },
    sleutelSx: ['Splintergevoel in keel', 'Extreem kouwelijk + prikkelbaar', 'Dik geel stinkend pus', 'Overgevoelig voor alles (pijn, kou, tocht)'],
    veelGebruiktBij: ['Keelontsteking (etterend)', 'Oorontsteking', 'Abces', 'Sinusitis', 'Croup', 'Huidinfecties'],
  },
  {
    abbr: 'hyper',
    causa: ['Zenuwletsel', 'Verwonding van zenuwrijk weefsel', 'Prikwonden', 'Na operatie (zenuwpijn)'],
    pijnSensatie: ['Schietend langs zenuwbanen', 'Stekend', 'Extreem pijnlijk (buiten proportie)'],
    opvallendheden: ['Pijn schiet naar boven langs zenuwbaan', 'Zenuwrijk gebied', 'Vingertoppen, tenen, stuitje, tanden'],
    modaliteiten: {
      erger: ['Aanraking', 'Koude', 'Vochtig weer', 'Schok/beweging'],
      beter: ['Stilliggen', 'Buigen achterover (rug)'],
    },
    sleutelSx: ['Schietende zenuwpijn na verwonding', 'Pijn langs zenuwbaan omhoog', 'Letsel aan zenuwrijk weefsel', '"Arnica van de zenuwen"'],
    veelGebruiktBij: ['Zenuwletsel', 'Na tandheelkunde', 'Stuitbeenletsel', 'Vingertopletsel', 'Na operatie (zenuwpijn)', 'Herpes zoster'],
  },
  {
    abbr: 'ign',
    causa: ['Verdriet/rouw', 'Teleurstelling', 'Liefdesverdriet', 'Gescheiden worden', 'Onderdrukte emoties'],
    pijnSensatie: ['Brok in keel', 'Samentrekkend', 'Paradoxale sensaties'],
    opvallendheden: ['Stille tranen, onderdrukt verdriet', 'Tegenstrijdige symptomen', 'Diepe zuchten', 'Brok in de keel', 'Hypersensitief'],
    modaliteiten: {
      erger: ['Emoties (verdriet)', 'Ochtend', 'Koffie', 'Roken', 'Koude open lucht'],
      beter: ['Afleiding', 'Alleen zijn', 'Diepe inademing', 'Eten (soms)'],
    },
    sleutelSx: ['Klachten na verdriet/teleurstelling', 'Brok in keel + zuchten', 'Tegenstrijdige symptomen', 'Stille rouw, onderdrukt huilen'],
    veelGebruiktBij: ['Rouw/verdriet', 'Spanningshoofdpijn', 'Slapeloosheid (door zorgen)', 'Brok in keel', 'Na scheiding/verlies'],
  },
  {
    abbr: 'ip',
    causa: ['Voedselvergiftiging', 'Overeten', 'Warmte/vochtigheid'],
    pijnSensatie: ['Constante misselijkheid', 'Verkrampend', 'Snijdend (buik)'],
    opvallendheden: ['Aanhoudende misselijkheid bij ALLE klachten', 'Schone tong ondanks misselijkheid', 'Braken verlicht niet', 'Helder rood bloed bij bloeding'],
    modaliteiten: {
      erger: ['Warmte', 'Vochtigheid', 'Overeten', 'Liggen'],
      beter: ['Open lucht', 'Rust', 'Druk op maag', 'Ogen sluiten'],
    },
    sleutelSx: ['Constante misselijkheid — braken helpt niet', 'Schone tong bij misselijkheid', 'Helder rood bloed', 'Misselijkheid bij elke klacht'],
    veelGebruiktBij: ['Misselijkheid/braken', 'Bloedingen (helder rood)', 'Hoest met misselijkheid', 'Ochtendziekte (zwangerschap)', 'Astma + misselijkheid'],
  },
  {
    abbr: 'kali-bi',
    causa: ['Koude', 'Bier drinken', 'Nat weer'],
    pijnSensatie: ['Kleine vlekjes pijn (wijst met één vinger)', 'Stekend', 'Borend'],
    opvallendheden: ['Taai, dradentrekkend slijm (geel-groen)', 'Pijn op kleine stippen', 'Afscheidingen: dik, taai, dradig', 'Ulceratie van slijmvliezen'],
    modaliteiten: {
      erger: ['Koude', 'Bier', 'Ochtend', 'Ontkleding', 'Zomer/warm-nat'],
      beter: ['Warmte', 'Druk', 'Bewegen'],
    },
    sleutelSx: ['Taai, dradentrekkend geel-groen slijm', 'Pijn op kleine vlekken (1 vinger)', 'Afwisselend klachten (reuma ↔ spijsvertering)', 'Neusseptum ulceratie'],
    veelGebruiktBij: ['Sinusitis', 'Bronchitis', 'Verkoudheid (dik slijm)', 'Oorontsteking', 'Maagklachten'],
  },
  {
    abbr: 'lach',
    causa: ['Onderdrukking van afscheiding', 'Klimacterium', 'Jaloezie', 'Zon/warmte'],
    pijnSensatie: ['Beklemmend', 'Samensnoerend', 'Kloppend'],
    opvallendheden: ['Linkerkant', 'Kan niets strak om nek/taille verdragen', 'Praatziek', 'Blauwe/purpere verkleuring', 'Verdraagt geen druk op keel'],
    modaliteiten: {
      erger: ['Na slapen', 'Links', 'Warmte/zon', 'Aanraking (keel/buik)', 'Onderdrukking afscheiding'],
      beter: ['Afscheiding/menstruatie', 'Open lucht', 'Koude dranken', 'Eten'],
    },
    sleutelSx: ['Verergering na slapen', 'Linkerkant', 'Niets strak om keel/taille', 'Paars-blauw verkleuring', 'Praatgraag'],
    veelGebruiktBij: ['Keelontsteking (links)', 'Overgang', 'Bloedingen (donker)', 'Hoofdpijn (links)', 'Hoge bloeddruk'],
  },
  {
    abbr: 'led',
    causa: ['Punctiewonden', 'Insectenbeten', 'Stootwonden', 'Gewrichtsverzwikking'],
    pijnSensatie: ['Koud gevoel in gewricht', 'Stekend', 'Pijnlijk bij beweging'],
    opvallendheden: ['Wond voelt koud aan', 'Koud maar wil geen warmte', 'Blauwe plek die niet geneest', 'Zwelling koud en bleek'],
    modaliteiten: {
      erger: ['Warmte', 'Nacht', 'Beweging', 'Bedwarmte'],
      beter: ['Koude kompressen/ijswater', 'Rust'],
    },
    sleutelSx: ['Koude wond/gewricht beter van koude', 'Punctiewonden (nagel, naald)', 'Blauwe plekken die lang blijven', '"Arnica van de gewrichten"'],
    veelGebruiktBij: ['Insectenbeten', 'Verstuiking', 'Zwart oog', 'Punctiewonden', 'Jicht', 'Na Arnica (vervolg)'],
  },
  {
    abbr: 'lyc',
    causa: ['Anticipatie-angst', 'Overwerk', 'Onregelmatig eten'],
    pijnSensatie: ['Opgeblazen gevoel', 'Zeurend', 'Barstend'],
    opvallendheden: ['Rechterkant (of rechts → links)', 'Opgeblazen buik na weinig eten', 'Verlangt naar zoet', '16-20 uur verergering', 'Onzeker maar dictatoriaal thuis'],
    modaliteiten: {
      erger: ['16-20 uur', 'Rechts', 'Warme kamer', 'Wind op hoofd', 'Strak kleding'],
      beter: ['Warme dranken', 'Bewegen', 'Na middernacht', 'Open lucht'],
    },
    sleutelSx: ['Rechterkant', 'Verergering 16-20u', 'Opgeblazen na weinig eten', 'Verlangt naar zoet en warm drinken'],
    veelGebruiktBij: ['Keelontsteking (rechts)', 'Maag-/darmklachten', 'Nierstenen (rechts)', 'Leverklachten', 'Blaasontsteking'],
  },
  {
    abbr: 'mag-p',
    causa: ['Koude', 'Staan in koud water', 'Emotionele opwinding'],
    pijnSensatie: ['Hevig krampend', 'Schietend', 'Bliksemend', 'Neuralgisch'],
    opvallendheden: ['Krampen beter van warmte + druk', 'Rechterkant', 'Koliekpijnen', 'Plotseling begin en einde van krampen'],
    modaliteiten: {
      erger: ['Koude', 'Nacht', 'Rechts', 'Aanraking'],
      beter: ['Warmte (kruik, bad)', 'Druk/buigen', 'Wrijven'],
    },
    sleutelSx: ['Hevige krampen beter van warmte + druk + dubbelbuigen', 'Rechterkant', 'Schietende neuralgische pijn', '"Warme Colocynthis"'],
    veelGebruiktBij: ['Menstruatiekrampen', 'Koliek (baby)', 'Kiespijn', 'Spierkrampen', 'Schrijfkramp', 'Buikpijn'],
  },
  {
    abbr: 'merc',
    causa: ['Weerswisseling', 'Nacht', 'Kou en warmte beiden slecht'],
    pijnSensatie: ['Brandend', 'Stekend', 'Rauw', 'Knagend/borend (bot)'],
    opvallendheden: ['Stinkende adem/zweet/ontlasting', 'Overmatig speeksel', 'Metalige smaak', 'Tandafdrukken op tong', 'Geel-groene afscheidingen', 'Trillen'],
    modaliteiten: {
      erger: ['Nacht', 'Zweten (verergert)', 'Warmte EN koude', 'Liggend op rechter kant'],
      beter: ['Gematigde temperatuur', 'Rust'],
    },
    sleutelSx: ['Stinkende afscheidingen (alle openingen)', 'Speekselvloed', 'Nachtelijke verergering', 'Tandafdrukken op tong', 'Noch warmte noch koude verdragen'],
    veelGebruiktBij: ['Keelontsteking', 'Oorontsteking', 'Tandvleesontsteking', 'Diarree (slijmerig)', 'Abcessen', 'Griep'],
  },
  {
    abbr: 'nat-m',
    causa: ['Verdriet (onderdrukt)', 'Teleurstelling in liefde', 'Rouw (langdurig)', 'Zon/hitte'],
    pijnSensatie: ['Kloppend', 'Barstend (hoofdpijn)', 'Tintelend'],
    opvallendheden: ['Wil niet getroost worden', 'Huilt alleen als alleen', 'Verlangt naar zout', 'Droge gebarsten lippen', 'Migraine', 'Recidiverende herpes labialis'],
    modaliteiten: {
      erger: ['Zon/hitte', '10-11 uur', 'Troost', 'Aan zee (soms beter)', 'Inspanning'],
      beter: ['Open lucht', 'Alleen zijn', 'Koud baden', 'Overslaan maaltijd'],
    },
    sleutelSx: ['Onderdrukt verdriet, wil niet getroost worden', 'Verlangen naar zout', 'Verergering door zon', 'Droge gebarsten lippen/mondhoeken'],
    veelGebruiktBij: ['Migraine', 'Hooikoorts', 'Herpes labialis', 'Depressie/rouw', 'Eczeem', 'Rugpijn'],
  },
  {
    abbr: 'nux-v',
    causa: ['Overmatig (eten, drinken, medicijnen)', 'Stress/overwerk', 'Koude', 'Koffie/alcohol', 'Woede'],
    pijnSensatie: ['Krampend', 'Persend', 'Zeurend'],
    opvallendheden: ['Prikkelbaar, ongeduldig, competitief', 'Ochtendmisselijkheid', 'Verstopping met loze aandrang', 'Kouwelijk', 'Overgevoelig voor prikkels (geluid, licht, geur)'],
    modaliteiten: {
      erger: ['Ochtend', 'Koude/tocht', 'Na eten', 'Mentale inspanning', 'Stimulantia', 'Woede'],
      beter: ['Avond', 'Rust', 'Warmte', 'Slapen (als lukt)', 'Stevige druk'],
    },
    sleutelSx: ['Kater-achtig gevoel', 'Loze aandrang (ontlasting/plassen)', 'Ochtendverergering', 'Prikkelbaar type A persoonlijkheid'],
    veelGebruiktBij: ['Maagklachten/indigestie', 'Kater', 'Obstipatie', 'Griep', 'Slapeloosheid (3u wakker)', 'Rugpijn'],
  },
  {
    abbr: 'phos',
    causa: ['Koude (ijsdranken)', 'Bliksem/onweer', 'Narcose', 'Voedselvergiftiging'],
    pijnSensatie: ['Brandend (maag, handpalmen)', 'Beklemming borst'],
    opvallendheden: ['Verlangt naar ijswater (braakt als het warm wordt in maag)', 'Angst voor onweer', 'Open, sympathiek, wil gezelschap', 'Bloedingsneiging (helder rood)', 'Dorstig op koud water'],
    modaliteiten: {
      erger: ['Avond/schemering', 'Liggen op linker kant', 'Onweer', 'Koude lucht', 'Alleen zijn'],
      beter: ['Koude dranken (tijdelijk)', 'Slaap', 'Eten', 'Wrijven', 'Gezelschap'],
    },
    sleutelSx: ['Verlangt ijswater maar braakt als het warm wordt', 'Angst voor onweer', 'Open, sympathieke persoonlijkheid', 'Neiging tot bloedingen'],
    veelGebruiktBij: ['Bloedingen (neusbloeding, maag)', 'Hoest (borst)', 'Keelpijn (stemverlies)', 'Pneumonie', 'Na narcose'],
  },
  {
    abbr: 'phyt',
    causa: ['Koude', 'Nat weer', 'Borstvoeding'],
    pijnSensatie: ['Stijf, pijnlijk', 'Schietend naar oor bij slikken', 'Alsof keel een bal is'],
    opvallendheden: ['Donkerrode keel', 'Pijn schiet naar oren bij slikken', 'Klierenzwelling', 'Borsten hard en pijnlijk'],
    modaliteiten: {
      erger: ['Koude/nat weer', 'Nacht', 'Slikken', 'Warme dranken'],
      beter: ['Warmte (lichaam)', 'Droog weer', 'Rust'],
    },
    sleutelSx: ['Donkerrode gezwollen keel', 'Pijn naar oren bij slikken', 'Borsten: hard, stuwing, mastitis', 'Klierzwellingen hals'],
    veelGebruiktBij: ['Keelontsteking', 'Mastitis', 'Klierzwellingen', 'Tonsillitis'],
  },
  {
    abbr: 'puls',
    causa: ['Vet/rijk eten', 'Warm weer', 'Natte voeten', 'Puberteit', 'Hormonale veranderingen'],
    pijnSensatie: ['Wisselend van plaats', 'Trekkend', 'Scheurend'],
    opvallendheden: ['Huilerig, wil troost', 'Dorstloos', 'Afscheiding: dik, geel-groen, mild', 'Klachten veranderen steeds', 'Beter van open lucht', 'Zacht, meegaand karakter'],
    modaliteiten: {
      erger: ['Warmte (kamer, eten)', 'Avond', 'Vet eten', 'Rust', 'Eén kant (rechts of links)'],
      beter: ['Open lucht', 'Koele kamer', 'Langzaam bewegen', 'Troost/aandacht', 'Koude applicaties'],
    },
    sleutelSx: ['Wisselende klachten (locatie, aard)', 'Dorstloos bij koorts', 'Huilerig, wil troost', 'Beter van frisse lucht + bewegen'],
    veelGebruiktBij: ['Oorontsteking (kind)', 'Verkoudheid', 'Sinusitis', 'Blaasontsteking', 'Conjunctivitis', 'Menstruatieklachten'],
  },
  {
    abbr: 'rhus-t',
    causa: ['Overbelasting/verrekking', 'Koud-nat worden', 'Nat/koud weer', 'Tillen'],
    pijnSensatie: ['Stijf bij begin bewegen', 'Scheurend', 'Alsof pezen te kort zijn'],
    opvallendheden: ['Extreme onrust — moet blijven bewegen', 'Stijf bij begin, soepeler door bewegen', 'Blaasjes op de huid (herpes)', 'Driehoekig rode neusbrug'],
    modaliteiten: {
      erger: ['Begin beweging', 'Rust/stilzitten', 'Koud-nat weer', 'Nacht', 'Na middernacht'],
      beter: ['Voortdurend bewegen', 'Warmte (bad, kruik)', 'Uitrekken/strekken', 'Droog weer'],
    },
    sleutelSx: ['Roestige deur: stijf bij begin, beter door bewegen', 'Onrust — kan niet stilzitten', 'Koud-nat verergert alles', 'Stijfheid + onrust + warmte verlicht'],
    veelGebruiktBij: ['Rugpijn/lumbago', 'Verrekkingen', 'Griep (onrust)', 'Gordelroos', 'Gewrichtspijn', 'Eczeem (blaasjes)'],
  },
  {
    abbr: 'ruta',
    causa: ['Overbelasting pezen/banden', 'Oogvermoeidheid', 'Val op knie/elleboog', 'Botkneuzing'],
    pijnSensatie: ['Gekneusd gevoel (botten/pezen)', 'Zeurend', 'Stijf', 'Lam gevoel'],
    opvallendheden: ['Pezen/ligamenten/periost', 'Ogen vermoeid door lezen/fijn werk', 'Knikkende knieën'],
    modaliteiten: {
      erger: ['Liggen', 'Koude', 'Vochtig weer', 'Inspanning ogen'],
      beter: ['Warmte', 'Bewegen', 'Wrijven'],
    },
    sleutelSx: ['Pees/bandletsel (niet spier)', 'Botkneuzing', 'Oogvermoeidheid door fijn werk', '"Arnica van pezen en periost"'],
    veelGebruiktBij: ['Peesletsel', 'Tennisarm', 'Oogvermoeidheid', 'Knieletsel', 'Botkneuzing', 'Na Arnica (vervolg)'],
  },
  {
    abbr: 'sep',
    causa: ['Hormonale veranderingen', 'Overwerk (fysiek)', 'Zwangerschap/postpartum', 'De pil'],
    pijnSensatie: ['Uitzakkend/drukkend naar beneden', 'Trekkend'],
    opvallendheden: ['Indifferent tegenover geliefden', 'Uitgeput en prikkelbaar', 'Gele vlekken in gezicht', 'Verlangt naar azijn/zuur', 'Beter van stevige inspanning (dansen)'],
    modaliteiten: {
      erger: ['Ochtend', 'Koude', 'Staan', 'Zwangerschap/menstruatie', 'Troost'],
      beter: ['Stevige lichaamsbeweging', 'Warmte', 'Slapen', 'Kruisen van benen'],
    },
    sleutelSx: ['Uitzakkend gevoel', 'Indifferent tegenover gezin', 'Beter door stevige inspanning', 'Geel-bruin zadelvormig vlekken gezicht'],
    veelGebruiktBij: ['Menstruatieklachten', 'Overgangsklachten', 'Obstipatie', 'Vermoeidheid (vrouwen)', 'Huidklachten'],
  },
  {
    abbr: 'sil',
    causa: ['Vaccinatie', 'Onderdrukking van zweet', 'Koude', 'Voetenzweet onderdrukt'],
    pijnSensatie: ['Stekend', 'Splintergevoel', 'Kloppend (abces)'],
    opvallendheden: ['Stinkend voetenzweet', 'Splinters/vreemde voorwerpen komen eruit', 'Traag genezend', 'Kouwelijk, tenger, verlegen', 'Hoofdzweet (nacht)'],
    modaliteiten: {
      erger: ['Koude', 'Tocht', 'Volle maan', 'Ochtend', 'Ontbloten'],
      beter: ['Warmte (warm inwikkelen)', 'Zomer', 'Nat-warm weer'],
    },
    sleutelSx: ['Traag genezende wonden', 'Splinters/vreemd voorwerp eruit duwen', 'Stinkend voetenzweet', 'Kouwelijk, verlegen kind dat vastklampt'],
    veelGebruiktBij: ['Abcessen (rijpend)', 'Sinusitis (chronisch)', 'Nagelinfecties', 'Splinters', 'Na vaccinatie', 'Bot-necrose'],
  },
  {
    abbr: 'spong',
    causa: ['Koude droge wind', 'Opwinding/angst', 'Schildklierklachten'],
    pijnSensatie: ['Droog gevoel in keel/luchtwegen', 'Branderig', 'Zaaggevoel'],
    opvallendheden: ['Droge blaffende/zagende hoest', 'Alsof je door een spons ademt', 'Angst bij ademhalingsklachten', 'Schildklierzwelling'],
    modaliteiten: {
      erger: ['Koude droge wind', 'Praten/zingen', 'Middernacht', 'Liggen (hoofd laag)'],
      beter: ['Warm eten/drinken', 'Zitten voorovergebogen', 'Buigen hoofd naar voren'],
    },
    sleutelSx: ['Droge zagende hoest als een zaag door hout', 'Ademen alsof door een spons', 'Erger voor middernacht', 'Schildklierzwelling'],
    veelGebruiktBij: ['Croup', 'Laryngitis', 'Pseudo-croup', 'Schildklierklachten', 'Hoest (droog, blaffend)'],
  },
  {
    abbr: 'staph',
    causa: ['Onderdrukte woede/verontwaardiging', 'Vernederd worden', 'Na chirurgie (snijwonden)', 'Seksueel misbruik'],
    pijnSensatie: ['Snijdend (alsof met mes)', 'Stekend', 'Brandend'],
    opvallendheden: ['Ingehouden woede', 'Trillen van woede', '"Ik slik het maar in"', 'Buikpijn na boosheid', 'Gevoelig voor snijwonden/chirurgie'],
    modaliteiten: {
      erger: ['Woede/vernedering', 'Aanraking', 'Emoties', 'Middagslaap'],
      beter: ['Warmte', 'Na ontbijt', 'Rust'],
    },
    sleutelSx: ['Klachten na ingehouden woede/vernedering', 'Snijwonden genezen slecht', 'Blaasproblemen na emoties', 'Buikpijn na ingeslikte woede'],
    veelGebruiktBij: ['Na operatie (wondgenezing)', 'Blaasontsteking (huwelijksreis)', 'Gerstekorrels', 'Tanden (cariës)', 'Huidklachten (na emotie)'],
  },
  {
    abbr: 'sulph',
    causa: ['Onderdrukking van uitslag/afscheiding', 'Was-allergie', 'Warmte'],
    pijnSensatie: ['Brandend', 'Jeukend', 'Stekend'],
    opvallendheden: ['Brandend: voetzolen, kruin, anus, huid', 'Steekt voeten buiten bed', 'Filosofisch/rommelig type', 'Honger om 11u', 'Afkeer van wassen/baden', 'Stinkende afscheidingen'],
    modaliteiten: {
      erger: ['Warmte (bed, bad)', 'Staan', '11 uur', 'Wassen', 'Melk', 'Alcohol'],
      beter: ['Open lucht', 'Droog warm weer', 'Liggen op rechter kant', 'Bewegen'],
    },
    sleutelSx: ['Brandend overal (voetzolen, kruin, anus)', 'Voeten buiten bed van warmte', 'Honger om 11 uur', 'Onderdrukking van uitslag → andere klachten'],
    veelGebruiktBij: ['Huidklachten (eczeem, psoriasis)', 'Diarree (5u ochtend)', 'Hoest (chronisch)', 'Koorts (terugkerend)', 'Als startmiddel bij onduidelijk beeld'],
  },
  {
    abbr: 'symph',
    causa: ['Botbreuk', 'Botkneuzing', 'Oogletsel (stomp)'],
    pijnSensatie: ['Prikkend op breukplaats', 'Stekend', 'Zeurend in bot'],
    opvallendheden: ['Bevordert botgroei/callusvorming', '"Knitbone"', 'Specifiek voor botletsel', 'Na Arnica in acute fase'],
    modaliteiten: {
      erger: ['Beweging', 'Aanraking', 'Druk op breukplaats'],
      beter: ['Rust', 'Warmte'],
    },
    sleutelSx: ['Bevordert botgenezing bij fracturen', 'Prikkende pijn op breukplaats', 'Na Arnica als vervolg', 'Stomp oogletsel'],
    veelGebruiktBij: ['Botbreuken (genezing bevorderen)', 'Botkneuzing', 'Stomp oogletsel', 'Niet-genezende fracturen'],
  },
  {
    abbr: 'verat',
    causa: ['Voedselvergiftiging', 'Angst/schrik', 'Koud drinken', 'Na operatie', 'Uitputting'],
    pijnSensatie: ['IJskoude pijn', 'Snijdend/krampend (buik)', 'Koude sensatie'],
    opvallendheden: ['IJskoud zweet op voorhoofd', 'Kollapsneiging', 'Gelijktijdig braken + diarree', 'Dorst op koud water (braakt het meteen uit)', 'Blauw/koud/uitgeput'],
    modaliteiten: {
      erger: ['Drinken (koud water)', 'Bewegen', 'Nacht', 'Fruit', 'Nat-koud weer'],
      beter: ['Warmte', 'Warm afdekken', 'Warme dranken', 'Liggen'],
    },
    sleutelSx: ['Kollapstoestand: koud zweet + ijskoud + uitputting', 'Gelijktijdig braken en diarree', 'IJskoud zweet op voorhoofd', 'Dorst maar braakt alles uit'],
    veelGebruiktBij: ['Voedselvergiftiging (hevig)', 'Cholera-achtige diarree', 'Kollaps', 'Gastro-enteritis', 'Flauwvallen'],
  },
];

// Index voor O(1) lookup
const profileIndex = new Map<string, RemedyProfile>();
for (const p of remedyProfiles) {
  profileIndex.set(p.abbr.toLowerCase(), p);
}

export function lookupRemedyProfile(abbr: string): RemedyProfile | undefined {
  return profileIndex.get(abbr.toLowerCase().trim());
}

/** Alle beschikbare profielen (voor UI hints) */
export function getAvailableProfileAbbrs(): string[] {
  return remedyProfiles.map(p => p.abbr);
}
