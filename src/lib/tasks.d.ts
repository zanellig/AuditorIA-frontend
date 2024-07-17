export type Tasks = Task[]
export type Task = {
  identifier: IDNeomirror
  status: Status
  task_type: string
  file_name: Filename
  language: Language
  created_at: Fecha
}

type Status =
  | "completed"
  | "processing"
  | "failed"
  | "COMPLETED"
  | "PROCESSING"
  | "FAILED"
type Language = "en" | "es"
type IDNeomirror = string
type Fecha = string
type Filename = string

// {
//   identifier: 'a741bba3-70ad-430b-82a7-d9e23d8cabe8',
//   status: 'completed',
//   task_type: 'full_process',
//   file_name: '1132130228-15311077-20240618185511.mp3',
//   language: 'es',
//   created_at: '2024-06-20T08:21:31'
// },

// IMPORTANT
export type GenericRequest = {
  task_type: string
  language: string
  file: BinaryData
  text: ?string
  save_to_db: boolean // false
  return_immediate: boolean // false
  diarize: boolean // false
  split_channels: boolean // false
  analyze_sentiment: boolean // false
}

export type SentimentType = "NEG" | "NEU" | "POS"

export type Segment = {
  end: number
  text: string
  start: number
  speaker: string
  analysis: SegmentAnalysisProperties
}

export type TranscriptionType = {
  status: Status
  result: {
    segments: Segment[]
  }
  error: null | string
  metadata: {
    audio_duration: number | null
    duration: number
    file_name: string
    language: Language
    task_params: {
      task: string
      model: string
      device: string
      threads: number
      language: string
      batch_size: number
      compute_type: string
      device_index: number
      max_speakers: number
      min_speakers: number
      align_model: string | null
      asr_options: {
        patience: number
        beam_size: number
        temperatures: number
        initial_prompt: string | null
        length_penalty: number
        suppress_tokens: number[]
        suppress_numerals: boolean
        log_prob_threshold: number
        no_speech_threshold: number
        compression_ratio_threshold: number
      }
      vad_options: {
        vad_onset: number
        vad_offset: number
      }
    }
    task_type: string
    url: string | null
  }
}

/*
  {
    "task_type": "Transcripcion + Diarizacion + Analisis Sentimiento",
    "task_params": {
        "task": "transcribe",
        "model": "large-v3",
        "device": "cuda",
        "threads": 0,
        "language": "es",
        "batch_size": 8,
        "align_model": null,
        "asr_options": {
            "patience": 1,
            "beam_size": 5,
            "temperatures": 0,
            "initial_prompt": null,
            "length_penalty": 1,
            "suppress_tokens": [
                -1
            ],
            "suppress_numerals": false,
            "log_prob_threshold": -1,
            "no_speech_threshold": 0.6,
            "compression_ratio_threshold": 2.4
        },
        "vad_options": {
            "vad_onset": 0.5,
            "vad_offset": 0.363
        },
        "compute_type": "float16",
        "device_index": 0,
        "max_speakers": 2,
        "min_speakers": 2,
        "interpolate_method": "nearest",
        "return_char_alignments": false
    },
    "language": "es",
    "file_name": "11703-15374692-20240702091824.mp3",
    "url": null,
    "duration": 45.8808,
    "audio_duration": null
}
 */

export type SegmentAnalysisProperties = {
  emotion: string
  sentiment: SentimentType
  hate_speech: string
  emotion_probas: EmotionProbas
  sentiment_probas: SentimentProbas
  hate_speech_probas: HateSpeechProbas
}

export type EmotionProbas = {
  joy: number
  fear: number
  anger: number
  others: number
  disgust: number
  sadness: number
  surprise: number
}

export type SentimentProbas = {
  NEG: number
  NEU: number
  POS: number
}

export type HateSpeechProbas = {
  hateful: number
  targeted: number
  aggressive: number
}

