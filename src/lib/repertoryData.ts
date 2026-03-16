// Repertorium data - standaard hoofdstukken en veelgebruikte subrubrieken

export interface SubRubric {
  name: string;
  fullPath: string;
  children?: SubRubric[];
}

export interface RepertoryChapter {
  name: string;
  nameDutch: string;
  icon: string;
  subRubrics: SubRubric[];
}

export const repertoryChapters: RepertoryChapter[] = [
  {
    name: 'Mind',
    nameDutch: 'Gemoed',
    icon: '🧠',
    subRubrics: [
      { name: 'Anxiety', fullPath: 'Mind - Anxiety', children: [
        { name: 'about health', fullPath: 'Mind - Anxiety - health, about' },
        { name: 'about future', fullPath: 'Mind - Anxiety - future, about' },
        { name: 'night', fullPath: 'Mind - Anxiety - night' },
      ]},
      { name: 'Fear', fullPath: 'Mind - Fear', children: [
        { name: 'of death', fullPath: 'Mind - Fear - death, of' },
        { name: 'of disease', fullPath: 'Mind - Fear - disease, of' },
        { name: 'of being alone', fullPath: 'Mind - Fear - alone, of being' },
      ]},
      { name: 'Irritability', fullPath: 'Mind - Irritability' },
      { name: 'Restlessness', fullPath: 'Mind - Restlessness' },
      { name: 'Weeping', fullPath: 'Mind - Weeping' },
      { name: 'Ailments from - anger', fullPath: 'Mind - Ailments from - anger' },
      { name: 'Ailments from - grief', fullPath: 'Mind - Ailments from - grief' },
      { name: 'Ailments from - fright', fullPath: 'Mind - Ailments from - fright' },
      { name: 'Confusion', fullPath: 'Mind - Confusion of mind' },
      { name: 'Delirium', fullPath: 'Mind - Delirium' },
      { name: 'Sadness', fullPath: 'Mind - Sadness' },
      { name: 'Concentration difficult', fullPath: 'Mind - Concentration - difficult' },
      { name: 'Indifference', fullPath: 'Mind - Indifference' },
      { name: 'Moaning', fullPath: 'Mind - Moaning' },
      { name: 'Sensitive', fullPath: 'Mind - Sensitive' },
      { name: 'Desires company', fullPath: 'Mind - Company - desire for' },
      { name: 'Aversion to company', fullPath: 'Mind - Company - aversion to' },
      { name: 'Prostration of mind', fullPath: 'Mind - Prostration of mind' },
    ],
  },
  {
    name: 'Vertigo',
    nameDutch: 'Duizeligheid',
    icon: '💫',
    subRubrics: [
      { name: 'General', fullPath: 'Vertigo' },
      { name: 'With nausea', fullPath: 'Vertigo - nausea, with' },
      { name: 'On rising', fullPath: 'Vertigo - rising, on' },
      { name: 'On looking up', fullPath: 'Vertigo - looking - upward' },
      { name: 'On motion', fullPath: 'Vertigo - motion, on' },
      { name: 'Turning in bed', fullPath: 'Vertigo - turning - in bed' },
      { name: 'On stooping', fullPath: 'Vertigo - stooping, on' },
      { name: 'With tendency to fall', fullPath: 'Vertigo - tendency to fall' },
    ],
  },
  {
    name: 'Head',
    nameDutch: 'Hoofd',
    icon: '🗣️',
    subRubrics: [
      { name: 'Pain', fullPath: 'Head - Pain', children: [
        { name: 'pressing', fullPath: 'Head - Pain - pressing' },
        { name: 'throbbing', fullPath: 'Head - Pain - throbbing' },
        { name: 'bursting', fullPath: 'Head - Pain - bursting' },
        { name: 'stitching', fullPath: 'Head - Pain - stitching' },
        { name: 'forehead', fullPath: 'Head - Pain - forehead' },
        { name: 'temples', fullPath: 'Head - Pain - temples' },
        { name: 'occiput', fullPath: 'Head - Pain - occiput' },
        { name: 'sides', fullPath: 'Head - Pain - sides' },
      ]},
      { name: 'Heaviness', fullPath: 'Head - Heaviness' },
      { name: 'Fullness', fullPath: 'Head - Fullness' },
      { name: 'Congestion', fullPath: 'Head - Congestion' },
      { name: 'Heat', fullPath: 'Head - Heat' },
      { name: 'Coldness', fullPath: 'Head - Coldness' },
      { name: 'Perspiration', fullPath: 'Head - Perspiration' },
      { name: 'Pulsating', fullPath: 'Head - Pulsating' },
      { name: 'Sensitiveness of brain', fullPath: 'Head - Sensitiveness of brain' },
      { name: 'Motions in', fullPath: 'Head - Motions in' },
      { name: 'Hair - falling', fullPath: 'Head - Hair - falling' },
      { name: 'Eruptions', fullPath: 'Head - Eruptions' },
    ],
  },
  {
    name: 'Eye',
    nameDutch: 'Oog',
    icon: '👁️',
    subRubrics: [
      { name: 'Pain', fullPath: 'Eye - Pain', children: [
        { name: 'burning', fullPath: 'Eye - Pain - burning' },
        { name: 'pressing', fullPath: 'Eye - Pain - pressing' },
        { name: 'stitching', fullPath: 'Eye - Pain - stitching' },
      ]},
      { name: 'Photophobia', fullPath: 'Eye - Photophobia' },
      { name: 'Discharge', fullPath: 'Eye - Discharge', children: [
        { name: 'watery', fullPath: 'Eye - Discharge - watery' },
        { name: 'purulent', fullPath: 'Eye - Discharge - purulent' },
      ]},
      { name: 'Discolorations - red', fullPath: 'Eye - Discolorations - red', children: [
        { name: 'lids', fullPath: 'Eye - Discolorations - red - lids' },
      ]},
      { name: 'Inflammation', fullPath: 'Eye - Inflammation' },
      { name: 'Lachrymation', fullPath: 'Eye - Lachrymation' },
      { name: 'Heat in lids', fullPath: 'Eye - Heat in lids' },
      { name: 'Swelling - lids', fullPath: 'Eye - Swelling - lids' },
      { name: 'Itching', fullPath: 'Eye - Itching' },
      { name: 'Dryness', fullPath: 'Eye - Dryness' },
    ],
  },
  {
    name: 'Vision',
    nameDutch: 'Gezichtsvermogen',
    icon: '🔍',
    subRubrics: [
      { name: 'Blurred', fullPath: 'Vision - Blurred' },
      { name: 'Dim', fullPath: 'Vision - Dim' },
      { name: 'Double', fullPath: 'Vision - Double' },
      { name: 'Flickering', fullPath: 'Vision - Flickering' },
      { name: 'Sparks', fullPath: 'Vision - Sparks' },
      { name: 'Loss of', fullPath: 'Vision - Loss of' },
      { name: 'Colors before', fullPath: 'Vision - Colors before the eyes' },
    ],
  },
  {
    name: 'Ear',
    nameDutch: 'Oor',
    icon: '👂',
    subRubrics: [
      { name: 'Pain', fullPath: 'Ear - Pain', children: [
        { name: 'stitching', fullPath: 'Ear - Pain - stitching' },
        { name: 'tearing', fullPath: 'Ear - Pain - tearing' },
      ]},
      { name: 'Discharge', fullPath: 'Ear - Discharge' },
      { name: 'Noises', fullPath: 'Ear - Noises', children: [
        { name: 'ringing', fullPath: 'Ear - Noises - ringing' },
        { name: 'buzzing', fullPath: 'Ear - Noises - buzzing' },
        { name: 'roaring', fullPath: 'Ear - Noises - roaring' },
      ]},
      { name: 'Itching', fullPath: 'Ear - Itching' },
      { name: 'Inflammation', fullPath: 'Ear - Inflammation' },
      { name: 'Stopped sensation', fullPath: 'Ear - Stopped sensation' },
    ],
  },
  {
    name: 'Hearing',
    nameDutch: 'Gehoor',
    icon: '🔊',
    subRubrics: [
      { name: 'Impaired', fullPath: 'Hearing - Impaired' },
      { name: 'Acute', fullPath: 'Hearing - Acute' },
      { name: 'Lost', fullPath: 'Hearing - Lost' },
    ],
  },
  {
    name: 'Nose',
    nameDutch: 'Neus',
    icon: '👃',
    subRubrics: [
      { name: 'Discharge', fullPath: 'Nose - Discharge', children: [
        { name: 'watery', fullPath: 'Nose - Discharge - watery' },
        { name: 'thick', fullPath: 'Nose - Discharge - thick' },
        { name: 'yellow', fullPath: 'Nose - Discharge - yellow' },
        { name: 'green', fullPath: 'Nose - Discharge - green' },
        { name: 'bloody', fullPath: 'Nose - Discharge - bloody' },
      ]},
      { name: 'Sneezing', fullPath: 'Nose - Sneezing', children: [
        { name: 'frequent', fullPath: 'Nose - Sneezing - frequent' },
        { name: 'violent', fullPath: 'Nose - Sneezing - violent' },
      ]},
      { name: 'Obstruction', fullPath: 'Nose - Obstruction' },
      { name: 'Coryza', fullPath: 'Nose - Coryza' },
      { name: 'Epistaxis', fullPath: 'Nose - Epistaxis' },
      { name: 'Dryness', fullPath: 'Nose - Dryness' },
      { name: 'Smell - acute', fullPath: 'Nose - Smell - acute' },
      { name: 'Smell - diminished', fullPath: 'Nose - Smell - diminished' },
    ],
  },
  {
    name: 'Face',
    nameDutch: 'Gezicht',
    icon: '😶',
    subRubrics: [
      { name: 'Pain', fullPath: 'Face - Pain', children: [
        { name: 'neuralgic', fullPath: 'Face - Pain - neuralgic' },
      ]},
      { name: 'Discoloration - red', fullPath: 'Face - Discoloration - red' },
      { name: 'Discoloration - pale', fullPath: 'Face - Discoloration - pale' },
      { name: 'Swelling', fullPath: 'Face - Swelling' },
      { name: 'Expression - suffering', fullPath: 'Face - Expression - suffering' },
      { name: 'Heat', fullPath: 'Face - Heat' },
      { name: 'Perspiration', fullPath: 'Face - Perspiration' },
      { name: 'Distorted', fullPath: 'Face - Distorted' },
      { name: 'Eruptions', fullPath: 'Face - Eruptions' },
    ],
  },
  {
    name: 'Mouth',
    nameDutch: 'Mond',
    icon: '👄',
    subRubrics: [
      { name: 'Dryness', fullPath: 'Mouth - Dryness' },
      { name: 'Taste - bitter', fullPath: 'Mouth - Taste - bitter' },
      { name: 'Taste - metallic', fullPath: 'Mouth - Taste - metallic' },
      { name: 'Taste - putrid', fullPath: 'Mouth - Taste - putrid' },
      { name: 'Salivation', fullPath: 'Mouth - Salivation' },
      { name: 'Aphthae', fullPath: 'Mouth - Aphthae' },
      { name: 'Pain', fullPath: 'Mouth - Pain' },
      { name: 'Tongue - coated', fullPath: 'Mouth - Tongue - coated', children: [
        { name: 'white', fullPath: 'Mouth - Tongue - coated - white' },
        { name: 'yellow', fullPath: 'Mouth - Tongue - coated - yellow' },
      ]},
      { name: 'Bleeding - gums', fullPath: 'Mouth - Bleeding - gums' },
    ],
  },
  {
    name: 'Teeth',
    nameDutch: 'Tanden',
    icon: '🦷',
    subRubrics: [
      { name: 'Pain', fullPath: 'Teeth - Pain', children: [
        { name: 'drawing', fullPath: 'Teeth - Pain - drawing' },
        { name: 'pulsating', fullPath: 'Teeth - Pain - pulsating' },
        { name: 'tearing', fullPath: 'Teeth - Pain - tearing' },
      ]},
      { name: 'Grinding', fullPath: 'Teeth - Grinding' },
      { name: 'Sensitive', fullPath: 'Teeth - Sensitive' },
      { name: 'Looseness', fullPath: 'Teeth - Looseness' },
    ],
  },
  {
    name: 'Throat',
    nameDutch: 'Keel',
    icon: '🫁',
    subRubrics: [
      { name: 'Pain', fullPath: 'Throat - Pain', children: [
        { name: 'burning', fullPath: 'Throat - Pain - burning' },
        { name: 'stitching', fullPath: 'Throat - Pain - stitching' },
        { name: 'on swallowing', fullPath: 'Throat - Pain - swallowing, on' },
      ]},
      { name: 'Dryness', fullPath: 'Throat - Dryness' },
      { name: 'Swallowing - difficult', fullPath: 'Throat - Swallowing - difficult' },
      { name: 'Swelling', fullPath: 'Throat - Swelling' },
      { name: 'Lump sensation', fullPath: 'Throat - Lump sensation' },
      { name: 'Inflammation', fullPath: 'Throat - Inflammation' },
      { name: 'Rawness', fullPath: 'Throat - Rawness' },
      { name: 'Mucus', fullPath: 'Throat - Mucus' },
    ],
  },
  {
    name: 'External Throat',
    nameDutch: 'Uitwendige keel',
    icon: '🔗',
    subRubrics: [
      { name: 'Swelling', fullPath: 'External Throat - Swelling' },
      { name: 'Stiffness', fullPath: 'External Throat - Stiffness' },
      { name: 'Pain', fullPath: 'External Throat - Pain' },
      { name: 'Swelling of glands', fullPath: 'External Throat - Swelling of glands' },
    ],
  },
  {
    name: 'Stomach',
    nameDutch: 'Maag',
    icon: '🫃',
    subRubrics: [
      { name: 'Nausea', fullPath: 'Stomach - Nausea' },
      { name: 'Vomiting', fullPath: 'Stomach - Vomiting', children: [
        { name: 'bile', fullPath: 'Stomach - Vomiting - bile' },
        { name: 'food', fullPath: 'Stomach - Vomiting - food' },
        { name: 'blood', fullPath: 'Stomach - Vomiting - blood' },
      ]},
      { name: 'Pain', fullPath: 'Stomach - Pain', children: [
        { name: 'burning', fullPath: 'Stomach - Pain - burning' },
        { name: 'cramping', fullPath: 'Stomach - Pain - cramping' },
        { name: 'pressing', fullPath: 'Stomach - Pain - pressing' },
      ]},
      { name: 'Thirst', fullPath: 'Stomach - Thirst' },
      { name: 'Thirstless', fullPath: 'Stomach - Thirstless' },
      { name: 'Appetite - increased', fullPath: 'Stomach - Appetite - increased' },
      { name: 'Appetite - lost', fullPath: 'Stomach - Appetite - lost' },
      { name: 'Eructations', fullPath: 'Stomach - Eructations' },
      { name: 'Heartburn', fullPath: 'Stomach - Heartburn' },
      { name: 'Distension', fullPath: 'Stomach - Distension' },
      { name: 'Heaviness', fullPath: 'Stomach - Heaviness' },
    ],
  },
  {
    name: 'Abdomen',
    nameDutch: 'Buik',
    icon: '🔘',
    subRubrics: [
      { name: 'Pain', fullPath: 'Abdomen - Pain', children: [
        { name: 'cramping', fullPath: 'Abdomen - Pain - cramping' },
        { name: 'burning', fullPath: 'Abdomen - Pain - burning' },
        { name: 'stitching', fullPath: 'Abdomen - Pain - stitching' },
        { name: 'inguinal region', fullPath: 'Abdomen - Pain - inguinal region' },
      ]},
      { name: 'Distension', fullPath: 'Abdomen - Distension' },
      { name: 'Flatulence', fullPath: 'Abdomen - Flatulence' },
      { name: 'Rumbling', fullPath: 'Abdomen - Rumbling' },
      { name: 'Heaviness', fullPath: 'Abdomen - Heaviness' },
      { name: 'Coldness', fullPath: 'Abdomen - Coldness' },
      { name: 'Inflammation', fullPath: 'Abdomen - Inflammation' },
      { name: 'Sensitive', fullPath: 'Abdomen - Sensitive' },
    ],
  },
  {
    name: 'Rectum',
    nameDutch: 'Rectum',
    icon: '🔻',
    subRubrics: [
      { name: 'Diarrhea', fullPath: 'Rectum - Diarrhea' },
      { name: 'Constipation', fullPath: 'Rectum - Constipation' },
      { name: 'Hemorrhoids', fullPath: 'Rectum - Hemorrhoids' },
      { name: 'Pain', fullPath: 'Rectum - Pain', children: [
        { name: 'burning', fullPath: 'Rectum - Pain - burning' },
        { name: 'cutting', fullPath: 'Rectum - Pain - cutting' },
      ]},
      { name: 'Urging', fullPath: 'Rectum - Urging' },
      { name: 'Involuntary stool', fullPath: 'Rectum - Involuntary stool' },
      { name: 'Itching', fullPath: 'Rectum - Itching' },
      { name: 'Flatus', fullPath: 'Rectum - Flatus' },
    ],
  },
  {
    name: 'Stool',
    nameDutch: 'Ontlasting',
    icon: '💩',
    subRubrics: [
      { name: 'Watery', fullPath: 'Stool - Watery' },
      { name: 'Hard', fullPath: 'Stool - Hard' },
      { name: 'Bloody', fullPath: 'Stool - Bloody' },
      { name: 'Mucous', fullPath: 'Stool - Mucous' },
      { name: 'Offensive', fullPath: 'Stool - Offensive' },
      { name: 'Frequent', fullPath: 'Stool - Frequent' },
      { name: 'Thin, liquid', fullPath: 'Stool - Thin, liquid' },
    ],
  },
  {
    name: 'Bladder',
    nameDutch: 'Blaas',
    icon: '🫧',
    subRubrics: [
      { name: 'Urging to urinate', fullPath: 'Bladder - Urging to urinate' },
      { name: 'Pain', fullPath: 'Bladder - Pain' },
      { name: 'Retention of urine', fullPath: 'Bladder - Retention of urine' },
      { name: 'Inflammation', fullPath: 'Bladder - Inflammation' },
      { name: 'Urination - frequent', fullPath: 'Bladder - Urination - frequent' },
      { name: 'Urination - involuntary', fullPath: 'Bladder - Urination - involuntary' },
    ],
  },
  {
    name: 'Kidneys',
    nameDutch: 'Nieren',
    icon: '🫘',
    subRubrics: [
      { name: 'Pain', fullPath: 'Kidneys - Pain' },
      { name: 'Inflammation', fullPath: 'Kidneys - Inflammation' },
      { name: 'Pain - stitching', fullPath: 'Kidneys - Pain - stitching' },
    ],
  },
  {
    name: 'Prostate Gland',
    nameDutch: 'Prostaat',
    icon: '⚕️',
    subRubrics: [
      { name: 'Inflammation', fullPath: 'Prostate Gland - Inflammation' },
      { name: 'Enlargement', fullPath: 'Prostate Gland - Enlargement' },
      { name: 'Pain', fullPath: 'Prostate Gland - Pain' },
    ],
  },
  {
    name: 'Urethra',
    nameDutch: 'Urethra',
    icon: '🔸',
    subRubrics: [
      { name: 'Pain', fullPath: 'Urethra - Pain' },
      { name: 'Pain - burning', fullPath: 'Urethra - Pain - burning' },
      { name: 'Discharge', fullPath: 'Urethra - Discharge' },
      { name: 'Itching', fullPath: 'Urethra - Itching' },
    ],
  },
  {
    name: 'Urine',
    nameDutch: 'Urine',
    icon: '🧪',
    subRubrics: [
      { name: 'Copious', fullPath: 'Urine - Copious' },
      { name: 'Scanty', fullPath: 'Urine - Scanty' },
      { name: 'Bloody', fullPath: 'Urine - Bloody' },
      { name: 'Cloudy', fullPath: 'Urine - Cloudy' },
      { name: 'Offensive', fullPath: 'Urine - Offensive' },
      { name: 'Dark', fullPath: 'Urine - Dark' },
    ],
  },
  {
    name: 'Male Genitalia/Sex',
    nameDutch: 'Mannelijke geslachtsdelen',
    icon: '♂️',
    subRubrics: [
      { name: 'Pain', fullPath: 'Male Genitalia/Sex - Pain' },
      { name: 'Swelling', fullPath: 'Male Genitalia/Sex - Swelling' },
      { name: 'Itching', fullPath: 'Male Genitalia/Sex - Itching' },
      { name: 'Inflammation', fullPath: 'Male Genitalia/Sex - Inflammation' },
      { name: 'Eruptions', fullPath: 'Male Genitalia/Sex - Eruptions' },
    ],
  },
  {
    name: 'Female Genitalia/Sex',
    nameDutch: 'Vrouwelijke geslachtsdelen',
    icon: '♀️',
    subRubrics: [
      { name: 'Menses - copious', fullPath: 'Female Genitalia/Sex - Menses - copious' },
      { name: 'Menses - painful', fullPath: 'Female Genitalia/Sex - Menses - painful' },
      { name: 'Menses - suppressed', fullPath: 'Female Genitalia/Sex - Menses - suppressed' },
      { name: 'Menses - late', fullPath: 'Female Genitalia/Sex - Menses - late' },
      { name: 'Menses - early', fullPath: 'Female Genitalia/Sex - Menses - early' },
      { name: 'Leucorrhoea', fullPath: 'Female Genitalia/Sex - Leucorrhoea' },
      { name: 'Pain', fullPath: 'Female Genitalia/Sex - Pain' },
      { name: 'Inflammation', fullPath: 'Female Genitalia/Sex - Inflammation' },
    ],
  },
  {
    name: 'Larynx & Trachea',
    nameDutch: 'Strottenhoofd & luchtpijp',
    icon: '🎤',
    subRubrics: [
      { name: 'Hoarseness', fullPath: 'Larynx & Trachea - Hoarseness' },
      { name: 'Pain', fullPath: 'Larynx & Trachea - Pain' },
      { name: 'Voice - lost', fullPath: 'Larynx & Trachea - Voice - lost' },
      { name: 'Voice - rough', fullPath: 'Larynx & Trachea - Voice - rough' },
      { name: 'Tickling', fullPath: 'Larynx & Trachea - Tickling' },
      { name: 'Constriction', fullPath: 'Larynx & Trachea - Constriction' },
    ],
  },
  {
    name: 'Respiration',
    nameDutch: 'Ademhaling',
    icon: '🌬️',
    subRubrics: [
      { name: 'Difficult', fullPath: 'Respiration - Difficult' },
      { name: 'Asthmatic', fullPath: 'Respiration - Asthmatic' },
      { name: 'Sighing', fullPath: 'Respiration - Sighing' },
      { name: 'Wheezing', fullPath: 'Respiration - Wheezing' },
      { name: 'Accelerated', fullPath: 'Respiration - Accelerated' },
      { name: 'Rattling', fullPath: 'Respiration - Rattling' },
    ],
  },
  {
    name: 'Cough',
    nameDutch: 'Hoest',
    icon: '🤧',
    subRubrics: [
      { name: 'Dry', fullPath: 'Cough - Dry' },
      { name: 'Loose', fullPath: 'Cough - Loose' },
      { name: 'Night', fullPath: 'Cough - Night' },
      { name: 'Barking', fullPath: 'Cough - Barking' },
      { name: 'Spasmodic', fullPath: 'Cough - Spasmodic' },
      { name: 'Constant', fullPath: 'Cough - Constant' },
      { name: 'Inspiration, on', fullPath: 'Cough - Inspiration, on' },
      { name: 'Tickling', fullPath: 'Cough - Tickling' },
    ],
  },
  {
    name: 'Expectoration',
    nameDutch: 'Ophoesten',
    icon: '💧',
    subRubrics: [
      { name: 'Bloody', fullPath: 'Expectoration - Bloody' },
      { name: 'Mucous', fullPath: 'Expectoration - Mucous' },
      { name: 'Yellow', fullPath: 'Expectoration - Yellow' },
      { name: 'Copious', fullPath: 'Expectoration - Copious' },
      { name: 'Difficult', fullPath: 'Expectoration - Difficult' },
    ],
  },
  {
    name: 'Chest',
    nameDutch: 'Borst',
    icon: '🫀',
    subRubrics: [
      { name: 'Pain', fullPath: 'Chest - Pain', children: [
        { name: 'stitching', fullPath: 'Chest - Pain - stitching' },
        { name: 'burning', fullPath: 'Chest - Pain - burning' },
        { name: 'pressing', fullPath: 'Chest - Pain - pressing' },
      ]},
      { name: 'Oppression', fullPath: 'Chest - Oppression' },
      { name: 'Palpitation', fullPath: 'Chest - Palpitation' },
      { name: 'Constriction', fullPath: 'Chest - Constriction' },
      { name: 'Inflammation', fullPath: 'Chest - Inflammation' },
      { name: 'Coldness', fullPath: 'Chest - Coldness' },
      { name: 'Heat', fullPath: 'Chest - Heat' },
      { name: 'Anxiety in', fullPath: 'Chest - Anxiety in' },
    ],
  },
  {
    name: 'Back',
    nameDutch: 'Rug',
    icon: '🦴',
    subRubrics: [
      { name: 'Pain', fullPath: 'Back - Pain', children: [
        { name: 'lumbar region', fullPath: 'Back - Pain - lumbar region' },
        { name: 'cervical region', fullPath: 'Back - Pain - cervical region' },
        { name: 'dorsal region', fullPath: 'Back - Pain - dorsal region' },
        { name: 'sacral region', fullPath: 'Back - Pain - sacral region' },
      ]},
      { name: 'Stiffness', fullPath: 'Back - Stiffness' },
      { name: 'Weakness', fullPath: 'Back - Weakness' },
      { name: 'Coldness', fullPath: 'Back - Coldness' },
      { name: 'Tension', fullPath: 'Back - Tension' },
    ],
  },
  {
    name: 'Extremities',
    nameDutch: 'Ledematen',
    icon: '🦵',
    subRubrics: [
      { name: 'Pain', fullPath: 'Extremities - Pain', children: [
        { name: 'joints', fullPath: 'Extremities - Pain - joints' },
        { name: 'rheumatic', fullPath: 'Extremities - Pain - rheumatic' },
        { name: 'upper limbs', fullPath: 'Extremities - Pain - upper limbs' },
        { name: 'lower limbs', fullPath: 'Extremities - Pain - lower limbs' },
      ]},
      { name: 'Coldness', fullPath: 'Extremities - Coldness', children: [
        { name: 'hands', fullPath: 'Extremities - Coldness - hands' },
        { name: 'foot', fullPath: 'Extremities - Coldness - foot' },
      ]},
      { name: 'Cramps', fullPath: 'Extremities - Cramps' },
      { name: 'Stiffness', fullPath: 'Extremities - Stiffness' },
      { name: 'Numbness', fullPath: 'Extremities - Numbness' },
      { name: 'Weakness', fullPath: 'Extremities - Weakness' },
      { name: 'Swelling', fullPath: 'Extremities - Swelling' },
      { name: 'Trembling', fullPath: 'Extremities - Trembling' },
      { name: 'Restlessness', fullPath: 'Extremities - Restlessness' },
      { name: 'Heaviness', fullPath: 'Extremities - Heaviness' },
    ],
  },
  {
    name: 'Sleep',
    nameDutch: 'Slaap',
    icon: '😴',
    subRubrics: [
      { name: 'Sleeplessness', fullPath: 'Sleep - Sleeplessness' },
      { name: 'Disturbed', fullPath: 'Sleep - Disturbed' },
      { name: 'Position', fullPath: 'Sleep - Position' },
      { name: 'Restless', fullPath: 'Sleep - Restless' },
      { name: 'Unrefreshing', fullPath: 'Sleep - Unrefreshing' },
      { name: 'Sleepiness', fullPath: 'Sleep - Sleepiness' },
    ],
  },
  {
    name: 'Dreams',
    nameDutch: 'Dromen',
    icon: '🌙',
    subRubrics: [
      { name: 'Frightful', fullPath: 'Dreams - Frightful' },
      { name: 'Vivid', fullPath: 'Dreams - Vivid' },
      { name: 'Anxious', fullPath: 'Dreams - Anxious' },
      { name: 'Of death', fullPath: 'Dreams - Death, of' },
      { name: 'Nightmares', fullPath: 'Dreams - Nightmares' },
    ],
  },
  {
    name: 'Chill',
    nameDutch: 'Koude rillingen',
    icon: '🥶',
    subRubrics: [
      { name: 'Shaking', fullPath: 'Chill - Shaking' },
      { name: 'Beginning in', fullPath: 'Chill - Beginning in' },
      { name: 'After exposure', fullPath: 'Chill - Exposure, after' },
      { name: 'With trembling', fullPath: 'Chill - Trembling, with' },
      { name: 'Coldness in general', fullPath: 'Chill - Coldness in general' },
    ],
  },
  {
    name: 'Fever',
    nameDutch: 'Koorts',
    icon: '🤒',
    subRubrics: [
      { name: 'Heat', fullPath: 'Fever - Heat' },
      { name: 'Burning', fullPath: 'Fever - Burning heat' },
      { name: 'Intermittent', fullPath: 'Fever - Intermittent' },
      { name: 'Night', fullPath: 'Fever - Night' },
      { name: 'With perspiration', fullPath: 'Fever - Perspiration, with' },
      { name: 'Intense heat', fullPath: 'Fever - Intense heat' },
    ],
  },
  {
    name: 'Perspiration',
    nameDutch: 'Zweten',
    icon: '💦',
    subRubrics: [
      { name: 'Profuse', fullPath: 'Perspiration - Profuse' },
      { name: 'Night', fullPath: 'Perspiration - Night' },
      { name: 'Cold', fullPath: 'Perspiration - Cold' },
      { name: 'Offensive', fullPath: 'Perspiration - Offensive' },
      { name: 'On exertion', fullPath: 'Perspiration - Exertion, on' },
      { name: 'During sleep', fullPath: 'Perspiration - Sleep, during' },
    ],
  },
  {
    name: 'Skin',
    nameDutch: 'Huid',
    icon: '🖐️',
    subRubrics: [
      { name: 'Eruptions', fullPath: 'Skin - Eruptions', children: [
        { name: 'vesicular', fullPath: 'Skin - Eruptions - vesicular' },
        { name: 'pustular', fullPath: 'Skin - Eruptions - pustular' },
        { name: 'herpetic', fullPath: 'Skin - Eruptions - herpetic' },
      ]},
      { name: 'Itching', fullPath: 'Skin - Itching' },
      { name: 'Dryness', fullPath: 'Skin - Dryness' },
      { name: 'Discoloration', fullPath: 'Skin - Discoloration' },
      { name: 'Urticaria', fullPath: 'Skin - Urticaria' },
      { name: 'Burning', fullPath: 'Skin - Burning' },
      { name: 'Sensitivity', fullPath: 'Skin - Sensitivity' },
      { name: 'Swelling', fullPath: 'Skin - Swelling' },
    ],
  },
  {
    name: 'Generals',
    nameDutch: 'Algemeenheden',
    icon: '⚡',
    subRubrics: [
      { name: 'Night agg', fullPath: 'Generals - Night agg' },
      { name: 'Morning agg', fullPath: 'Generals - Morning agg' },
      { name: 'Sun - exposure to sun', fullPath: 'Generals - Sun - exposure to sun' },
      { name: 'Cold agg', fullPath: 'Generals - Cold agg' },
      { name: 'Warmth amel', fullPath: 'Generals - Warmth amel' },
      { name: 'Motion agg', fullPath: 'Generals - Motion agg' },
      { name: 'Rest amel', fullPath: 'Generals - Rest amel' },
      { name: 'Food and drinks', fullPath: 'Generals - Food and drinks' },
      { name: 'Weather change agg', fullPath: 'Generals - Weather - change of, agg' },
      { name: 'Periodicity', fullPath: 'Generals - Periodicity' },
      { name: 'Weakness', fullPath: 'Generals - Weakness' },
      { name: 'Faintness', fullPath: 'Generals - Faintness' },
      { name: 'Inflammation', fullPath: 'Generals - Inflammation' },
      { name: 'Convulsions', fullPath: 'Generals - Convulsions' },
    ],
  },
];

// Zoekfunctie voor de sidebar
export function searchRepertory(query: string): RepertoryChapter[] {
  if (!query.trim() || query.length < 2) return repertoryChapters;

  const q = query.toLowerCase();

  return repertoryChapters
    .map(chapter => {
      const chapterMatch =
        chapter.name.toLowerCase().includes(q) ||
        chapter.nameDutch.toLowerCase().includes(q);

      const matchingSubRubrics = chapter.subRubrics.filter(sub => {
        const subMatch =
          sub.name.toLowerCase().includes(q) ||
          sub.fullPath.toLowerCase().includes(q);
        const childMatch = sub.children?.some(
          child =>
            child.name.toLowerCase().includes(q) ||
            child.fullPath.toLowerCase().includes(q)
        );
        return subMatch || childMatch;
      });

      if (chapterMatch) return chapter; // Toon heel hoofdstuk als naam matcht
      if (matchingSubRubrics.length > 0) {
        return { ...chapter, subRubrics: matchingSubRubrics };
      }
      return null;
    })
    .filter((ch): ch is RepertoryChapter => ch !== null);
}