// MOCK request a PATCH segment
type PATCHSegment = {
  action: "modify"
  modification_type?:
    | "text"
    | "speaker"
    | "sentiment"
    | "emotion"
    | "hate_speech"
  task_type: "transcription" // NOT NULL
  segment_index: 3
  identifier: "uuid_del_task" // NOT NULL
  requester: "gonzalo.zanelli" | "ID_NEOTEL" // NOT NULL
  authorizer: "agustin.bouzon" | null
  status: "pending_authorization"
  text_original?: "Hola me caduco con Lucas"
  text_updated?: "Hola me comunico con Lucas"
  emotion_original?: "joy"
  emotion_updated?: "fear"
  sentiment_original?: "POS"
  sentiment_updated?: "NEG"
  speaker_original?: "SPEAKER_00"
  speaker_updated?: "SPEAKER_01"
  start: 6.02
  end: 8.43
}

/**
 * url = 'http://10.20.30.30:8000/speech-to-text'
    params = {
        'language': language,
        'task': task,
        'model': model,
        'device': device,
        'device_index': 0,
        'threads': 0,
        'batch_size': 10,
        'compute_type': 'float16',
        'interpolate_method': 'nearest',
        'return_char_alignments': 'false',
        'min_speakers': 1,
        'max_speakers': 2,
        'beam_size': 10,
        'patience': 1,
        'length_penalty': 1,
        'temperatures': 0,
        'compression_ratio_threshold': 2.4,
        'log_prob_threshold': -1,
        'no_speech_threshold': 0.6,
        'suppress_tokens': -1,
        'suppress_numerals': 'false',
        'vad_onset': 0.5,
        'vad_offset': 0.363
    }

response = requests.post(url, params=params, headers=headers, files=files)
 */

/**
 * curl -X 'POST' \
  'http://10.20.30.30:8000/speech-to-text?language=es&task=transcribe&model=large-v3&device=cuda&device_index=0&threads=0&batch_size=8&compute_type=float16&interpolate_method=nearest&return_char_alignments=false&beam_size=5&patience=1&length_penalty=1&temperatures=0&compression_ratio_threshold=2.4&log_prob_threshold=-1&no_speech_threshold=0.6&suppress_tokens=-1&suppress_numerals=false&vad_onset=0.5&vad_offset=0.363' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@1165762801-15293972-20240614093259.mp3;type=audio/mpeg'
 */

// {
//   "status": "Completo",
//   "result": {
//       "segments": [
//           {
//               "end": 3.978,
//               "text": " Contact center, buenos días, mi nombre es Lucas, con quien tengo el gusto de hablar.",
//               "start": 1.237,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.013123362325131891,
//                       "fear": 0.0007796105346642435,
//                       "anger": 0.0006305593415163457,
//                       "others": 0.981808602809906,
//                       "disgust": 0.0006178756593726575,
//                       "sadness": 0.0011585716856643558,
//                       "surprise": 0.0018814551876857877
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.014547147788107395,
//                       "NEU": 0.6416703462600708,
//                       "POS": 0.3437824845314026
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.01437643077224493,
//                       "targeted": 0.007726926822215319,
//                       "aggressive": 0.007029833272099495
//                   }
//               }
//           },
//           {
//               "end": 7.58,
//               "text": "Sí, buen día Lucas, yo soy el doctor Donato del Hospital Naval.",
//               "start": 3.998,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.01243017055094242,
//                       "fear": 0.0007419888279400766,
//                       "anger": 0.0004564009723253548,
//                       "others": 0.9830842614173888,
//                       "disgust": 0.0005774050368927419,
//                       "sadness": 0.001132105360738933,
//                       "surprise": 0.0015776377404108644
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.02521441876888275,
//                       "NEU": 0.6519670486450195,
//                       "POS": 0.3228185474872589
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.019260570406913757,
//                       "targeted": 0.007035186514258385,
//                       "aggressive": 0.008100524544715881
//                   }
//               }
//           },
//           {
//               "end": 23.788,
//               "text": "Mirá, estoy, quise entrar a al tu recibo de oncología radiante y no sé, intenté dos veces con la clave correcta me pareció y me puso que me lo bloqueó, viste?",
//               "start": 8.12,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEG",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.002861229469999671,
//                       "fear": 0.002444822108373046,
//                       "anger": 0.016698868945240974,
//                       "others": 0.9498854279518129,
//                       "disgust": 0.00603437889367342,
//                       "sadness": 0.011178219690918922,
//                       "surprise": 0.010897050611674786
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.6277569532394409,
//                       "NEU": 0.3632716536521912,
//                       "POS": 0.008971413597464561
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.023626508191227913,
//                       "targeted": 0.016712231561541557,
//                       "aggressive": 0.012298387475311756
//                   }
//               }
//           },
//           {
//               "end": 29.871,
//               "text": "Así que no sé, me tenés que hacer un blanqueo o no?",
//               "start": 24.769,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.0018860595300793648,
//                       "fear": 0.0030349395237863064,
//                       "anger": 0.0029976055957376957,
//                       "others": 0.9730167388916016,
//                       "disgust": 0.0014156748075038197,
//                       "sadness": 0.002700147219002247,
//                       "surprise": 0.01494873594492674
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.10622208565473557,
//                       "NEU": 0.871715784072876,
//                       "POS": 0.022062096744775772
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.06940647959709167,
//                       "targeted": 0.011384768411517143,
//                       "aggressive": 0.022406166419386864
//                   }
//               }
//           },
//           {
//               "end": 30.792,
//               "text": "Si me guardo un instante...",
//               "start": 29.931,
//               "speaker": "SPEAKER_00",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.027384400367736816,
//                       "fear": 0.0025902907364070415,
//                       "anger": 0.004347419366240501,
//                       "others": 0.8614513874053955,
//                       "disgust": 0.0032568415626883507,
//                       "sadness": 0.09234295785427094,
//                       "surprise": 0.008626763708889484
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.09835390746593475,
//                       "NEU": 0.7291225790977478,
//                       "POS": 0.17252345383167267
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.03313896059989929,
//                       "targeted": 0.012077218852937222,
//                       "aggressive": 0.021258877590298653
//                   }
//               }
//           },
//           {
//               "end": 33.178,
//               "text": " ¿Está reglificando el sistema?",
//               "start": 32.037,
//               "speaker": "SPEAKER_00",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.0007346220663748682,
//                       "fear": 0.002922552404925227,
//                       "anger": 0.0007821738254278898,
//                       "others": 0.9778413772583008,
//                       "disgust": 0.000756691733840853,
//                       "sadness": 0.0015466591576114297,
//                       "surprise": 0.01541581191122532
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.34248510003089905,
//                       "NEU": 0.6240619421005249,
//                       "POS": 0.03345295041799545
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.08540703356266022,
//                       "targeted": 0.010237299837172031,
//                       "aggressive": 0.01608731783926487
//                   }
//               }
//           },
//           {
//               "end": 34.318,
//               "text": "Sí.",
//               "start": 34.138,
//               "speaker": "SPEAKER_00",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.1962425857782364,
//                       "fear": 0.016453389078378677,
//                       "anger": 0.009468372911214828,
//                       "others": 0.699422299861908,
//                       "disgust": 0.006130476016551256,
//                       "sadness": 0.031361017376184464,
//                       "surprise": 0.040921907871961594
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.1430424600839615,
//                       "NEU": 0.4860915243625641,
//                       "POS": 0.370866060256958
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.07332728803157806,
//                       "targeted": 0.022988414391875267,
//                       "aggressive": 0.036197107285261154
//                   }
//               }
//           },
//           {
//               "end": 38.541,
//               "text": "¿Su nombre sería Hugo?",
//               "start": 37.56,
//               "speaker": "SPEAKER_00",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.002368055516853929,
//                       "fear": 0.0015007026959210634,
//                       "anger": 0.0006213240558281541,
//                       "others": 0.979385495185852,
//                       "disgust": 0.0007668330799788237,
//                       "sadness": 0.0009511009557172656,
//                       "surprise": 0.014406513422727585
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.10995203256607056,
//                       "NEU": 0.8468508124351501,
//                       "POS": 0.04319712892174721
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.03961233049631119,
//                       "targeted": 0.01571453921496868,
//                       "aggressive": 0.00916519109159708
//                   }
//               }
//           },
//           {
//               "end": 39.842,
//               "text": "Sí, Hugo Donato.",
//               "start": 39.021,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.01531154103577137,
//                       "fear": 0.0010889676632359624,
//                       "anger": 0.0020372658036649227,
//                       "others": 0.9688767790794371,
//                       "disgust": 0.001589034218341112,
//                       "sadness": 0.0063122776336967945,
//                       "surprise": 0.004784058313816786
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.1797527372837067,
//                       "NEU": 0.6317459940910339,
//                       "POS": 0.1885012835264206
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.02679813653230667,
//                       "targeted": 0.011620346456766129,
//                       "aggressive": 0.012630158104002476
//                   }
//               }
//           },
//           {
//               "end": 45.645,
//               "text": "Hugo, le comento que su usuario no se encuentra bloqueado en este momento.",
//               "start": 39.922,
//               "speaker": "SPEAKER_00",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.0013743845047429204,
//                       "fear": 0.0006869854987598956,
//                       "anger": 0.0006021696608513594,
//                       "others": 0.9946044087409972,
//                       "disgust": 0.00042173900874331594,
//                       "sadness": 0.0013044547522440553,
//                       "surprise": 0.0010059196501970291
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.06745392829179764,
//                       "NEU": 0.8580660223960876,
//                       "POS": 0.0744800716638565
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.01184802781790495,
//                       "targeted": 0.00806666724383831,
//                       "aggressive": 0.006694822572171688
//                   }
//               }
//           },
//           {
//               "end": 46.245,
//               "text": "¿Por qué me...?",
//               "start": 45.765,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEG",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.03214802220463753,
//                       "fear": 0.054216381162405014,
//                       "anger": 0.09442749619483948,
//                       "others": 0.6459320187568665,
//                       "disgust": 0.017451468855142593,
//                       "sadness": 0.02510884217917919,
//                       "surprise": 0.13071578741073608
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.7792933583259583,
//                       "NEU": 0.19230927526950836,
//                       "POS": 0.028397327288985252
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.12646470963954926,
//                       "targeted": 0.049637991935014725,
//                       "aggressive": 0.05484781414270401
//                   }
//               }
//           },
//           {
//               "end": 48.086,
//               "text": "Usuario bloqueado.",
//               "start": 47.166,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.013721643947064877,
//                       "fear": 0.001970990328118205,
//                       "anger": 0.004230947233736515,
//                       "others": 0.958975911140442,
//                       "disgust": 0.003817056771367788,
//                       "sadness": 0.005881476681679487,
//                       "surprise": 0.011402084492146969
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.3847015798091888,
//                       "NEU": 0.5547923445701599,
//                       "POS": 0.06050606071949005
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.037846531718969345,
//                       "targeted": 0.020412776619195935,
//                       "aggressive": 0.02212329208850861
//                   }
//               }
//           },
//           {
//               "end": 53.249,
//               "text": "Tengo acá el Disma con tu recibo y dije... No entiendo.",
//               "start": 48.186,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.0010251057101413608,
//                       "fear": 0.0032034481409937143,
//                       "anger": 0.002933948300778866,
//                       "others": 0.978283166885376,
//                       "disgust": 0.0014131598873063922,
//                       "sadness": 0.004482528194785118,
//                       "surprise": 0.008658569306135178
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.4116966128349304,
//                       "NEU": 0.5774262547492981,
//                       "POS": 0.010877142660319803
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.03308837488293648,
//                       "targeted": 0.010363592766225338,
//                       "aggressive": 0.012537273578345776
//                   }
//               }
//           },
//           {
//               "end": 60.994,
//               "text": "Por eso, aparte, no sé cómo... A ver, voy a tratar de...",
//               "start": 53.309,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.0019698147661983967,
//                       "fear": 0.0009738080552779138,
//                       "anger": 0.0007994033512659371,
//                       "others": 0.9906401634216307,
//                       "disgust": 0.00020689521625172347,
//                       "sadness": 0.0037990687415003777,
//                       "surprise": 0.0016109038842841985
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.18064849078655243,
//                       "NEU": 0.7867447137832642,
//                       "POS": 0.03260679170489311
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.023100296035408977,
//                       "targeted": 0.00938721839338541,
//                       "aggressive": 0.018074477091431614
//                   }
//               }
//           },
//           {
//               "end": 65.746,
//               "text": " Salir y entrar de nuevo.",
//               "start": 61.903,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.011710070073604584,
//                       "fear": 0.00361143727786839,
//                       "anger": 0.001305599813349545,
//                       "others": 0.9589455127716064,
//                       "disgust": 0.0017077322117984297,
//                       "sadness": 0.0077978442423045635,
//                       "surprise": 0.014921843074262142
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.040568869560956955,
//                       "NEU": 0.740847647190094,
//                       "POS": 0.21858349442481995
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.07662637531757355,
//                       "targeted": 0.011589504778385162,
//                       "aggressive": 0.035002920776605606
//                   }
//               }
//           },
//           {
//               "end": 67.607,
//               "text": "Disculpe la molestia.",
//               "start": 66.466,
//               "speaker": "SPEAKER_00",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.006144626997411251,
//                       "fear": 0.004009158816188574,
//                       "anger": 0.003515078919008374,
//                       "others": 0.9682365655899048,
//                       "disgust": 0.0012868935009464622,
//                       "sadness": 0.008497334085404873,
//                       "surprise": 0.008310278877615929
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.33360597491264343,
//                       "NEU": 0.527401328086853,
//                       "POS": 0.13899272680282593
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.030042653903365135,
//                       "targeted": 0.01107499562203884,
//                       "aggressive": 0.013292510993778706
//                   }
//               }
//           },
//           {
//               "end": 72.17,
//               "text": "Tu recibo tendría que hablar con recursos humanos para que les bloqueen el usuario.",
//               "start": 68.648,
//               "speaker": "SPEAKER_00",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEG",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.0004373379342723638,
//                       "fear": 0.0011314763687551022,
//                       "anger": 0.0020944057032465935,
//                       "others": 0.9929607510566713,
//                       "disgust": 0.000656650576274842,
//                       "sadness": 0.001073070103302598,
//                       "surprise": 0.0016463419888168571
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.8243101835250854,
//                       "NEU": 0.16693982481956482,
//                       "POS": 0.00875004567205906
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.1605895608663559,
//                       "targeted": 0.014860724098980429,
//                       "aggressive": 0.05165008828043938
//                   }
//               }
//           },
//           {
//               "end": 74.832,
//               "text": "Ah, con recursos humanos.",
//               "start": 73.551,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.003529556794092059,
//                       "fear": 0.0008033827180042863,
//                       "anger": 0.004414983093738556,
//                       "others": 0.9784038066864014,
//                       "disgust": 0.0013539138017222283,
//                       "sadness": 0.00764587614685297,
//                       "surprise": 0.003848511260002851
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.13733181357383728,
//                       "NEU": 0.7533767819404602,
//                       "POS": 0.10929140448570251
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.17200566828250885,
//                       "targeted": 0.007474932353943586,
//                       "aggressive": 0.03967578336596489
//                   }
//               }
//           },
//           {
//               "end": 76.673,
//               "text": "Pero vos decís que no está bloqueado.",
//               "start": 75.012,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.0015611768467351794,
//                       "fear": 0.0006889089127071202,
//                       "anger": 0.0008476414950564504,
//                       "others": 0.9892442226409912,
//                       "disgust": 0.001014993409626186,
//                       "sadness": 0.002047336893156171,
//                       "surprise": 0.004595729522407055
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.26019394397735596,
//                       "NEU": 0.704053521156311,
//                       "POS": 0.035752587020397186
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.017148902639746666,
//                       "targeted": 0.009302249178290369,
//                       "aggressive": 0.010538400150835514
//                   }
//               }
//           },
//           {
//               "end": 82.817,
//               "text": "Yo no tengo acceso a tu recibo.",
//               "start": 78.794,
//               "speaker": "SPEAKER_00",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEG",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.0014381424989551306,
//                       "fear": 0.0010278221452608705,
//                       "anger": 0.0017317896708846092,
//                       "others": 0.992264986038208,
//                       "disgust": 0.00090934889158234,
//                       "sadness": 0.0013658913085237143,
//                       "surprise": 0.0012621249770745635
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.5635346174240112,
//                       "NEU": 0.40891921520233154,
//                       "POS": 0.027546217665076256
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.09641133248806,
//                       "targeted": 0.02090258896350861,
//                       "aggressive": 0.027919339016079903
//                   }
//               }
//           },
//           {
//               "end": 87.68,
//               "text": "Lo que sería tu recibo no tengo acceso para verificar si es bloqueado o no su usuario.",
//               "start": 82.837,
//               "speaker": "SPEAKER_00",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.0005799980717711151,
//                       "fear": 0.0007030504639260471,
//                       "anger": 0.000743407872505486,
//                       "others": 0.9953415393829346,
//                       "disgust": 0.00041744892951101065,
//                       "sadness": 0.0010232191998511553,
//                       "surprise": 0.0011912337504327295
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.4159756004810333,
//                       "NEU": 0.5729351043701172,
//                       "POS": 0.01108931005001068
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.05943906679749489,
//                       "targeted": 0.01751963421702385,
//                       "aggressive": 0.022828396409749985
//                   }
//               }
//           },
//           {
//               "end": 89.542,
//               "text": "Bueno, ok.",
//               "start": 88.801,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "POS",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.04690760374069214,
//                       "fear": 0.006562780123203993,
//                       "anger": 0.0059789023362100124,
//                       "others": 0.8923078775405884,
//                       "disgust": 0.0038917262572795153,
//                       "sadness": 0.026293227449059486,
//                       "surprise": 0.01805792562663555
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.07570528239011765,
//                       "NEU": 0.43829345703125,
//                       "POS": 0.486001193523407
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.04756517335772514,
//                       "targeted": 0.015352316200733185,
//                       "aggressive": 0.0261649489402771
//                   }
//               }
//           },
//           {
//               "end": 90.202,
//               "text": "Gracias, eh.",
//               "start": 89.582,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "joy",
//                   "sentiment": "POS",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.8167003989219666,
//                       "fear": 0.0027054802048951387,
//                       "anger": 0.002877434715628624,
//                       "others": 0.15463367104530334,
//                       "disgust": 0.0027314401231706142,
//                       "sadness": 0.005955804139375687,
//                       "surprise": 0.01439580600708723
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.05459757149219513,
//                       "NEU": 0.1820687800645828,
//                       "POS": 0.7633336782455444
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.018975427374243736,
//                       "targeted": 0.012326530180871488,
//                       "aggressive": 0.014450235292315485
//                   }
//               }
//           },
//           {
//               "end": 111.324,
//               "text": " si no me podes desbloquear esto a ver si entro por google que habitualmente es más fácil un segundito",
//               "start": 93.96,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEG",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.0027334459591656923,
//                       "fear": 0.0012437665136530995,
//                       "anger": 0.0033804660197347403,
//                       "others": 0.985238790512085,
//                       "disgust": 0.0009570736438035964,
//                       "sadness": 0.002259691245853901,
//                       "surprise": 0.004186857491731644
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.6815164089202881,
//                       "NEU": 0.30896055698394775,
//                       "POS": 0.009523063898086548
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.03475022315979004,
//                       "targeted": 0.017958220094442368,
//                       "aggressive": 0.02011347189545631
//                   }
//               }
//           },
//           {
//               "end": 122.233,
//               "text": " No, está usuario bloqueado.",
//               "start": 120.151,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.0013800614979118109,
//                       "fear": 0.0006350649637170136,
//                       "anger": 0.0013062023790553212,
//                       "others": 0.992717981338501,
//                       "disgust": 0.0008283784845843911,
//                       "sadness": 0.0015532185789197683,
//                       "surprise": 0.0015791563782840967
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.3764508068561554,
//                       "NEU": 0.5936547517776489,
//                       "POS": 0.029894432052969933
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.027922524139285088,
//                       "targeted": 0.011562109924852848,
//                       "aggressive": 0.013950619846582413
//                   }
//               }
//           },
//           {
//               "end": 126.517,
//               "text": "Bueno, entonces me va a decir que ya me... A recursos humanos.",
//               "start": 122.874,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEU",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.0028454274870455265,
//                       "fear": 0.0018456984544172883,
//                       "anger": 0.0010644685244187713,
//                       "others": 0.9843631386756896,
//                       "disgust": 0.0008356320322491229,
//                       "sadness": 0.003837568685412407,
//                       "surprise": 0.005207995418459177
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.08561696857213974,
//                       "NEU": 0.8489819169044495,
//                       "POS": 0.0654011219739914
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.06708241999149323,
//                       "targeted": 0.030036918818950653,
//                       "aggressive": 0.03454393520951271
//                   }
//               }
//           },
//           {
//               "end": 129.34,
//               "text": "Claro, recursos humanos le estará bloqueando al usuario.",
//               "start": 126.537,
//               "speaker": "SPEAKER_00",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "NEG",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.0005434067570604384,
//                       "fear": 0.000926908804103732,
//                       "anger": 0.0029817395843565464,
//                       "others": 0.9913039207458496,
//                       "disgust": 0.001002953969873488,
//                       "sadness": 0.0019288018811494112,
//                       "surprise": 0.0013122012605890632
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.6882782578468323,
//                       "NEU": 0.3031103312969208,
//                       "POS": 0.00861138291656971
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.06481635570526123,
//                       "targeted": 0.010652003809809685,
//                       "aggressive": 0.018154330551624295
//                   }
//               }
//           },
//           {
//               "end": 131.642,
//               "text": "Bueno, ok, gracias.",
//               "start": 130.06,
//               "speaker": "SPEAKER_01",
//               "analysis": {
//                   "emotion": "others",
//                   "sentiment": "POS",
//                   "hate_speech": "",
//                   "emotion_probas": {
//                       "joy": 0.035088974982500076,
//                       "fear": 0.0033819396048784256,
//                       "anger": 0.00442105159163475,
//                       "others": 0.9349793791770936,
//                       "disgust": 0.00238670757971704,
//                       "sadness": 0.010104847140610218,
//                       "surprise": 0.009637166745960712
//                   },
//                   "sentiment_probas": {
//                       "NEG": 0.04462883621454239,
//                       "NEU": 0.37992972135543823,
//                       "POS": 0.5754415392875671
//                   },
//                   "hate_speech_probas": {
//                       "hateful": 0.04672994092106819,
//                       "targeted": 0.011827919632196426,
//                       "aggressive": 0.019238803535699844
//                   }
//               }
//           }
//       ]
//   },
//   "metadata": {
//       "task_type": "Transcripcion + Diarizacion + Analisis Sentimiento",
//       "task_params": {
//           "task": "transcribe",
//           "model": "large-v3",
//           "device": "cuda",
//           "threads": 0,
//           "language": "es",
//           "batch_size": 8,
//           "align_model": null,
//           "asr_options": {
//               "patience": 1,
//               "beam_size": 5,
//               "temperatures": 0,
//               "initial_prompt": null,
//               "length_penalty": 1,
//               "suppress_tokens": [
//                   -1
//               ],
//               "suppress_numerals": false,
//               "log_prob_threshold": -1,
//               "no_speech_threshold": 0.6,
//               "compression_ratio_threshold": 2.4
//           },
//           "vad_options": {
//               "vad_onset": 0.5,
//               "vad_offset": 0.363
//           },
//           "compute_type": "float16",
//           "device_index": 0,
//           "max_speakers": 2,
//           "min_speakers": 2,
//           "interpolate_method": "nearest",
//           "return_char_alignments": false
//       },
//       "language": "es",
//       "file_name": "11703-15374692-20240702091824.mp3",
//       "url": null,
//       "duration": 45.8808,
//       "audio_duration": null
//   },
//   "error": null
// }
